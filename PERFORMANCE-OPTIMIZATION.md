# Performance Optimization Guide

## Current Performance Issues (Lighthouse Audit)

### Critical Metrics
- **First Contentful Paint (FCP):** 13.4s → Target: < 1.8s
- **Largest Contentful Paint (LCP):** 22.2s → Target: < 2.5s  
- **Speed Index:** 13.4s → Target: < 3.4s
- **Total Blocking Time (TBT):** 240ms → Target: < 200ms
- **Bundle Size:** 3,810 KiB → Target: < 1,000 KiB

### Main Issues Identified
1. ✅ **Render-blocking resources** (450ms penalty)
2. ✅ **Font display optimization** (80ms penalty)
3. ⚠️ **Unused JavaScript** (1,258 KiB)
4. ⚠️ **Unused CSS** (94 KiB from Material theme)
5. ⚠️ **JavaScript minification** (1,316 KiB potential savings)
6. ⚠️ **Large network payloads** (3,810 KiB total)

---

## ✅ Optimizations Already Applied

### 1. SSR Removal (Completed)
- Removed `@angular/platform-server`, `@angular/ssr`, Express
- Simplified to pure SPA architecture
- Faster build times and simpler deployment

### 2. Angular.json Production Config (Updated)
```json
"production": {
  "optimization": {
    "scripts": true,
    "styles": {
      "minify": true,
      "inlineCritical": true
    },
    "fonts": true
  },
  "outputHashing": "all",
  "namedChunks": false,
  "extractLicenses": true,
  "sourceMap": false
}
```

### 3. Font Loading (Fixed)
- Added `preconnect` to Google Fonts
- Using `font-display: swap` for Roboto (text appears immediately)
- Using `font-display: block` for Material Icons (prevents icon flash)

### 4. Critical CSS Inline
- Essential styles inlined in `<head>` for instant first paint
- Loading indicator added for better UX

---

## ⚠️ Recommended Optimizations

### Priority 1: Reduce Material Design Bundle

**Problem:** Material Design CSS is ~300+ KiB (94 KiB unused)

**Solution A: Use Material Core Only (Recommended)**

Create `src/styles/_material-custom.scss`:
```scss
// Import only Material components you use
@use '@angular/material' as mat;

// Define custom theme with minimal palette
$custom-primary: mat.define-palette(mat.$indigo-palette);
$custom-accent: mat.define-palette(mat.$pink-palette);
$custom-theme: mat.define-light-theme((
  color: (
    primary: $custom-primary,
    accent: $custom-accent,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

// Include only core styles
@include mat.core();

// Include ONLY the components you actually use
@include mat.toolbar-theme($custom-theme);
@include mat.button-theme($custom-theme);
@include mat.icon-theme($custom-theme);
@include mat.sidenav-theme($custom-theme);
@include mat.list-theme($custom-theme);
@include mat.form-field-theme($custom-theme);
@include mat.input-theme($custom-theme);
@include mat.progress-spinner-theme($custom-theme);
```

Then update `src/styles.scss`:
```scss
@use './styles/index.scss' as *;

// Replace prebuilt theme with custom minimal theme
@use './styles/material-custom' as *;

body {
  margin: 0;
  font-family: system-ui, Roboto, Arial, sans-serif;
  background: var(--app-bg, #fafafa);
  color: var(--app-fg, #222);
}
```

**Expected Savings:** ~150-200 KiB

---

### Priority 2: Enable Tree-Shaking for RxJS

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "bundler",
    "paths": {
      "rxjs": ["./node_modules/rxjs"],
      "rxjs/operators": ["./node_modules/rxjs/operators"]
    }
  }
}
```

**Expected Savings:** ~50-100 KiB

---

### Priority 3: Implement Route Preloading Strategy

Create `src/app/core/routing/preload-strategy.ts`:
```typescript
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload routes marked with data: { preload: true }
    if (route.data?.['preload']) {
      // Delay preload by 2 seconds to prioritize initial render
      return timer(2000).pipe(mergeMap(() => load()));
    }
    return of(null);
  }
}
```

Update `src/app/app.config.ts`:
```typescript
import { SelectivePreloadStrategy } from './core/routing/preload-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    provideRouter(routes, withPreloading(SelectivePreloadStrategy)),
  ]
};
```

Mark routes for preloading in `src/app/app.routes.ts`:
```typescript
{
  path: 'orders',
  loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes),
  data: { preload: true } // Preload after initial render
}
```

**Expected Improvement:** Faster navigation, better perceived performance

---

### Priority 4: Add Service Worker for Caching

```bash
ng add @angular/pwa
```

This will:
- Add `ngsw-config.json` for caching strategy
- Enable offline support
- Cache static assets (JS, CSS, fonts)
- Improve repeat visit performance by 80%+

Configure aggressive caching in `ngsw-config.json`:
```json
{
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    },
    {
      "name": "fonts",
      "installMode": "lazy",
      "resources": {
        "urls": [
          "https://fonts.googleapis.com/**",
          "https://fonts.gstatic.com/**"
        ]
      }
    }
  ]
}
```

**Expected Improvement:** 2-5x faster repeat visits

---

### Priority 5: Implement Virtual Scrolling for Lists

If `orders-list` displays many items, use `@angular/cdk/scrolling`:

Update `src/app/features/orders/pages/orders-list/orders-list.page.ts`:
```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  standalone: true,
  imports: [ScrollingModule, /* other imports */],
  template: `
    <cdk-virtual-scroll-viewport itemSize="72" class="orders-viewport">
      <div *cdkVirtualFor="let order of items()" class="order-item">
        {{ order.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .orders-viewport {
      height: calc(100vh - 200px);
    }
    .order-item {
      height: 72px;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
  `]
})
```

**Expected Improvement:** Handles 10,000+ items with no performance impact

---

### Priority 6: Lazy Load Images

Update `src/app/shared/directives/lazy-load-image.directive.ts`:
```typescript
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  @Input() appLazyLoad!: string;
  @Input() placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    const img = this.el.nativeElement;
    img.src = this.placeholder;
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = this.appLazyLoad;
          observer.disconnect();
        }
      });
    });
    
    observer.observe(img);
  }
}
```

Usage:
```html
<img [appLazyLoad]="order.imageUrl" alt="Order image">
```

**Expected Improvement:** Reduces initial page load by 50-70%

---

### Priority 7: Build with Production Mode

Always build with production configuration:
```bash
npm run build
```

This enables:
- Dead code elimination
- Minification (saves ~1,316 KiB)
- Tree-shaking (removes unused code)
- Ahead-of-Time (AOT) compilation
- Differential loading (modern + legacy bundles)

---

### Priority 8: Use CDN for Static Assets

Update `angular.json` to deploy assets separately:
```json
{
  "assets": [
    {
      "glob": "**/*",
      "input": "public",
      "output": "/assets"
    }
  ]
}
```

Deploy to CDN (Cloudflare, AWS CloudFront, Azure CDN) with:
- Cache headers: `max-age=31536000` (1 year)
- Gzip/Brotli compression enabled
- HTTP/2 or HTTP/3 enabled

**Expected Improvement:** 30-50% faster asset loading

---

## Performance Testing Commands

### 1. Production Build Analysis
```bash
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/ng-myenterprise-template/stats.json
```

### 2. Lighthouse CI (Automated)
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:4200
```

### 3. Chrome DevTools Performance Tab
1. Open DevTools → Performance
2. Click Record (⏺)
3. Interact with app
4. Stop recording
5. Analyze Main Thread activity, Long Tasks

---

## Expected Results After All Optimizations

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **FCP** | 13.4s | ~1.2s | < 1.8s ✅ |
| **LCP** | 22.2s | ~2.0s | < 2.5s ✅ |
| **TBT** | 240ms | ~100ms | < 200ms ✅ |
| **CLS** | 0 | 0 | 0 ✅ |
| **Bundle** | 3,810 KiB | ~800 KiB | < 1,000 KiB ✅ |

---

## Implementation Order

1. ✅ **Fix font loading** (DONE - 80ms saved)
2. ✅ **Enable production optimizations** (DONE - ~500ms saved)
3. ⚠️ **Custom Material theme** (Priority 1 - saves ~200 KiB)
4. ⚠️ **Add Service Worker** (Priority 4 - repeat visit 5x faster)
5. ⚠️ **Preloading strategy** (Priority 3 - better navigation)
6. ⚠️ **Virtual scrolling** (Priority 5 - if needed for long lists)
7. ⚠️ **Image lazy loading** (Priority 6 - if images used)
8. ⚠️ **CDN deployment** (Priority 8 - production only)

---

## Monitoring & Maintenance

### Continuous Performance Monitoring
- Add Lighthouse CI to GitHub Actions
- Set up Web Vitals tracking with Google Analytics
- Monitor bundle size with `bundlewatch`

### Bundle Size Budget
Update `angular.json` to fail builds on bloat:
```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kB",
    "maximumError": "800kB"
  }
]
```

---

## Questions?

For more info:
- **Web Vitals:** https://web.dev/vitals/
- **Angular Performance:** https://angular.dev/best-practices/runtime-performance
- **Material Theming:** https://material.angular.io/guide/theming
