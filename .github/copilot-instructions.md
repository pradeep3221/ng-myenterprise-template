# Angular Enterprise Template — Copilot Instructions

**Project Context:** Production Angular 19 enterprise application with SSR, runtime configuration, signals-based state management, and mock API support. Uses standalone components, lazy loading, Material Design, and externalized config via JSON.

**Key Tech Stack:**
- Angular 19.2+ (Standalone, no NgModules)
- Angular Material
- Signals-based state (no @ngrx)
- json-server for mock API
- SSR/SSG ready
- TypeScript strict mode

---

## Architecture Overview

### Layered Structure

```
app/
├── core/              # App singletons: services, guards, interceptors, config, state
├── shared/            # Reusable stateless UI: components, directives, validators
├── features/          # Lazy-loaded feature modules (one feature = one folder)
├── app.routes.ts      # Root routing (lazy-load features via loadChildren)
├── app.config.ts      # Root providers (DI, HTTP, Router, error handling)
└── app.component.ts   # Material shell (toolbar + sidenav + router-outlet)
```

**Key Principle:** 
- **Feature-first organization** (by business domain)
- **Type-second organization** (pages/, data-access/, shared/)
- **core/** for cross-cutting singletons (never provided in features)
- **shared/** for reusable UI with NO business state
- **features/** for lazy-loaded business logic isolated per route

---

## App Initialization & Bootstrap Sequence

**Critical Flow** (`main.ts` → `app.config.ts` → `provideRuntimeConfig()` → `APP_INITIALIZER`):

```
1. main.ts bootstraps app with appConfig
2. provideRuntimeConfig() runs first (via multi: true APP_INITIALIZER)
   → Fetches public/config.json
   → Validates + normalizes with defaults (see validate-config.ts)
   → Injects as APP_CONFIG token
3. Dark mode applied if config.theme.darkMode = true (second APP_INITIALIZER)
4. Routes + HTTP interceptors initialized
5. GlobalErrorHandler catches all unhandled errors
```

**If config load fails:** App still loads with hardcoded defaults. Check browser console for validation errors.

**When Adding New Startup Logic:**
- Add to `app.config.ts` providers array
- If it depends on config, add as `APP_INITIALIZER` AFTER `provideRuntimeConfig()`
- Always inject dependencies, don't use hardcoded values

---

## Critical Patterns

### 1. Runtime Configuration (Non-Negotiable)

**Problem Solved:** Externalize config to avoid rebuilds per environment.

**Integration Points:**
- `public/config.json` – Single source of truth (no compile-time config needed)
- `core/config/types.ts` – TypeScript interface (`AppConfig`)
- `core/config/validate-config.ts` – Validation + defaults + normalization
- `core/config/app-config.token.ts` – Injection token
- `core/config/load-app-config.ts` – Async loader via `APP_INITIALIZER`
- `app.config.ts` – Registered via `provideRuntimeConfig()`

**Key Values & Their Impact:**
- `apiBaseUrl` – Used by `ApiService.buildUrl()` for production API calls
- `enableMockApi` – If true, `mockApiInterceptor` rewrites requests to `http://localhost:3000`
- `logLevel` – Controls `LoggerService` output (debug, info, warn, error, silent)
- `darkMode` – Applied to document.documentElement at startup
- `timeoutMs` / `retry` – HTTP behavior (timeout, automatic retry count)
- `tokenStorageKey` – Where `AuthService` stores JWT (`localStorage`)

**When Adding New Config:**
1. Update `public/config.json` with new field
2. Update `AppConfig` interface in `core/config/types.ts`
3. Update `DEFAULTS` + validation logic in `core/config/validate-config.ts`
4. Inject `APP_CONFIG` in services/components that need the value

**Example: Add a new feature flag**
```typescript
// types.ts
export interface FeatureFlags {
  enableMockApi?: boolean;
  enableDebugTools?: boolean;
  enableNewDashboard?: boolean;  // NEW
}

// validate-config.ts - add to DEFAULTS
features: {
  enableMockApi: false,
  enableDebugTools: true,
  enableNewDashboard: false,  // NEW
}

// public/config.json
{ "features": { "enableNewDashboard": true } }

// component
if (inject(APP_CONFIG).features?.enableNewDashboard) { /* show new UI */ }
```

**Mock API Toggle:** Set `config.features.enableMockApi: true` to route all HTTP calls to `localhost:3000` (json-server).

### 2. Signals-Based State Management

**Pattern:** Use Angular Signals (`signal()`, `computed()`, `effect()`) instead of RxJS for component/store state.

**Core Concepts:**
- `signal()` – Mutable source of truth (only modified via `.set()` or `.update()`)
- `computed()` – Derived read-only state (automatically recalculated when dependencies change)
- `effect()` – Side effects (logging, subscriptions) triggered by signal changes
- Signals are **synchronous** (unlike Observables), enabling direct template access without async pipe

**Store Pattern: OrdersStore** (`core/state/orders.store.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class OrdersStore {
  // Private single source of truth
  private readonly state = signal<OrdersState>({
    items: [],
    selectedId: null,
    loading: false,
    error: null
  });

  // Expose read-only signals
  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Computed derived state (automatically memoized)
  readonly selectedOrder = computed(() => {
    const items = this.items();
    const id = this.state().selectedId;
    return id !== null ? items.find(o => o.id === id) ?? null : null;
  });
  readonly totalOrders = computed(() => this.items().length);
  readonly completedOrders = computed(() =>
    this.items().filter(o => o.status === 'completed').length
  );

  // Mutations always update entire state object
  setItems(items: Order[]): void {
    this.state.update(s => ({ ...s, items, error: null }));
  }
  addItem(order: Order): void {
    this.state.update(s => ({ ...s, items: [...s.items, order] }));
  }
  updateItem(id: number, updates: Partial<Order>): void {
    this.state.update(s => ({
      ...s,
      items: s.items.map(o => (o.id === id ? { ...o, ...updates } : o))
    }));
  }
  removeItem(id: number): void {
    this.state.update(s => ({
      ...s,
      items: s.items.filter(o => o.id !== id)
    }));
  }
  setLoading(loading: boolean): void {
    this.state.update(s => ({ ...s, loading }));
  }
  reset(): void {
    this.state.set({ items: [], selectedId: null, loading: false, error: null });
  }
}
```

**Usage in Components:**
```typescript
@Component({
  standalone: true,
  template: `
    <div>Total Orders: {{ store.totalOrders() }}</div>
    
    @if (store.loading()) {
      <mat-spinner></mat-spinner>
    } @else {
      @for (order of store.items(); track order.id) {
        <button (click)="onSelect(order.id)">{{ order.name }}</button>
      }
    }
    
    @if (store.selectedOrder(); as order) {
      <div>Selected: {{ order.name }} ({{ order.status }})</div>
    }
  `
})
export class OrdersListPage implements OnInit {
  store = inject(OrdersStore);
  private apiService = inject(ApiService);

  ngOnInit() {
    this.store.setLoading(true);
    this.apiService.get<Order[]>('/orders').subscribe({
      next: (data) => {
        this.store.setItems(data);
        this.store.setLoading(false);
      },
      error: (err) => {
        this.store.setError('Failed to load');
        this.store.setLoading(false);
      }
    });
  }
}
```

**Why Signals over RxJS:**
- Fine-grained reactivity (only computed signals with changed dependencies re-evaluate)
- Direct template access (no async pipe needed)
- Side effects via `effect()` (auto-cleanup on component destroy)
- Better performance for frequent updates (no Observable subscription overhead)
- Simpler mental model for component state

**RxJS still used for:** Long-lived API streams, complex async flows, operators (retry, debounce, switchMap)

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

**Interceptors Chain** (`core/interceptors/`):

1. **authInterceptor.ts** – Injects `Authorization: Bearer <token>` if token exists
   ```typescript
   export const authInterceptor: HttpInterceptorFn = (req, next) => {
     const auth = inject(AuthService);
     const token = auth.token;
     if (token) {
       req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
     }
     return next(req);
   };
   ```

2. **mockApiInterceptor** – Routes requests to `http://localhost:3000` if `enableMockApi` is true
   - Enabled in `app.config.ts` via `withInterceptors([authInterceptor, mockApiInterceptor])`
   - Controlled by `config.features.enableMockApi` flag

**HTTP Service** (`core/services/api.service.ts`):
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    return this.http.get<T>(this.getMockApiUrl(path), { params: params as any })
      .pipe(
        timeout(this.config.http?.timeoutMs ?? 15000),
        retry(this.config.http?.retry ?? 0),
        catchError(err => throwError(() => err))
      );
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(this.getMockApiUrl(path), body)
      .pipe(timeout(this.config.http?.timeoutMs ?? 15000), catchError(err => throwError(() => err)));
  }

  private getMockApiUrl(path: string): string {
    if (this.config?.features?.enableMockApi) {
      return `http://localhost:3000/${path.replace(/^\//, '')}`;
    }
    return this.buildUrl(path);
  }

  private buildUrl(path: string): string {
    return `${this.config.apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
```

**Flow:**
```
ApiService.get('/orders')
  → authInterceptor adds Bearer token
  → mockApiInterceptor rewrites to http://localhost:3000/orders (if enabled)
  → Timeout + Retry operators applied
  → HttpClient sends request
```

**When Adding New API Calls:**
- Always use `ApiService` (injectable in any component/service)
- All requests automatically get Bearer token + mock routing
- Config-driven timeouts and retry counts are applied automatically
- Pass `/path` format (leading slash will be stripped)

---

### 5. Form Validation with Custom Validators

**Location:** `shared/validators/` – 10+ reusable validators with consistent error handling

**Available Validators** (`custom-validators.ts`):
- `required()` – Non-empty, trimmed string
- `email()` – Valid email format
- `minLength(n)` – Minimum string length
- `maxLength(n)` – Maximum string length
- `pattern(regex)` – Regex match
- `range(min, max)` – Number in range
- `url()` – Valid URL
- `phone()` – Phone number format
- `matchFields(field1, field2)` – Field equality (for password confirmation)
- `asyncAvailable(checkFn)` – Async validation (e.g., username uniqueness)

**Usage Pattern:**
```typescript
import { customValidators } from './shared/validators/custom-validators';
import { FormValidatorService } from './shared/validators/form-validator.service';

@Component({
  standalone: true,
  template: `
    <form [formGroup]="form">
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" />
        @if (validator.isInvalid(form.get('email'))) {
          <mat-error>{{ validator.getErrorMessage(form.get('email'), 'Email') }}</mat-error>
        }
      </mat-form-field>
      
      <button [disabled]="!validator.canSubmit(form)" (click)="onSubmit()">
        Sign In
      </button>
    </form>
  `
})
export class LoginFormComponent {
  form: FormGroup;
  validator = inject(FormValidatorService);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [customValidators.required(), customValidators.email()]],
      password: ['', [customValidators.required(), customValidators.minLength(6)]],
      phone: ['', customValidators.phone()],
      website: ['', customValidators.url()],
      confirmPassword: ['']
    }, { 
      validators: customValidators.matchFields('password', 'confirmPassword')
    });
  }

  onSubmit(): void {
    if (!this.validator.canSubmit(this.form)) {
      this.validator.markAllAsTouched(this.form);
      return;
    }
    // Process form
  }
}
```

**FormValidatorService API:**
- `isInvalid(control)` – Returns true if touched AND invalid
- `getErrorMessage(control, label)` – Returns user-friendly message (e.g., "Email is required" or "Invalid email format")
- `canSubmit(form)` – Check if form is valid AND not already submitting
- `markAllAsTouched(form)` – For error display on submit

---

### 6. Auth Flow

**Components:**
- **AuthService** (`core/services/auth.service.ts`) – Signals-based token management
- **AuthGuard** (`core/guards/auth.guard.ts`) – Protects routes
- **AuthInterceptor** – Automatically injects token in every HTTP request
- **Storage** – Token persisted in localStorage via `auth.tokenStorageKey` from config

**AuthService Implementation:**
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private config = inject(APP_CONFIG);
  private tokenSignal = signal<string | null>(this.readToken());

  get token() { return this.tokenSignal(); }
  isAuthenticated() { return !!this.tokenSignal(); }

  login(token: string) {
    localStorage.setItem(this.config.auth?.tokenStorageKey || 'auth_token', token);
    this.tokenSignal.set(token);
  }

  logout() {
    localStorage.removeItem(this.config.auth?.tokenStorageKey || 'auth_token');
    this.tokenSignal.set(null);
  }

  private readToken(): string | null {
    return localStorage.getItem(this.config.auth?.tokenStorageKey || 'auth_token');
  }
}
```

**Protecting Routes:**
```typescript
// In app.routes.ts
{
  path: 'orders',
  canActivate: [authGuard],  // Protect this route
  loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes)
}
```

**Usage Flow:**
```
1. User logs in → AuthService.login(token) stores in localStorage + signal
2. Subsequent HTTP requests → authInterceptor reads token and injects header
3. Protected routes → authGuard redirects to /login if not authenticated
4. User logs out → AuthService.logout() clears both localStorage and signal
```

**Token Storage Key:** Configured in `public/config.json` → `auth.tokenStorageKey`

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

---

## Development Workflows

### Starting Development

**Terminal 1: Angular dev server**
```powershell
npm start
# Navigate to http://localhost:4200/
# Watches for file changes and rebuilds automatically
```

**Terminal 2 (optional): Mock API server**
```powershell
npm run mock-api
# Starts json-server on http://localhost:3000
# Watches db.json for changes
```

**Run Both Together:**
```powershell
npm run dev-with-mock
# Uses concurrently to run both servers
```

**Enable Mock Routing:**
Edit `public/config.json`:
```json
{
  "features": {
    "enableMockApi": true
  }
}
```

### Running Tests

```powershell
npm test                          # Run all unit tests once
npm test -- --watch              # Watch mode
npm test -- --code-coverage      # With coverage report
npm test -- --browsers=Chrome    # Specific browser
```

**Key Test Files:**
- `shared/validators/*.spec.ts` – Custom validator tests
- `shared/forms/*.spec.ts` – Form component tests
- `core/services/*.spec.ts` – Service tests (API, Auth, Logger)
- `app.component.spec.ts` – Root shell tests

### Building for Production

**Development Build:**
```powershell
npm run build
# Outputs dist/ directory
```

**Production SSR Build & Run:**
```powershell
npm run build
node dist/ng-myenterprise-template/server/server.mjs
# SSR server runs on http://localhost:4000 (by default)
```

**Watch Mode (incremental builds):**
```powershell
npm run watch
# Useful during development to see bundle size changes
```

### Docker Build & Run

```powershell
docker build -t enterprise-angular .
docker run -p 4000:4000 enterprise-angular
# Runs SSR server in container
```

### Common Development Commands Reference

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run watch` | Incremental watch build |
| `npm test` | Run tests once |
| `npm run mock-api` | Start json-server on :3000 |
| `npm run dev-with-mock` | Dev server + mock API together |
| `npm run serve:ssr:ng-myenterprise-template` | Run production SSR build |

### Troubleshooting Common Issues

**Build fails with "Cannot find module":**
- Run `npm install` to ensure dependencies are installed
- Check that all imports use correct relative paths or barrel exports

**Mock API not working:**
- Ensure `npm run mock-api` is running in a separate terminal
- Check `config.features.enableMockApi: true` in `public/config.json`
- Verify requests are made to `/orders` not `/api/orders` (json-server has no /api prefix by default)

**Tests fail with timeout:**
- Increase timeout in test configuration
- Check for unresolved promises or uncleared subscriptions
- Use `fakeAsync` + `tick()` for time-dependent tests

**Dark mode not applied at startup:**
- Ensure `config.theme.darkMode: true` in `public/config.json`
- Check browser console for config loading errors
- Verify `_variables.scss` has dark mode CSS classes defined

---

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
  },
  { 
    path: ':id', 
    loadComponent: () => import('./pages/my-feature-detail/my-feature-detail.page').then(m => m.MyFeatureDetailPage) 
  }
];
```

### Step 3: Add to Root Routes
```typescript
// app.routes.ts
export const routes: Route[] = [
  {
    path: 'my-feature',
    loadChildren: () => import('./features/my-feature/my-feature.routes').then(m => m.myFeatureRoutes)
  },
  // ... other routes
];
```

### Step 4: Create Data Access Service
```typescript
// features/my-feature/data-access/my-feature.service.ts
@Injectable({ providedIn: 'root' })
export class MyFeatureService {
  private api = inject(ApiService);

  getItems() { 
    return this.api.get<MyItem[]>('/my-items'); 
  }
  
  getItem(id: number) { 
    return this.api.get<MyItem>(`/my-items/${id}`); 
  }
  
  createItem(item: MyItem) {
    return this.api.post<MyItem>('/my-items', item);
  }
  
  updateItem(id: number, updates: Partial<MyItem>) {
    return this.api.put<MyItem>(`/my-items/${id}`, updates);
  }
  
  deleteItem(id: number) {
    return this.api.delete(`/my-items/${id}`);
  }
}
```

### Step 5: Implement Component with Signals
```typescript
// features/my-feature/pages/my-feature-list/my-feature-list.page.ts
@Component({
  selector: 'app-my-feature-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './my-feature-list.page.html',
  styleUrls: ['./my-feature-list.page.scss']
})
export class MyFeatureListPage implements OnInit {
  private service = inject(MyFeatureService);
  
  items = signal<MyItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.service.getItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set('Failed to load items');
        console.error('Error loading items:', err);
      },
      complete: () => this.loading.set(false)
    });
  }
}
```

### Step 6: Add Mock Data (if using json-server)
```json
// db.json
{
  "my-items": [
    { "id": 1, "name": "Item 1", "status": "active" },
    { "id": 2, "name": "Item 2", "status": "inactive" }
  ]
}
```

### Step 7: Write Tests
```typescript
// features/my-feature/data-access/my-feature.service.spec.ts
describe('MyFeatureService', () => {
  let service: MyFeatureService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyFeatureService]
    });
    service = TestBed.inject(MyFeatureService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should fetch items', (done) => {
    spyOn(httpClient, 'get').and.returnValue(of([{ id: 1, name: 'Test' }]));
    service.getItems().subscribe(items => {
      expect(items.length).toBe(1);
      done();
    });
  });
});
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
