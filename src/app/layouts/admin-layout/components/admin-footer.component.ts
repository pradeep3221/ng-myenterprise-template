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
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        margin-top: auto;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);

        mat-divider {
          margin: 0;
          opacity: 0.5;
        }
      }

      .footer-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 32px;
        gap: 24px;
        flex-wrap: wrap;
      }

      .footer-section {
        display: flex;
        align-items: center;
        gap: 16px;

        &.version {
          margin-left: auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 6px 16px;
          border-radius: 20px;
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.25);
        }
      }

      .copyright {
        margin: 0;
        font-size: 13px;
        color: #555;
        font-weight: 400;
      }

      .footer-nav {
        display: flex;
        gap: 28px;
        align-items: center;
      }

      .footer-link {
        font-size: 13px;
        color: #667eea;
        text-decoration: none;
        transition: all 0.3s ease;
        font-weight: 500;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        &:hover {
          color: #764ba2;
          transform: translateY(-2px);

          &::after {
            width: 100%;
          }
        }
      }

      .version-text {
        font-size: 12px;
        color: #ffffff;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      @media (max-width: 768px) {
        .footer-content {
          flex-direction: column;
          align-items: flex-start;
          padding: 16px 24px;
          gap: 16px;
        }

        .footer-section {
          width: 100%;

          &.version {
            margin-left: 0;
            width: auto;
          }
        }

        .footer-nav {
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-link {
          font-size: 12px;
        }
      }

      @media (max-width: 480px) {
        .footer-content {
          padding: 12px 16px;
        }

        .copyright {
          font-size: 11px;
        }

        .footer-nav {
          gap: 16px;
        }

        .footer-link {
          font-size: 11px;
        }

        .version-text {
          font-size: 11px;
        }
      }
    `
  ]
})
export class AdminFooterComponent {
  currentYear = new Date().getFullYear();
}
