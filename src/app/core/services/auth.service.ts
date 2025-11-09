import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { APP_CONFIG } from '../config/app-config.token';
import { PublicClientApplication, AuthenticationResult, RedirectRequest } from '@azure/msal-browser';

/**
 * Authentication Service
 * Supports:
 * - Microsoft Entra External ID (Azure AD)
 * - Legacy token-based auth
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private config = inject(APP_CONFIG);
  private platformId = inject(PLATFORM_ID);
  private tokenSignal = signal<string | null>(this.readToken());
  private loadingSignal = signal<boolean>(false);
  private userSignal = signal<any>(this.readMsalUser());
  private msalInstance: PublicClientApplication | null = null;
  private refreshTimerId: any = null;
  private readonly refreshSkewMs = 120_000; // proactive refresh 2 minutes before expiry

  get token() { return this.tokenSignal(); }
  get loading() { return this.loadingSignal(); }
  get user() { return this.userSignal(); }
  
  isAuthenticated() {
    // Check both token and MSAL user
    const hasToken = !!this.tokenSignal();
    const hasUser = !!this.userSignal();
    const hasMsalUser = this.readMsalUser() !== null;
    
    console.log('🔍 [AUTH-SERVICE] isAuthenticated check:', {
      hasToken,
      hasUser,
      hasMsalUser,
      result: hasToken || hasUser || hasMsalUser
    });
    
    return hasToken || hasUser || hasMsalUser;
  }

  /** Force refresh signals from storage (used after login callback/session resume) */
  refreshFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = this.readToken();
    const user = this.readMsalUser();
    console.log('🔄 [AUTH-SERVICE] refreshFromStorage', { hasToken: !!token, hasUser: !!user });
    this.tokenSignal.set(token);
    this.userSignal.set(user);
    // Clear any stale in-progress marker we may have set
    try { sessionStorage.removeItem('msal.inProgress'); } catch {}
  }

  /**
   * Login with Azure AD (Entra External ID)
   */
  async login(tokenOrRedirect?: string): Promise<void> {
    console.log('🟢 [AUTH-SERVICE] login() called');
    
    // Check if Azure AD is configured
    const azureADConfig = this.config.auth?.azureAD;
    
    if (azureADConfig && azureADConfig.clientId && azureADConfig.tenantId) {
      console.log('🟢 [AUTH-SERVICE] Azure AD configured, initiating redirect login');
      await this.loginWithAzureAD();
    } else if (tokenOrRedirect) {
      console.log('🟢 [AUTH-SERVICE] Using legacy token-based login');
      // Legacy token-based login
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.config.auth?.tokenStorageKey || 'auth_token', tokenOrRedirect);
      }
      this.tokenSignal.set(tokenOrRedirect);
    } else {
      console.warn('🟡 [AUTH-SERVICE] No Azure AD config and no token provided');
    }
  }

  /**
   * Azure AD login with redirect
   */
  private async loginWithAzureAD(): Promise<void> {
    const azureADConfig = this.config.auth?.azureAD;
    if (!azureADConfig) return;

    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      console.log('🔐 [AZURE-AD] Skipping login - not in browser');
      return;
    }

    this.loadingSignal.set(true);

    try {
      const msalInstance = await this.ensureMsalInitialized();
      console.log('🔐 [AZURE-AD] MSAL instance ready');

      // If MSAL (or we) think an interaction is already in progress, do not start another
      if (this.isMsalInteractionInProgress()) {
        console.log('🔐 [AZURE-AD] Interaction already in progress, skipping loginRedirect');
        this.loadingSignal.set(false);
        return;
      }

      // Check if there's already an interaction in progress
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        console.log('🔐 [AZURE-AD] Account already exists, setting user');
        this.userSignal.set(accounts[0]);
        this.loadingSignal.set(false);
        return;
      }

      // Check if redirect is in progress
      const response = await msalInstance.handleRedirectPromise();
      if (response) {
        console.log('🔐 [AZURE-AD] Redirect response received:', response);
        this.userSignal.set(response.account);
        const res = await this.trySilentToken(msalInstance, azureADConfig.scopes);
        if (res?.expiresOn) this.scheduleProactiveRefresh(res.expiresOn, azureADConfig.scopes);
        this.loadingSignal.set(false);
        return;
      }

      const loginRequest: RedirectRequest = {
        scopes: azureADConfig.scopes || ['openid', 'profile', 'User.Read'],
        prompt: 'select_account'
      };

      console.log('🔐 [AZURE-AD] Calling loginRedirect...');
      try { sessionStorage.setItem('msal.inProgress', '1'); } catch {}
      await msalInstance.loginRedirect(loginRequest);
      console.log('🔐 [AZURE-AD] loginRedirect called - browser should redirect now');
      
    } catch (error: any) {
      console.error('❌ [AZURE-AD] Login failed:', error);
      this.loadingSignal.set(false);
      
      // If interaction is in progress, just ignore the error
      if (error.errorCode === 'interaction_in_progress') {
        console.log('🔐 [AZURE-AD] Interaction already in progress, ignoring');
        return;
      }
      
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const azureADConfig = this.config.auth?.azureAD;
    
    if (azureADConfig && azureADConfig.clientId) {
      try {
        const msalInstance = await this.ensureMsalInitialized();
        // Ensure no pending redirect to avoid overlap
        const pending = await msalInstance.handleRedirectPromise();
        if (pending) {
          console.log('🔐 [AZURE-AD] Pending redirect completed just before logout; aborting logout');
          this.userSignal.set(pending.account);
          this.refreshFromStorage();
          return;
        }
        // Attempt silent token refresh before logout (for logging/audit scenarios)
  try { await this.trySilentToken(msalInstance, azureADConfig.scopes); } catch {}
        if (this.isMsalInteractionInProgress()) {
          console.log('🔐 [AZURE-AD] Interaction in progress at logout, skipping');
          return;
        }
        const accounts = msalInstance.getAllAccounts();
        const account = accounts.length > 0 ? accounts[0] : undefined;
        try { sessionStorage.setItem('msal.inProgress', '1'); } catch {}
        await msalInstance.logoutRedirect({
          account,
          postLogoutRedirectUri: azureADConfig.postLogoutRedirectUri || azureADConfig.redirectUri
        });
      } catch (err: any) {
        console.error('❌ [AZURE-AD] Logout failed:', err);
        if (err?.errorCode === 'interaction_in_progress') {
          console.log('🔐 [AZURE-AD] Interaction already in progress during logout, ignoring');
          return;
        }
        // Fallback: clear local state
        this.clearLocalAuthState();
      } finally {
        try { sessionStorage.removeItem('msal.inProgress'); } catch {}
      }
    } else {
      // Legacy logout
      this.clearLocalAuthState();
    }
  }

  private clearLocalAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.config.auth?.tokenStorageKey || 'auth_token');
        localStorage.removeItem('msal_user');
      } catch {}
    }
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    if (this.refreshTimerId) {
      clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  private readToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.config.auth?.tokenStorageKey || 'auth_token');
  }

  private readMsalUser(): any | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const userJson = localStorage.getItem('msal_user');
      if (userJson) {
        return JSON.parse(userJson);
      }
    } catch (e) {
      console.error('Failed to parse MSAL user from localStorage', e);
    }
    return null;
  }

  private async ensureMsalInitialized(): Promise<PublicClientApplication> {
    const azureADConfig = this.config.auth?.azureAD;
    if (!azureADConfig) {
      throw new Error('Azure AD configuration missing');
    }
    if (this.msalInstance) {
      return this.msalInstance;
    }
    const instance = new PublicClientApplication({
      auth: {
        clientId: azureADConfig.clientId,
        authority: `https://login.microsoftonline.com/${azureADConfig.tenantId}`,
        redirectUri: azureADConfig.redirectUri,
        postLogoutRedirectUri: azureADConfig.postLogoutRedirectUri || azureADConfig.redirectUri,
        navigateToLoginRequestUrl: true
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
      }
    });
    await instance.initialize();
    this.msalInstance = instance;
    return instance;
  }

  /** Public accessor for MSAL instance (used by callback component) */
  async getMsalInstance(): Promise<PublicClientApplication> {
    return this.ensureMsalInitialized();
  }

  private isMsalInteractionInProgress(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const msalFlag = sessionStorage.getItem('msal.interaction.status') === 'interaction_in_progress';
      const ourFlag = sessionStorage.getItem('msal.inProgress') === '1';
      return !!(msalFlag || ourFlag);
    } catch {
      return false;
    }
  }

  private async trySilentToken(msalInstance: PublicClientApplication, scopes?: string[]): Promise<AuthenticationResult | null> {
    try {
      const allAccounts = msalInstance.getAllAccounts();
      if (allAccounts.length === 0) return null;
      const account = allAccounts[0];
      const tokenScopes = scopes && scopes.length ? scopes : ['User.Read'];
      console.log('🔄 [AZURE-AD] Attempting silent token acquisition', tokenScopes);
      const result: AuthenticationResult = await msalInstance.acquireTokenSilent({
        account,
        scopes: tokenScopes
      });
      if (result?.accessToken) {
        localStorage.setItem(this.config.auth?.tokenStorageKey || 'auth_token', result.accessToken);
        this.tokenSignal.set(result.accessToken);
        console.log('✅ [AZURE-AD] Silent token acquired exp:', result.expiresOn);
        return result;
      }
      return null;
    } catch (err: any) {
      if (err?.errorCode === 'no_tokens_found' || err?.errorCode === 'user_null') {
        console.warn('⚠️ [AZURE-AD] Silent token acquisition skipped: no cached session');
        return null;
      }
      console.warn('⚠️ [AZURE-AD] Silent token acquisition failed', err);
      return null;
    }
  }

  private scheduleProactiveRefresh(expiresOn: Date, scopes?: string[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.refreshTimerId) {
      clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }
    const now = Date.now();
    const target = expiresOn.getTime() - this.refreshSkewMs;
    const delay = Math.max(target - now, 5_000); // minimum 5s
    console.log('⏱️ [AZURE-AD] Scheduling proactive token refresh in', Math.round(delay/1000), 'seconds');
    this.refreshTimerId = setTimeout(async () => {
      try {
        const msal = await this.ensureMsalInitialized();
        const res = await this.trySilentToken(msal, scopes);
        if (res?.expiresOn) this.scheduleProactiveRefresh(res.expiresOn, scopes);
      } catch (e) {
        console.warn('⚠️ [AZURE-AD] Proactive refresh attempt failed', e);
      }
    }, delay);
  }

  /** Public helper for components to ensure an access token exists and is stored */
  async acquireTokenSilentAndStore(): Promise<string | null> {
    try {
      const msal = await this.ensureMsalInitialized();
      const allAccounts = msal.getAllAccounts();
      if (allAccounts.length === 0) return null;
      const account = allAccounts[0];
      const cfgScopes = this.config.auth?.azureAD?.scopes;
      const tokenScopes = cfgScopes && cfgScopes.length ? cfgScopes : ['User.Read'];
      const result = await msal.acquireTokenSilent({ account, scopes: tokenScopes });
      if (result?.accessToken) {
        localStorage.setItem(this.config.auth?.tokenStorageKey || 'auth_token', result.accessToken);
        this.tokenSignal.set(result.accessToken);
        if (result.expiresOn) this.scheduleProactiveRefresh(result.expiresOn, tokenScopes);
        return result.accessToken;
      }
      return null;
    } catch (e: any) {
      console.warn('⚠️ [AZURE-AD] acquireTokenSilentAndStore failed', e);
      return null;
    }
  }

  /** Get access token for a given resource endpoint (matches protectedResources entries) */
  async getAccessTokenForRequest(url: string): Promise<string | null> {
    const cfg = this.config.auth?.azureAD?.protectedResources;
    if (!cfg) return this.tokenSignal();
    // Find first resource whose endpoint is a prefix of the url
    const match = Object.values(cfg).find(r => url.startsWith(r.endpoint));
    if (!match) return this.tokenSignal();
    return this.getAccessTokenForScopes(match.scopes);
  }

  /** Acquire token for explicit scopes array */
  async getAccessTokenForScopes(scopes: string[]): Promise<string | null> {
    try {
      const msal = await this.ensureMsalInitialized();
      const accounts = msal.getAllAccounts();
      if (accounts.length === 0) return null;
      const result = await msal.acquireTokenSilent({ account: accounts[0], scopes });
      if (result?.accessToken) {
        return result.accessToken;
      }
      return null;
    } catch (err) {
      console.warn('⚠️ [AZURE-AD] getAccessTokenForScopes silent acquisition failed', err);
      return null;
    }
  }
}
