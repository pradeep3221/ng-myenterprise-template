import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarService } from '../services/sidebar.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  children?: NavItem[];
}

/**
 * Admin Sidebar Component
 * Displays navigation menu with Material icons
 * Supports nested menu items
 */
@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-nav-list class="admin-sidebar">
      <!-- Main Menu Items -->
      @for (item of navItems; track item.route) {
        @if (!item.children || item.children.length === 0) {
          <!-- Single Menu Item -->
          <a
            mat-list-item
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
          >
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        } @else {
          <!-- Collapsible Menu Item (parent) -->
          <mat-list-item>
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </mat-list-item>

          <!-- Submenu Items -->
          @for (child of item.children; track child.route) {
            <a
              mat-list-item
              [routerLink]="child.route"
              routerLinkActive="active"
              class="nav-item submenu-item"
            >
              <span matListItemTitle>{{ child.label }}</span>
            </a>
          }
        }
      }
    </mat-nav-list>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .admin-sidebar {
        padding: 16px 0;
        height: 100%;
        overflow-y: auto;

        // Custom scrollbar
        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.3);
          border-radius: 4px;
          transition: background 0.2s;

          &:hover {
            background: rgba(102, 126, 234, 0.5);
          }
        }
      }

      .nav-item {
        margin: 4px 12px;
        border-radius: 8px;
        color: rgba(0, 0, 0, 0.87);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 14px;
        height: 48px;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        &:hover {
          background: linear-gradient(90deg, 
            rgba(102, 126, 234, 0.08) 0%, 
            rgba(118, 75, 162, 0.08) 100%);
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);

          &::before {
            transform: scaleY(1);
          }
        }

        &.active {
          background: linear-gradient(135deg, 
            rgba(102, 126, 234, 0.15) 0%, 
            rgba(118, 75, 162, 0.15) 100%);
          color: #667eea;
          font-weight: 600;
          box-shadow: 0 3px 10px rgba(102, 126, 234, 0.2);

          &::before {
            transform: scaleY(1);
          }

          mat-icon {
            color: #667eea;
            transform: scale(1.1);
          }
        }

        mat-icon {
          margin-right: 16px;
          transition: all 0.3s ease;
          color: rgba(0, 0, 0, 0.6);
        }
      }

      .submenu-item {
        padding-left: 56px;
        font-size: 13px;
        margin: 2px 12px;
        height: 44px;
        border-radius: 6px;

        &::before {
          display: none;
        }

        &:hover {
          background: rgba(102, 126, 234, 0.06);
          transform: translateX(8px);
        }

        &.active {
          background: rgba(102, 126, 234, 0.12);
          color: #667eea;
          font-weight: 500;
        }
      }

      @media (max-width: 600px) {
        .admin-sidebar {
          padding: 12px 0;
        }

        .nav-item {
          margin: 2px 8px;
          height: 44px;

          mat-icon {
            margin-right: 12px;
          }
        }

        .submenu-item {
          padding-left: 48px;
          font-size: 12px;
          height: 40px;
        }
      }
    `
  ]
})
export class AdminSidebarComponent {
  sidebarService = inject(SidebarService);

  // Navigation menu items
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'Orders',
      icon: 'shopping_cart',
      route: '/orders'
    },
    {
      label: 'Customers',
      icon: 'people',
      route: '/admin/customers'
    },
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/admin/reports',
      children: [
        {
          label: 'Sales',
          icon: 'trending_up',
          route: '/admin/reports/sales'
        },
        {
          label: 'Analytics',
          icon: 'analytics',
          route: '/admin/reports/analytics'
        }
      ]
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/admin/settings',
      children: [
        {
          label: 'General',
          icon: 'tune',
          route: '/admin/settings/general'
        },
        {
          label: 'Users',
          icon: 'group',
          route: '/admin/settings/users'
        }
      ]
    }
  ];
}
