# NgMyenterpriseTemplate

A production-ready **Angular 19 Enterprise Template** with SSR and hydration, Material Design, advanced state management, form validation, mock API, lazy loading, and comprehensive documentation.

**Tech Stack:**
- Angular 19.2+ (Standalone Components)
- Angular Material + Responsive Design
- SCSS with modular architecture
- Server-Side Rendering (SSR) & Static Site Generation (SSG)
- Runtime Configuration & Environment Management
- Signals-based State Management
- Reactive Forms with Validation
- Docker Support

---

## ✨ Features

### Core Architecture
- ✅ **Standalone Components** – Modern Angular 19+ pattern
- ✅ **SSR + SSG** – Server-side rendering and static prerendering
- ✅ **Feature-First Structure** – Lazy loading with route-based code splitting
- ✅ **Runtime Configuration** – Externalized config via `public/config.json`
- ✅ **Dependency Injection** – Fully injectable services with type safety

### UI & Styling
- ✅ **Material Design** – Complete Material library integration
- ✅ **Responsive Layout** – Toolbar + sidenav with Mobile-first design
- ✅ **Dark Mode** – CSS class-based theme switching
- ✅ **SCSS Architecture** – Modular partials (variables, mixins, reset)
- ✅ **Lazy Image Loading** – Intersection Observer directive

### State & Data Management
- ✅ **Signals-Based State** – Custom store using Angular signals (no @ngrx dependency)
- ✅ **Computed State** – Derived reactive values and side effects
- ✅ **Mock API** – json-server integration for local development
- ✅ **HTTP Service** – Configurable timeout, retry, mock routing
- ✅ **Feature Flag** – Enable/disable mock API via config

### Forms & Validation
- ✅ **Reusable Validators** – 10+ custom validators (email, phone, URL, etc.)
- ✅ **FormValidator Service** – Error messages, touched tracking, form lifecycle
- ✅ **Example Form** – Login form with Material UI and validation
- ✅ **Reactive Forms** – Typed, strongly-validated forms

### Security & Logging
- ✅ **Auth Service** – Token-based authentication with signals
- ✅ **Auth Guard** – Route protection for authenticated pages
- ✅ **HTTP Interceptor** – Bearer token injection + mock API routing
- ✅ **Logger Service** – Configurable log levels (debug, info, warn, error)
- ✅ **Global Error Handler** – Centralized error processing

### Performance
- ✅ **Lazy Routes** – Code splitting for features
- ✅ **Lazy Images** – Intersection Observer for deferred loading
- ✅ **Bundle Budget** – Optimized thresholds (600kB initial)
- ✅ **Hydration** – Client-side event replay for SSR apps
- ✅ **Prerendering** – Static route generation with SSG

### Testing & Documentation
- ✅ **Unit Tests** – Jasmine/Karma with Material testing utilities
- ✅ **29+ Test Specs** – Coverage for validators, services, components
- ✅ **Folder Structure Guide** – `.github/instructions/angular-folder-structure.instructions.md`
- ✅ **Coding Standards** – `.github/instructions/angular.instructions.md`

### DevOps & Tooling
- ✅ **Docker** – Multi-stage SSR build
- ✅ **ESLint** – Angular-specific linting rules
- ✅ **json-server** – Mock API development
- ✅ **Concurrently** – Run dev servers in parallel
- ✅ **Tailwind Config** – Optional utility-first CSS (not enabled by default)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm 9+
- Angular CLI 19+

### Installation

```bash
# Clone or extract template
cd ng-myenterprise-template

# Install dependencies
npm install

# Start dev server
npm start
# Navigate to http://localhost:4200/
```

### Development with Mock API

```bash
# Terminal 1: Start Angular dev server
npm start

# Terminal 2: Start mock API server (new terminal)
npm run mock-api

# OR run both concurrently
npm run dev-with-mock
```

Then enable mock API in `public/config.json`:
```json
{
  "features": {
    "enableMockApi": true
  }
}
```

### Build & Deploy

**Development Build:**
```bash
npm run build
```

**Production SSR Build & Run:**
```bash
npm run build
node dist/ng-myenterprise-template/server/server.mjs
```

**Docker Build:**
```bash
docker build -t enterprise-angular .
docker run -p 4000:4000 enterprise-angular
```

---

## 📋 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── config/           # Runtime config, types, validation
│   │   ├── services/         # API, Logger, Auth, Analytics
│   │   ├── interceptors/     # HTTP auth, mock API routing
│   │   ├── guards/           # Auth guard for routes
│   │   ├── errors/           # Global error handler
│   │   ├── state/            # Signals-based stores (OrdersStore)
│   │   └── mocking/          # Mock API provider
│   ├── shared/
│   │   ├── ui/               # ButtonComponent, NotFoundComponent
│   │   ├── forms/            # LoginFormComponent (example)
│   │   ├── validators/       # Custom validators & FormValidatorService
│   │   └── directives/       # LazyLoadImageDirective
│   ├── features/
│   │   └── orders/           # Example feature (list, detail, routes, service)
│   ├── app.routes.ts         # Root routing config
│   ├── app.config.ts         # Providers & DI setup
│   ├── app.component.ts      # Material shell (toolbar + sidenav)
│   └── app.component.html    # Main layout template
├── styles/                   # SCSS partials (_variables, _mixins, _reset)
├── styles.scss               # Global styles (Material theme import)
├── index.html                # Entry HTML
├── main.ts                   # Bootstrap
├── server.ts                 # SSR server setup
└── main.server.ts            # Server platform init
public/
├── config.json               # Runtime configuration (externalized)
└── favicon.ico
db.json                        # Mock API data for json-server
json-server.json              # json-server config
angular.json                   # Angular CLI config (updated budgets)
package.json                   # Dependencies + npm scripts
tsconfig.json                  # TypeScript config (strict mode)
```

---

## 🔧 Runtime Configuration

**`public/config.json`** controls app behavior:

```json
{
  "appName": "My Enterprise App",
  "apiBaseUrl": "https://api.example.com/v1",
  "logLevel": "debug",
  "envName": "local",
  "analytics": {
    "enabled": false,
    "provider": "gtag",
    "measurementId": "G-XXXXXXX"
  },
  "auth": {
    "tokenStorageKey": "auth_token"
  },
  "http": {
    "timeoutMs": 20000,
    "retry": 1
  },
  "theme": {
    "darkMode": false,
    "primaryColorHex": "#3f51b5"
  },
  "features": {
    "enableMockApi": false,
    "enableDebugTools": true
  }
}
```

**Config Loading:**
- Fetched at app startup via `APP_INITIALIZER`
- Validated and normalized with defaults
- Injected via `APP_CONFIG` token
- Fallback to defaults if fetch fails

---

## 🎨 Form Validation

**Shared validators in `src/app/shared/validators/`:**

```typescript
import { customValidators } from './shared/validators/custom-validators';
import { FormValidatorService } from './shared/validators/form-validator.service';

export class MyFormComponent {
  form: FormGroup;
  
  constructor(private fb: FormBuilder, private validator: FormValidatorService) {
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

  isFieldInvalid(field: string): boolean {
    return this.validator.isInvalid(this.form.get(field));
  }

  getFieldError(field: string): string | null {
    return this.validator.getErrorMessage(this.form.get(field), field);
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

**Available Validators:**
- `required()` – Non-empty, trimmed string
- `email()` – Valid email format
- `minLength(n)` – Minimum string length
- `maxLength(n)` – Maximum string length
- `pattern(regex)` – Regex match
- `range(min, max)` – Number in range
- `url()` – Valid URL
- `phone()` – Phone number format
- `matchFields(field1, field2)` – Field equality
- `asyncAvailable(checkFn)` – Async validation (e.g., username uniqueness)

---

## 🗂️ State Management with Signals

**Example: OrdersStore** in `src/app/core/state/orders.store.ts`

```typescript
import { OrdersStore } from './core/state/orders.store';

export class OrdersListComponent implements OnInit {
  store = inject(OrdersStore);

  // Access reactive state
  items = this.store.items;              // signal
  selectedOrder = this.store.selectedOrder; // computed
  loading = this.store.loading;
  totalOrders = this.store.totalOrders;  // computed count

  onSelect(id: number): void {
    this.store.selectOrder(id);
  }

  loadOrders(): void {
    this.store.setLoading(true);
    this.apiService.get<Order[]>('orders').subscribe({
      next: (orders) => {
        this.store.setItems(orders);
        this.store.setLoading(false);
      },
      error: (err) => {
        this.store.setError('Failed to load orders');
        this.store.setLoading(false);
      }
    });
  }
}
```

**In Template:**
```html
<div>
  Total Orders: {{ store.totalOrders() }}
  Completed: {{ store.completedOrders() }}
  Pending: {{ store.pendingOrders() }}
</div>

@if (store.loading()) {
  <mat-spinner></mat-spinner>
}

@for (order of store.items(); track order.id) {
  <button (click)="onSelect(order.id)">{{ order.name }}</button>
}
```

**Store API:**
- `setItems(items)` – Set all items
- `addItem(item)` – Add single item
- `updateItem(id, updates)` – Update existing item
- `removeItem(id)` – Delete item
- `selectOrder(id)` – Set selected item
- `setLoading(bool)` – Control loading state
- `setError(msg)` – Set error message
- `reset()` – Clear all state

---

## 📦 Performance: Lazy Images

**LazyLoadImageDirective** in `src/app/shared/directives/lazy-load-image.directive.ts`

```html
<img 
  appLazyLoad 
  [appLazyLoadPlaceholder]="'./assets/placeholder.jpg'"
  [src]="'./assets/real-image.jpg'"
  [appLazyLoadThreshold]="0.1"
  alt="Lazy loaded image"
/>
```

**Features:**
- Intersection Observer API for efficient loading
- Placeholder image while loading
- Configurable visibility threshold
- Auto-unsubscribe after load
- Error handling with console warning

---

## 🔐 Security & Auth

**Auth Service** with signals-based token:
```typescript
export class AuthService {
  private token = signal<string | null>(null);
  isAuthenticated = computed(() => this.token() !== null);

  login(email: string, password: string): void {
    // Call API, set token on success
    this.token.set('jwt-token-here');
  }

  logout(): void {
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }
}
```

**Auth Guard:**
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if (authService.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};
```

**HTTP Interceptor:**
- Injects `Authorization: Bearer <token>` header
- Routes requests to mock API if `enableMockApi` is true
- Handles timeout + retry logic

---

## 🧪 Testing

**Run All Tests:**
```bash
npm test
```

**Coverage Report:**
```bash
npm test -- --code-coverage
```

**Test Files Included:**
- `custom-validators.spec.ts` – 10+ validator tests
- `form-validator.service.spec.ts` – Service logic tests
- `api.service.spec.ts` – API service tests
- `button.component.spec.ts` – UI component tests
- `app.component.spec.ts` – Root component tests

---

## 📚 Documentation

**Coding Standards:**
See `.github/instructions/angular.instructions.md` for:
- Architecture best practices
- Component design patterns
- State management guidelines
- Security considerations
- Performance optimization tips

**Folder Structure:**
See `.github/instructions/angular-folder-structure.instructions.md` for:
- Directory organization
- Naming conventions
- Module boundaries
- Lazy loading setup

---

## 🐳 Docker

**Build & Run:**
```bash
docker build -t enterprise-angular .
docker run -p 4000:4000 enterprise-angular
```

**Multi-stage build:**
1. Build stage: Angular + Node build
2. Runtime stage: Lean Node image with dist artifacts

---

## 📊 Bundle Size

**Initial Bundle:** ~617kB (including Material)
**Lazy Feature Chunks:** ~1-2kB each
**Budget Thresholds:**
- Initial: 600kB (warning) / 1.2MB (error)
- Optimized via tree-shaking & code splitting

---

## 🛠️ NPM Scripts

```bash
npm start              # Dev server (ng serve)
npm run build          # Production build
npm test               # Run tests
npm run mock-api       # Start json-server on :3000
npm run dev-with-mock  # Run dev + mock-api concurrently
npm run watch          # Watch mode build
```

---

## 🤝 Contributing

1. Follow Angular style guide (see `.github/instructions/`)
2. Use standalone components
3. Add tests for new features
4. Update README if adding major features

---

## 📄 License

Open source template for enterprise Angular applications.

---

**Happy coding! 🚀**