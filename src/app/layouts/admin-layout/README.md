# Admin Layout Documentation

## Overview

The **Admin Layout** is a responsive, reusable Material Design shell for the admin dashboard. It includes:

- 🧭 **Sidebar Navigation** - Collapsible Material sidenav with nested menu items
- 📜 **Header Toolbar** - Material toolbar with menu toggle, app title, and user profile menu
- 📄 **Footer** - Copyright and footer links
- 🧩 **Main Content Area** - Router outlet for feature routes
- 📱 **Responsive Design** - Auto-collapsible sidebar on screens < 960px (desktop: side drawer, mobile: overlay)

## Folder Structure

```
app/layouts/admin-layout/
├── admin-layout.component.ts      # Main layout shell (Material sidenav + router-outlet)
├── components/
│   ├── admin-header.component.ts  # Header with toolbar, menu toggle, user menu
│   ├── admin-sidebar.component.ts # Sidebar with navigation menu
│   └── admin-footer.component.ts  # Footer with copyright and links
├── services/
│   └── sidebar.service.ts         # Sidebar state management (Signals-based)
└── index.ts                       # Barrel exports
```

## Key Features

### 1. **Responsive Sidebar**
- **Desktop (≥960px):** Side drawer (persistent)
- **Mobile (<960px):** Overlay drawer (dismissible)
- Auto-closes on small screens when resizing from desktop
- Smooth animations with Material CDK

### 2. **State Management with Signals**
The layout uses Angular Signals for sidebar visibility (no RxJS overhead):

```typescript
// SidebarService (core/state pattern)
sidebarOpen: signal<boolean>          // Public read-only signal
toggleSidebar(): void                  // Toggle state
setSidebarOpen(open: boolean): void    // Set explicitly
closeSidebar(): void                   // Close sidebar
```

### 3. **Navigation Menu**
The sidebar supports:
- Single-level menu items with icons
- Nested/collapsible menu items (parent + children)
- Active route highlighting via `routerLinkActive="active"`
- Material icons for visual consistency

**Current Menu Items:**
```
Dashboard          → /admin/dashboard
Orders            → /orders
Customers         → /admin/customers
Reports           → /admin/reports
  ├─ Sales        → /admin/reports/sales
  └─ Analytics    → /admin/reports/analytics
Settings          → /admin/settings
  ├─ General      → /admin/settings/general
  └─ Users        → /admin/settings/users
```

### 4. **Header Features**
- Menu toggle button (hamburger icon)
- App title display
- User profile dropdown menu
- Notification badge (placeholder with count)
- Responsive text sizing

### 5. **Footer**
- Copyright year (auto-updated)
- Footer navigation links
- Version display
- Responsive multi-column layout

---

## Usage

### Integration into Routes

The layout wraps all feature routes as the main shell. Routes are nested under the layout component:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,  // Layout shell
    children: [
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes)
      },
      { path: '', redirectTo: 'orders', pathMatch: 'full' }
    ]
  }
];
```

### Add New Menu Items

Edit `AdminSidebarComponent.navItems`:

```typescript
navItems: NavItem[] = [
  {
    label: 'Products',
    icon: 'inventory',
    route: '/admin/products'
  },
  {
    label: 'Manage',
    icon: 'admin_panel_settings',
    route: '/admin/manage',
    children: [
      { label: 'Users', icon: 'group', route: '/admin/manage/users' },
      { label: 'Roles', icon: 'security', route: '/admin/manage/roles' }
    ]
  }
];
```

### Toggle Sidebar Programmatically

Inject `SidebarService` and call methods:

```typescript
import { SidebarService } from '@app/layouts/admin-layout';

export class MyComponent {
  sidebarService = inject(SidebarService);

  onNavigate() {
    // Close sidebar after navigation on mobile
    this.sidebarService.closeSidebar();
  }
}
```

---

## Responsive Breakpoints

| Breakpoint | Sidebar Mode | Behavior |
|-----------|--------------|----------|
| ≥ 960px   | `side`       | Persistent sidebar, main content slides |
| 960px – 600px | `over`    | Overlay drawer, main content stays |
| < 600px   | `over`       | Narrower sidebar (240px), smaller padding |

**Viewport Sizes:**
- Desktop: 1920px, 1440px, 1024px
- Tablet: 768px, 600px
- Mobile: 480px, 360px

---

## Material Components Used

| Component | Module | Purpose |
|-----------|--------|---------|
| `MatToolbar` | MatToolbarModule | Header bar |
| `MatSidenav` | MatSidenavModule | Sidebar drawer |
| `MatNavList` | MatListModule | Navigation menu |
| `MatIcon` | MatIconModule | Icons (menu, dashboard, etc.) |
| `MatButton` | MatButtonModule | Buttons (toggle, menu triggers) |
| `MatMenu` | MatMenuModule | Dropdown user menu |
| `MatBadge` | MatBadgeModule | Notification badge |
| `MatDivider` | MatDividerModule | Dividers in menu/footer |

---

## Styling & Theme

### Layout Container
- Full viewport height (`height: 100vh`)
- Flexbox layout (column direction)
- Header fixed at top, content scrolls below

### Color Scheme
- **Primary Color:** `#1976d2` (Material Blue)
- **Active Menu Item:** Primary with light background
- **Sidebar Background:** `#fafafa` (light gray)
- **Footer Background:** `#f5f5f5` (slightly darker gray)

### Custom SCSS Variables
All styling uses inline SCSS in components. Common variables:

```scss
$primary-color: #3f51b5;
$sidebar-width: 280px;
$sidebar-width-sm: 256px;
$sidebar-width-xs: 240px;
$toolbar-height: 64px;
$transition-speed: 0.2s;
```

### Dark Mode Support
Extend `admin-layout.component.ts` styles with dark mode classes:

```scss
:host-context(.dark) {
  .admin-layout-wrapper {
    background-color: #121212;
  }

  .sidebar-drawer {
    background-color: #1e1e1e;
  }

  .page-content {
    background-color: #121212;
  }
}
```

---

## Performance Considerations

1. **Lazy Loading:** Feature routes lazy-load via `loadChildren`
2. **Signals:** Sidebar state uses Signals (no RxJS subscription overhead)
3. **OnPush Detection:** Components use `ChangeDetectionStrategy.OnPush` (recommended)
4. **Router Outlet:** Single outlet at layout level; features handle their own nested routes

---

## Customization Guide

### Change Sidebar Width

Edit `admin-layout.component.ts` styles:

```typescript
.sidebar-drawer {
  width: 320px;  // Increase from 280px
  
  @media (max-width: 960px) {
    width: 300px;
  }
}
```

### Customize Header Color

Edit `AdminHeaderComponent.template`:

```typescript
<mat-toolbar color="accent">  // Change from "primary"
```

Or use custom color:

```typescript
<mat-toolbar [ngStyle]="{ 'background-color': '#6F00FF', 'color': 'white' }">
```

### Add Profile Picture

Edit `AdminHeaderComponent.template` user menu trigger:

```typescript
<img src="user.avatar" alt="User" class="user-avatar" />
```

And add styles:

```typescript
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
```

### Enable Nested Menu Expansion

Currently, nested items are always visible. To collapse/expand them:

```typescript
// Add to AdminSidebarComponent
expandedItems = signal<Set<string>>(new Set());

toggleExpanded(label: string): void {
  this.expandedItems.update(set => {
    const newSet = new Set(set);
    if (newSet.has(label)) newSet.delete(label);
    else newSet.add(label);
    return newSet;
  });
}
```

---

## Testing

### Unit Tests

Test sidebar toggle behavior:

```typescript
import { TestBed } from '@angular/core/testing';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
  let service: SidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarService);
  });

  it('should toggle sidebar', (done) => {
    expect(service.sidebarOpen()).toBe(true);
    service.toggleSidebar();
    expect(service.sidebarOpen()).toBe(false);
    done();
  });
});
```

### E2E Tests (Cypress/Playwright)

Test responsive behavior:

```javascript
describe('Admin Layout Responsiveness', () => {
  it('should show overlay sidebar on mobile', () => {
    cy.viewport(480, 800);
    cy.get('mat-sidenav').should('have.attr', 'mode', 'over');
  });

  it('should show side drawer on desktop', () => {
    cy.viewport(1440, 900);
    cy.get('mat-sidenav').should('have.attr', 'mode', 'side');
  });
});
```

---

## Troubleshooting

### Sidebar Not Collapsing on Mobile

**Issue:** Sidebar stays open on mobile screens.

**Solution:** Verify `SidebarService` is being used in `admin-layout.component.ts`:

```typescript
onWindowResize(): void {
  if (typeof window !== 'undefined') {
    const newWidth = window.innerWidth;
    this.screenWidth.set(newWidth);

    // This auto-closes sidebar on mobile
    if (newWidth < 960 && this.sidebarOpen()) {
      this.sidebarService.closeSidebar();
    }
  }
}
```

### Content Not Scrolling

**Issue:** Main content area doesn't scroll with overflow.

**Solution:** Ensure `.main-content` has `overflow: auto`:

```typescript
.main-content {
  display: flex;
  flex-direction: column;
  overflow: auto;  // ← Ensure this is set
}
```

### Material Icons Not Showing

**Issue:** Icons display as question marks.

**Solution:** Ensure Material Icons are loaded in `index.html`:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

---

## Future Enhancements

- [ ] Collapsible nested menus (accordion style)
- [ ] Sidebar mini-mode (collapsed with icons only)
- [ ] Search functionality in header
- [ ] User notifications panel
- [ ] Theme switcher (dark/light mode toggle)
- [ ] Breadcrumb navigation
- [ ] Customizable sidebar colors per theme
- [ ] Analytics integration for menu click tracking

---

## Resources

- [Angular Material Sidenav](https://material.angular.io/components/sidenav/)
- [Angular Material Toolbar](https://material.angular.io/components/toolbar/)
- [Angular Signals Documentation](https://angular.io/guide/signals)
- [Responsive Design Best Practices](https://material.io/design/platform-guidance/android-bars.html#system-bars)

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Angular Version:** 19.2+  
**Material Version:** 19.2+
