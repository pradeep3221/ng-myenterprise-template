import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Admin Header Component
 * Displays toolbar with menu toggle, app title, and user profile menu
 */
@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule, RouterModule],
  template: `
    <mat-toolbar color="primary" class="admin-header">
      <div class="toolbar-start">
        <!-- Menu Toggle Button -->
        <button
          mat-icon-button
          (click)="menuToggle.emit()"
          class="menu-toggle"
          aria-label="Toggle sidebar"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <!-- App Title -->
        <span class="app-title">Enterprise Admin</span>
      </div>

      <div class="toolbar-spacer"></div>

      <div class="toolbar-end">
        <!-- User Menu -->
        <button
          mat-icon-button
          [matMenuTriggerFor]="userMenu"
          class="user-menu-trigger"
          aria-label="User menu"
        >
          <mat-icon>account_circle</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item disabled>
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item disabled>
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="onLogout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>

        <!-- Notifications (placeholder) -->
        <button
          mat-icon-button
          class="notification-icon"
          aria-label="Notifications"
        >
          <mat-icon matBadge="3" matBadgeColor="warn" matBadgeSize="small">
            notifications
          </mat-icon>
        </button>
      </div>
    </mat-toolbar>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .admin-header {
        display: flex;
        align-items: center;
        padding: 0 16px;
        gap: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .toolbar-start {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .toolbar-spacer {
        flex: 1 1 auto;
      }

      .toolbar-end {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .app-title {
        font-size: 20px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      .menu-toggle {
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }

      .notification-icon {
        position: relative;
      }

      @media (max-width: 600px) {
        .app-title {
          font-size: 16px;
        }

        .admin-header {
          padding: 0 8px;
          gap: 4px;
        }
      }
    `
  ]
})
export class AdminHeaderComponent {
  authService = inject(AuthService);
  menuToggle = output<void>();

  onLogout(): void {
    this.authService.logout();
    // Router navigation will be handled by route guard
  }
}
