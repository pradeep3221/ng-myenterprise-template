import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdminHeaderComponent } from './components/admin-header.component';
import { AdminSidebarComponent } from './components/admin-sidebar.component';
import { AdminFooterComponent } from './components/admin-footer.component';
import { SidebarService } from './services/sidebar.service';

/**
 * Admin Layout Component
 * Main layout shell with Material sidenav, header, sidebar, footer, and router-outlet
 * Responsive design: sidebar collapses on small screens (< 960px)
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminFooterComponent
  ],
  template: `
    <div class="admin-layout-wrapper">
      <!-- Header -->
      <app-admin-header (menuToggle)="onMenuToggle()"></app-admin-header>

      <!-- Main Content with Sidenav -->
      <mat-sidenav-container class="sidenav-container">
        <!-- Sidebar Drawer -->
        <mat-sidenav
          #drawer
          [opened]="sidebarOpen()"
          [mode]="sidebarMode()"
          [disableClose]="!isMobile()"
          class="sidebar-drawer"
        >
          <app-admin-sidebar></app-admin-sidebar>
        </mat-sidenav>

        <!-- Main Content Area -->
        <mat-sidenav-content class="main-content">
          <!-- Router Outlet for Feature Routes -->
          <main class="page-content">
            <router-outlet></router-outlet>
          </main>

          <!-- Footer -->
          <app-admin-footer></app-admin-footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }

      .admin-layout-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      app-admin-header {
        flex-shrink: 0;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .sidenav-container {
        flex: 1;
        overflow: hidden;
      }

      .sidebar-drawer {
        width: 280px;
        background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
        border-right: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);

        @media (max-width: 960px) {
          width: 260px;
        }

        @media (max-width: 600px) {
          width: 240px;
        }
      }

      .main-content {
        display: flex;
        flex-direction: column;
        overflow: auto;
        background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%);

        ::ng-deep {
          .mat-sidenav-content {
            display: flex;
            flex-direction: column;
          }
        }
      }

      .page-content {
        flex: 1;
        padding: 32px;
        overflow-y: auto;
        animation: fadeIn 0.3s ease-in;

        @media (max-width: 960px) {
          padding: 24px;
        }

        @media (max-width: 600px) {
          padding: 16px;
        }

        @media (max-width: 360px) {
          padding: 12px;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Responsive layout adjustments */
      @media (max-width: 960px) {
        .sidebar-drawer {
          width: 260px;
        }
      }

      @media (max-width: 600px) {
        .sidebar-drawer {
          width: 100%;
          max-width: 280px;
        }

        .page-content {
          padding: 16px 12px;
        }
      }
    `
  ]
})
export class AdminLayoutComponent {
  sidebarService = inject(SidebarService);

  // Sidebar state
  sidebarOpen = this.sidebarService.sidebarOpen;

  // Screen size tracking
  private screenWidth = signal<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Computed values for responsive behavior
  isMobile = computed(() => this.screenWidth() < 960);
  sidebarMode = computed(() => (this.isMobile() ? 'over' : 'side'));

  constructor() {
    // Close sidebar on navigation for mobile
    if (typeof window !== 'undefined') {
      this.onWindowResize();
    }
  }

  /**
   * Handle menu toggle from header
   */
  onMenuToggle(): void {
    this.sidebarService.toggleSidebar();
  }

  /**
   * Listen to window resize events for responsive behavior
   */
  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window !== 'undefined') {
      const newWidth = window.innerWidth;
      this.screenWidth.set(newWidth);

      // Auto-close sidebar on mobile when resizing from desktop
      if (newWidth < 960 && this.sidebarOpen()) {
        this.sidebarService.closeSidebar();
      }
    }
  }
}
