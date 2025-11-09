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
        padding: 8px 0;
        height: 100%;
        overflow-y: auto;

        // Custom scrollbar
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;

          &:hover {
            background: #999;
          }
        }
      }

      .nav-item {
        margin: 0 8px;
        border-radius: 4px;
        color: rgba(0, 0, 0, 0.87);
        transition: all 0.2s ease;

        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }

        &.active {
          background-color: rgba(63, 81, 181, 0.12);
          color: #3f51b5;
          font-weight: 500;

          mat-icon {
            color: #3f51b5;
          }
        }

        mat-icon {
          margin-right: 16px;
          transition: color 0.2s ease;
        }
      }

      .submenu-item {
        padding-left: 56px;
        font-size: 13px;
        margin: 0 8px;

        &.active {
          background-color: rgba(63, 81, 181, 0.08);
          color: #3f51b5;
        }
      }

      @media (max-width: 600px) {
        .admin-sidebar {
          padding: 4px 0;
        }

        .nav-item {
          margin: 0 4px;

          mat-icon {
            margin-right: 12px;
          }
        }

        .submenu-item {
          padding-left: 48px;
          font-size: 12px;
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
