# GitHub Copilot Prompt — Scaffold a Complete Angular Project

You are an expert Angular architect.  
Scaffold a **complete Angular project structure** with modern best practices and reusable structure, following these requirements:

## 🎯 Project Overview
- Project Name: `ng-starter-template`
- Framework: Angular 19+ with standalone components
- Language: TypeScript
- Style: SCSS
- Routing: Enabled
- Strict Mode: Enabled
- Target: Browser (SPA)
- Build Tool: Angular CLI
- UI Library: Angular Material (optionally TailwindCSS)
- Responsive: Yes
- Server-Side Rendering: Yes
- Static Site Generation: Yes
- Navigation: Yes
- HTTP Client: Angular HttpClient
- Version Control: Git with `.gitignore` for Node, Angular, and VSCode
- Optimizations: Yes
- Testing: Yes
- Linting: Yes
- Documentation: Yes
- Docker: Yes
- Folder Structure: Yes
- Environment Variables: Yes
- Features: Yes
- Global Error Handling and Error Handling: Yes
- Logging: Yes
- Analytics: Yes
- Security: Yes
- Performance: Yes
- SEO: Yes
- Accessibility: Yes
- (Optional)Feature Flagging: Yes
- (Optional) PWA: Yes
- (Optional) Internationalization: Yes
- (Optional) Kubernetes: Yes
- (Optional) End-to-end Testing: Yes
- (Optional) Storybook: Yes
- (Optional) Prettier: Yes
- (Optional) ESLint: Yes
- (Optional) CI/CD: GitHub Actions for linting, testing, and building

---

## 🧱 Project Structure
Organize folders as follows:

src/
├── app/
│ ├── core/ # Singleton services, interceptors, and guards
│ │ ├── interceptors/
│ │ ├── guards/
│ │ ├── services/
│ │ ├── models/
│ │ └── core.module.ts
│ ├── shared/ # Shared components, directives, and pipes
│ │ ├── components/
│ │ ├── directives/
│ │ ├── pipes/
│ │ └── shared.module.ts
│ ├── features/ # Feature modules
│ │ ├── home/
│ │ ├── login/
│ │ ├── dashboard/
│ │ └── feature.module.ts
│ ├── layouts/ # Layouts (auth, main)
│ ├── app-routing.module.ts
│ ├── app.component.ts
│ └── app.module.ts
├── assets/
├── environments/
│ ├── environment.ts
│ └── environment.prod.ts
└── styles/
├── _variables.scss
├── _mixins.scss
└── styles.scss


**Docker related files**
* .dockerignore
* Dockerfile
* nginx.conf

Proxying to a backend server --only work in your local environment
* proxy.conf.json
---

## ⚙️ Core Functionality

### 1. **API Service (Reusable)**
- Create `ApiService` under `core/services/api.service.ts`
- Responsibilities:
  - Handle GET, POST, PUT, DELETE with proper error handling
  - Use environment base URL
  - Return typed observables
  - Centralized `handleError()` method using `HttpErrorResponse`
  - Example endpoint call: `/api/users`

### 2. **HTTP Interceptor**
- Add `AuthInterceptor` for JWT token handling
- Automatically attach `Authorization: Bearer <token>` if available
- Handle `401 Unauthorized` globally and redirect to `/login`

### 3. **Guards**
- Add `AuthGuard` to protect authenticated routes

### 4. **Environment Config**
- `environment.ts` → `apiBaseUrl: 'http://localhost:4200/api'`
- `environment.prod.ts` → production API URL

### 5. **Routing**
- Define lazy-loaded routes for `home`, `login`, and `dashboard`
- Add route protection for authenticated routes

### 6. **Shared Components**
- Create sample shared components:
  - `HeaderComponent`
  - `FooterComponent`
  - `LoadingSpinnerComponent`
- Add `SharedModule` with proper exports/imports

### 7. **Feature Example**
- Create `HomeModule`:
  - `home.component.ts` calls API via `ApiService` to display user list
  - Add routing `/home`

### 8. **Error Handling**
- Implement a global error handler (`GlobalErrorHandler`)
- Log errors to console and optionally a logging service

### 9. **Styling**
- Configure global SCSS with:
  - `_variables.scss` for colors
  - `_mixins.scss` for responsive utilities
- Enable Angular Material theme support
- Enable TailwindCSS if needed (npx tailwindcss init -p)

### 10. **Testing**
- Unit testing with Jest or Jasmine
- e2e testing placeholder with Cypress

---

## 🧩 Example API Call Flow

**home.component.ts**
```typescript
ngOnInit(): void {
  this.apiService.get<User[]>('/users').subscribe({
    next: users => this.users = users,
    error: err => console.error('Error loading users', err)
  });
}


api.service.ts
get<T>(url: string): Observable<T> {
  return this.http.get<T>(`${this.baseUrl}${url}`).pipe(
    catchError(this.handleError)
  );
}

## 🚀 Bonus Setup
* Add TailwindCSS (npx tailwindcss init -p)
* Configure Prettier + ESLint
* Add Husky pre-commit hook for lint + test
* Add Storybook setup for shared components
* Add environment switcher in navbar for debugging

## Potential Next Enhancements (optional):

Advanced State: Add @ngrx/signals or similar for complex state
Form Validation: Shared form validation utilities
E2E Testing: Cypress or Playwright setup
CI/CD: GitHub Actions pipeline
Performance: Bundle budget optimization, lazy image loading
A11y: Accessibility audit & improvements
i18n: Internationalization setup
Database Integration: Example service for Postgres/MongoDB
Real Mock API: Implement actual mock responses (e.g., json-server)
Storybook: Component library documentation
Swagger Integration: Auto-generated API docs