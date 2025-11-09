import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

/**
 * Admin Footer Component
 * Displays copyright and footer links
 */
@Component({
  selector: 'app-admin-footer',
  standalone: true,
  imports: [CommonModule, MatDividerModule, RouterModule],
  template: `
    <footer class="admin-footer">
      <mat-divider></mat-divider>
      <div class="footer-content">
        <div class="footer-section">
          <p class="copyright">
            &copy; {{ currentYear }} Enterprise Admin Dashboard. All rights reserved.
          </p>
        </div>

        <div class="footer-section">
          <nav class="footer-nav">
            <a href="#" class="footer-link">Privacy Policy</a>
            <a href="#" class="footer-link">Terms of Service</a>
            <a href="#" class="footer-link">Contact Support</a>
            <a href="#" class="footer-link">Documentation</a>
          </nav>
        </div>

        <div class="footer-section version">
          <span class="version-text">v1.0.0</span>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .admin-footer {
        background-color: #f5f5f5;
        border-top: 1px solid #e0e0e0;
        margin-top: auto;

        mat-divider {
          margin: 0;
        }
      }

      .footer-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        gap: 24px;
        flex-wrap: wrap;
      }

      .footer-section {
        display: flex;
        align-items: center;
        gap: 16px;

        &.version {
          margin-left: auto;
        }
      }

      .copyright {
        margin: 0;
        font-size: 12px;
        color: #666;
      }

      .footer-nav {
        display: flex;
        gap: 24px;
        align-items: center;
      }

      .footer-link {
        font-size: 12px;
        color: #1976d2;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #1565c0;
          text-decoration: underline;
        }
      }

      .version-text {
        font-size: 12px;
        color: #999;
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .footer-content {
          flex-direction: column;
          align-items: flex-start;
          padding: 12px 16px;
          gap: 12px;
        }

        .footer-section {
          width: 100%;

          &.version {
            margin-left: 0;
          }
        }

        .footer-nav {
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-link {
          font-size: 11px;
        }
      }

      @media (max-width: 480px) {
        .footer-content {
          padding: 8px 12px;
        }

        .copyright {
          font-size: 11px;
        }

        .footer-nav {
          gap: 12px;
        }

        .footer-link {
          font-size: 10px;
        }
      }
    `
  ]
})
export class AdminFooterComponent {
  currentYear = new Date().getFullYear();
}
