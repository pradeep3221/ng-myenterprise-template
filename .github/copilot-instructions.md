# Angular Enterprise Template — Copilot Instructions

**Project Context:** Production Angular 19 enterprise application with SSR, runtime configuration, signals-based state management, and mock API support.

---

## Architecture Overview

### Layered Structure

```
app/
├── core/              # App singletons (services, guards, interceptors, config)
├── shared/            # Reusable stateless UI (components, directives, validators)
├── features/          # Lazy-loaded feature modules (orders, etc.)
├── app.routes.ts      # Root routing (lazy-load features)
├── app.config.ts      # Root providers (DI, HTTP, Router, signals state)
└── app.component.ts   # Material shell (toolbar + sidenav + router-outlet)
```

**Key Principle:** Organize by feature first, by type second. Cross-cutting concerns live in `core/`, reusable UI lives in `shared/`, business logic lives in `features/`.

---

## Critical Patterns

### 1. Runtime Configuration (Non-Negotiable)

**Problem Solved:** Externalize config to avoid rebuilds per environment.

**Pattern:**
- `public/config.json` contains all settings (apiBaseUrl, logLevel, feature flags, theme, auth, HTTP timeouts).
- Loaded at app startup via `APP_INITIALIZER` in `app.config.ts`.
- Validated and typed via `core/config/validate-config.ts`.
- Injected as `APP_CONFIG` token throughout app.

**Key Flow:**
```
app bootstrap
  → provideRuntimeConfig() (defaults + async fetch)
  → GlobalErrorHandler catches load failures
  → API service, Logger, Auth all consume APP_CONFIG
```

**When Adding New Config:**
1. Update `public/config.json` structure
2. Update `core/config/types.ts` interface
3. Update `core/config/validate-config.ts` validation + defaults
4. Inject `APP_CONFIG` where needed

**Mock API Toggle:** Set `config.features.enableMockApi: true` to route all HTTP calls to `localhost:3000` (json-server).

### 2. Signals-Based State Management

**Pattern:** Use Angular Signals (`signal()`, `computed()`, `effect()`) instead of RxJS for component/store state.

**Example: OrdersStore** (`core/state/orders.store.ts`)
```typescript
// Single source of truth
private readonly state = signal<OrdersState>({ items: [], loading: false, ... });

// Expose read-only signals
items = computed(() => this.state().items);
totalOrders = computed(() => this.items().length);
selectedOrder = computed(() => this.items().find(o => o.id === this.selectedId()));

// Mutations update the entire state object
setItems(orders) { this.state.update(s => ({ ...s, items: orders })); }
```

**Usage in Components:**
```typescript
store = inject(OrdersStore);

// Template can call signals as functions
<div>{{ store.totalOrders() }}</div>
@for (order of store.items(); track order.id) { ... }

// Manually update when needed
this.store.setItems(apiResponse);
```

**Why:** Signals provide fine-grained reactivity; no async pipe needed in templates; side effects via `effect()`.

---

### 3. Lazy Loading by Feature Routes

**Pattern:** Each feature folder contains `*.routes.ts` exporting a `Route[]`.

**Root Route Config** (`app.routes.ts`):
```typescript
{
  path: 'orders',
  loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes)
}
```

**Feature Routes** (`features/orders/orders.routes.ts`):
```typescript
export const ordersRoutes: Route[] = [
  { path: '', loadComponent: () => import('./pages/orders-list/orders-list.page').then(...) },
  { path: ':id', loadComponent: () => import('./pages/order-detail/order-detail.page').then(...) }
];
```

**Benefit:** Code splitting—each feature chunk loads only when navigated to.

---

### 4. HTTP Interception & Mock API Routing

**Interceptors** (`core/interceptors/`):
1. **auth.interceptor.ts** – Injects `Authorization: Bearer <token>` header if token exists.
2. **mockApiInterceptor** – If `config.features.enableMockApi`, rewrites request URL to `http://localhost:3000/...`.

**Flow:**
```
ApiService.get('/orders')
  → authInterceptor adds Bearer token
  → mockApiInterceptor rewrites to http://localhost:3000/orders (if enabled)
  → HttpClient sends request
  → Retry + timeout policies applied
```

**When Adding New API Calls:**
- Use `ApiService` (injectable in any component/service).
- All requests automatically get Bearer token + mock routing.
- Config-driven timeouts and retry counts.

---

### 5. Form Validation with Custom Validators

**Location:** `shared/validators/`

**Usage:**
```typescript
form = this.fb.group({
  email: ['', [customValidators.required(), customValidators.email()]],
  password: ['', customValidators.minLength(6)],
  confirmPassword: ['']
}, { 
  validators: customValidators.matchFields('password', 'confirmPassword')
});
```

**Service Helper** (`FormValidatorService`):
```typescript
isFieldInvalid(field) { /* true if touched + invalid */ }
getErrorMessage(field, label) { /* "Email is required" or "Invalid email format" */ }
canSubmit(form) { /* check valid + not already submitting */ }
markAllAsTouched(form) { /* for error display on submit */ }
```

**Available Validators:** required, email, minLength, maxLength, pattern, range, url, phone, matchFields, asyncAvailable.

---

### 6. Auth Flow

**Components:**
- **AuthService** (`core/services/auth.service.ts`) – Signals-based token management.
- **AuthGuard** (`core/guards/auth.guard.ts`) – Protects routes.
- **AuthInterceptor** – Injects token in every request.

**Pattern:**
```typescript
// In login form
authService.login(email, password)
  .subscribe({ next: () => router.navigate(['/orders']) });

// In a route
canActivate: [authGuard]

// Token auto-injected in all HTTP requests
```

---

### 7. Error Handling

**GlobalErrorHandler** (`core/errors/global-error.handler.ts`):
- Catches all unhandled errors.
- Logs via `LoggerService` with configured log level.
- Can be extended to show toast/modal to user.

**HTTP Errors:**
```typescript
this.apiService.get('/orders').pipe(
  catchError(err => {
    // Handled by GlobalErrorHandler or log here
    this.logger.error('Failed to load orders', err);
    return of([]);
  })
)
```

---

## Development Workflows

### Starting Development

```powershell
# Terminal 1: Angular dev server
npm start

# Terminal 2 (optional): Mock API on :3000
npm run mock-api

# Or both concurrently
npm run dev-with-mock
```

Then enable mock in `public/config.json`: `"enableMockApi": true`.

### Running Tests

```powershell
npm test              # Run all unit tests once
npm test -- --watch  # Watch mode
npm test -- --code-coverage
```

**Key Test Files:**
- `shared/validators/*.spec.ts` – Custom validator tests
- `shared/forms/*.spec.ts` – Form component tests
- `core/services/*.spec.ts` – Service tests (API, Auth, Logger)

### Building for Production

```powershell
npm run build         # Outputs dist/
node dist/.../server/server.mjs  # Run SSR server
```

### Docker

```powershell
docker build -t enterprise-angular .
docker run -p 4000:4000 enterprise-angular
```

---

## Adding a New Feature

### Step 1: Create Feature Folder Structure
```
features/my-feature/
├── pages/
│   └── my-feature-list/
│       ├── my-feature-list.page.ts
│       └── my-feature-list.page.html
├── data-access/
│   └── my-feature.service.ts
├── my-feature.routes.ts
└── index.ts (optional, for types only)
```

### Step 2: Define Routes
```typescript
// my-feature.routes.ts
export const myFeatureRoutes: Route[] = [
  { 
    path: '', 
    loadComponent: () => import('./pages/my-feature-list/my-feature-list.page').then(m => m.MyFeatureListPage) 
  }
];
```

### Step 3: Add to Root Routes
```typescript
// app.routes.ts
{
  path: 'my-feature',
  loadChildren: () => import('./features/my-feature/my-feature.routes').then(m => m.myFeatureRoutes)
}
```

### Step 4: Create Data Access Service
```typescript
@Injectable({ providedIn: 'root' })
export class MyFeatureService {
  constructor(private api: ApiService) {}

  getItems() { return this.api.get('/my-items'); }
  getItem(id: number) { return this.api.get(`/my-items/${id}`); }
}
```

### Step 5: Implement Component with Signals
```typescript
@Component({
  standalone: true,
  template: `...`
})
export class MyFeatureListPage implements OnInit {
  private service = inject(MyFeatureService);
  items = signal<MyItem[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.service.getItems().subscribe({
      next: (data) => this.items.set(data),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `app.config.ts` | Root DI setup: Router, HTTP, Animations, Config, Interceptors |
| `app.routes.ts` | Root routing with lazy-loaded features |
| `core/config/types.ts` | AppConfig interface definition |
| `core/config/load-app-config.ts` | Runtime config loading at startup |
| `core/state/orders.store.ts` | Example signals-based store |
| `core/services/api.service.ts` | HTTP wrapper with mock routing |
| `core/services/auth.service.ts` | Token management with signals |
| `core/interceptors/auth.interceptor.ts` | Bearer token injection |
| `core/errors/global-error.handler.ts` | Centralized error handling |
| `shared/validators/custom-validators.ts` | 10+ reusable form validators |
| `shared/validators/form-validator.service.ts` | Form state + error message helper |
| `public/config.json` | Runtime configuration (externalized) |

---

## Common Patterns & Anti-Patterns

### ✅ DO
- **Inject services** into components via `inject()` function (modern, clean).
- **Use `computed()`** for derived state instead of multiple signals.
- **Use `effect()`** for side effects (logging, subscriptions) inside stores.
- **Lazy-load features** via `loadChildren` / `loadComponent`.
- **Scope services** to features when possible (`providedIn: 'feature'` or feature-specific providers).
- **Co-locate tests** with source files (`*.spec.ts`).
- **Use signals in templates** directly—no async pipe needed.

### ❌ DON'T
- **Provide singletons in `shared/`**—they belong in `core/` (provided in root).
- **Mix RxJS Observables and Signals**—prefer Signals for component state; Observables for long-lived streams.
- **Eagerly load features**—always use `loadChildren` / `loadComponent`.
- **Put business logic in components**—extract to services/stores.
- **Ignore runtime config**—use `APP_CONFIG` token for all environment-specific values.
- **Create deep relative imports** (`../../../../...`)—keep to 1-2 levels max.

---

## TypeScript & Strictness

- Strict mode enabled (`tsconfig.json`).
- Always type function returns and parameters.
- Use `readonly` for immutable collections.
- Define interfaces for all API responses (e.g., `Order`, `OrdersState`).
- Use type guards: `if (obj instanceof SomeClass) { ... }`.

---

## Naming Conventions

- **Folders:** kebab-case (`orders-list`, `data-access`)
- **Files:** kebab-case with suffix (`order-list.page.ts`, `api.service.ts`)
- **Classes/Types:** PascalCase (`OrdersListPage`, `Order`)
- **Variables/Functions:** camelCase (`selectedOrder`, `getItems()`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`, `API_BASE_URL`)

**File Suffixes:**
- `.page.ts` – Routed standalone component
- `.component.ts` – Presentational component
- `.service.ts` – Injectable service
- `.store.ts` – Signals-based state store
- `.directive.ts` – Angular directive
- `.pipe.ts` – Angular pipe
- `.guard.ts` – Route guard
- `.interceptor.ts` – HTTP interceptor
- `.routes.ts` – Route configuration
- `.spec.ts` – Unit test

---

## Performance Considerations

- **Code Splitting:** Features lazy-loaded—each chunk ~1-2kB.
- **Initial Bundle:** ~617kB (including Material).
- **Signals vs. RxJS:** Signals skip change detection overhead; use for component state.
- **Hydration:** SSR output replayed on client via `withEventReplay()`.
- **Image Lazy Loading:** `LazyLoadImageDirective` uses Intersection Observer.
- **Bundle Budget:** thresholds in `angular.json`—monitor with `npm run build`.

---

## Questions for AI Agents

When working in this codebase, ask yourself:

1. **Does this belong in `core/`, `shared/`, or `features/`?**
   - Singleton/cross-cutting → `core/`
   - Reusable UI (no state) → `shared/`
   - Feature-specific logic → `features/`

2. **Should this be a Signal or Observable?**
   - Component UI state → Signal
   - Long-lived API stream → Observable
   - Store state → Signal (with `effect()` for side effects)

3. **Is this config value runtime or compile-time?**
   - Runtime (env-specific) → `public/config.json` + `APP_CONFIG` token
   - Compile-time (build flags) → rarely needed; prefer runtime config

4. **Does this API call need mock routing?**
   - Yes → ensure `core/mocking/mock-api.provider.ts` is active
   - Enable via `config.features.enableMockApi: true`
   - Mock data in `db.json` for json-server

5. **Where does this form validation belong?**
   - Custom validators → `shared/validators/custom-validators.ts`
   - Form component → use `FormValidatorService` helper + Material form fields
   - Error messages → `FormValidatorService.getErrorMessage()`

---

**Last Updated:** November 2025 | Angular 19 | Standalone Components
