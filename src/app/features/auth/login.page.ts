import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { APP_CONFIG } from '../../core/config/app-config.token';
import { PublicClientApplication } from '@azure/msal-browser';

/**
 * Login Page Component
 * 
 * Supports Microsoft Entra External ID (Azure AD) authentication
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>lock</mat-icon>
            Sign In
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (authService.loading) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Authenticating...</p>
            </div>
          } @else {
            <div class="login-options">
              @if (isAzureADEnabled()) {
                <p class="info-text">
                  Sign in securely with Microsoft Entra External ID
                </p>

                <button 
                  mat-raised-button 
                  color="primary" 
                  class="login-btn"
                  (click)="loginWithAzureAD()"
                  type="button">
                  <mat-icon>login</mat-icon>
                  Sign in with Microsoft
                </button>
              } @else {
                <p class="warning-text">
                  ⚠️ Azure AD is not configured. 
                  Please update public/config.json with your Azure AD settings.
                </p>
                <pre class="config-example">{{configExample}}</pre>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      max-width: 500px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      display: flex;
      justify-content: center;
      padding: 24px 24px 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 500;
      color: #333;
    }

    mat-card-content {
      padding: 24px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      gap: 16px;
    }

    .authenticated-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }

    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
    }

    .login-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-text {
      text-align: center;
      color: #666;
      margin: 0 0 8px 0;
    }

    .warning-text {
      padding: 16px;
      background: #fff3cd;
      color: #856404;
      border-radius: 4px;
      border: 1px solid #ffeaa7;
      margin: 0;
    }

    .config-example {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-size: 11px;
      overflow-x: auto;
      margin: 8px 0 0 0;
    }

    .login-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    button {
      margin-top: 8px;
    }
  `]
})
export class LoginPage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly config = inject(APP_CONFIG);
  private returnUrl: string | null = null;

  readonly isAzureADEnabled = computed(() => {
    const azureAD = this.config.auth?.azureAD;
    const hasAzureAD = !!(azureAD && azureAD.clientId && azureAD.tenantId);
    console.log('🔍 [LOGIN-PAGE] isAzureADEnabled check:', {
      hasAuth: !!this.config.auth,
      hasAzureAD: !!azureAD,
      clientId: azureAD?.clientId,
      tenantId: azureAD?.tenantId,
      result: hasAzureAD
    });
    return hasAzureAD;
  });

  readonly configExample = `"auth": {
  "azureAD": {
    "clientId": "your-client-id",
    "tenantId": "your-tenant-id",
    "redirectUri": "http://localhost:4200/auth/callback",
    "postLogoutRedirectUri": "http://localhost:4200",
    "scopes": ["openid", "profile", "User.Read"]
  }
}`;

  async loginWithAzureAD(): Promise<void> {
    console.log('🔵 [LOGIN-PAGE] loginWithAzureAD() called');
    try {
      console.log('🔵 [LOGIN-PAGE] Calling authService.login()...');
      // Persist returnUrl so callback can restore it
      if (this.returnUrl) {
        sessionStorage.setItem('returnUrl', this.returnUrl);
      }
      await this.authService.login();
      console.log('🔵 [LOGIN-PAGE] authService.login() completed (or redirected)');
    } catch (error: any) {
      console.error('❌ [LOGIN-PAGE] Login failed', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error: any) {
      console.error('Logout failed', error);
    }
  }

  async goToDashboard(): Promise<void> {
    await this.router.navigate(['/']);
  }

  async ngOnInit(): Promise<void> {
    // Capture returnUrl if provided by guard
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    console.log('🔁 [LOGIN-PAGE] ngOnInit, returnUrl =', this.returnUrl);
    if (this.returnUrl) {
      sessionStorage.setItem('returnUrl', this.returnUrl);
    }

    // If already authenticated, optionally redirect
    if (this.authService.isAuthenticated()) {
      await this.router.navigateByUrl(this.returnUrl || '/');
      return;
    }

    // Try to resume session from MSAL cache
    await this.resumeSessionIfPossible();
  }

  private async resumeSessionIfPossible(): Promise<void> {
    const azureAD = this.config.auth?.azureAD;
    if (!azureAD) return;

    try {
      const pca = new PublicClientApplication({
        auth: {
          clientId: azureAD.clientId,
          authority: `https://login.microsoftonline.com/${azureAD.tenantId}`,
          redirectUri: azureAD.redirectUri
        },
        cache: { cacheLocation: 'localStorage' }
      });
      await pca.initialize();
      // Ensure no pending redirect is waiting to be processed
      await pca.handleRedirectPromise();
      const accounts = pca.getAllAccounts();
      console.log('🔁 [LOGIN-PAGE] resumeSessionIfPossible accounts:', accounts.length);
      if (accounts.length > 0) {
        // Persist lightweight user info for our AuthService
        localStorage.setItem('msal_user', JSON.stringify(accounts[0]));
        await this.authService.acquireTokenSilentAndStore();
        this.authService.refreshFromStorage();
        // Navigate back to intended URL or dashboard
        await this.router.navigateByUrl(this.returnUrl || '/');
      }
    } catch (e) {
      console.warn('⚠️ [LOGIN-PAGE] resumeSessionIfPossible failed:', e);
    }
  }
}
