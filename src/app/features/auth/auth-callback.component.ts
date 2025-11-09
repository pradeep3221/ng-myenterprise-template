import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicClientApplication } from '@azure/msal-browser';
import { AuthService } from '../../core/services/auth.service';
import { APP_CONFIG } from '../../core/config/app-config.token';

/**
 * Auth Callback Component
 * Handles OAuth redirect callback from Microsoft Entra External ID
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Processing authentication...</p>
      @if (error) {
        <div class="error">{{ error }}</div>
      }
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 20px;
    }

    .error {
      color: #f44336;
      padding: 16px;
      background: #ffebee;
      border-radius: 4px;
      max-width: 500px;
      text-align: center;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private router = inject(Router);
  private config = inject(APP_CONFIG);
  private auth = inject(AuthService);
  error: string | null = null;

  async ngOnInit() {
    console.log('🔄 [AUTH-CALLBACK] Component initialized');
    
    try {
      const azureADConfig = this.config.auth?.azureAD;
      
      if (!azureADConfig) {
        throw new Error('Azure AD configuration not found');
      }

      const authority = `https://login.microsoftonline.com/${azureADConfig.tenantId}`;
      
      console.log('🔄 [AUTH-CALLBACK] Getting MSAL instance from AuthService');
      const msalInstance = await this.auth.getMsalInstance?.() ?? new PublicClientApplication({
        auth: { clientId: azureADConfig.clientId, authority, redirectUri: azureADConfig.redirectUri },
        cache: { cacheLocation: 'localStorage' }
      });
      if ((msalInstance as any).initialize) {
        await (msalInstance as any).initialize();
      }
      console.log('🔄 [AUTH-CALLBACK] MSAL instance initialized');

      // Handle redirect response
      const response = await msalInstance.handleRedirectPromise();
      console.log('🔄 [AUTH-CALLBACK] Redirect response:', response);

      if (response) {
        console.log('✅ [AUTH-CALLBACK] Authentication successful!');
        console.log('User:', response.account);
        
        // Store the access token in localStorage so AuthService can detect it
        if (response.accessToken) {
          const tokenKey = this.config.auth?.tokenStorageKey || 'auth_token';
          localStorage.setItem(tokenKey, response.accessToken);
          console.log('✅ [AUTH-CALLBACK] Token stored in localStorage');
        }
        
        // Store user info
        localStorage.setItem('msal_user', JSON.stringify(response.account));
        console.log('✅ [AUTH-CALLBACK] User info stored');
  this.auth.refreshFromStorage();
  // Redirect to intended returnUrl if present
  // Ensure we have a fresh access token for APIs
  try { await this.auth.acquireTokenSilentAndStore?.(); } catch {}
  const returnUrl = sessionStorage.getItem('returnUrl');
  sessionStorage.removeItem('returnUrl');
  console.log('🔄 [AUTH-CALLBACK] Redirecting to', returnUrl || '/');
  await this.router.navigateByUrl(returnUrl || '/');
      } else {
        console.warn('⚠️ [AUTH-CALLBACK] No response from redirect');
        // Check if user is already logged in
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          console.log('✅ [AUTH-CALLBACK] User already authenticated');
          localStorage.setItem('msal_user', JSON.stringify(accounts[0]));
          this.auth.refreshFromStorage();
          const returnUrl = sessionStorage.getItem('returnUrl');
          sessionStorage.removeItem('returnUrl');
          try { await this.auth.acquireTokenSilentAndStore?.(); } catch {}
          await this.router.navigateByUrl(returnUrl || '/');
        } else {
          // No response means user wasn't redirected here from login
          await this.router.navigate(['/login']);
        }
      }
    } catch (err: any) {
      console.error('❌ [AUTH-CALLBACK] Error:', err);
      this.error = err.message || 'Authentication failed';
      
      // Redirect to login after showing error
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    }
  }
}
