# NgMyenterpriseTemplate

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.18.
Server and hybrid rendering
Sass (SCSS) 

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.



## Quick Start Guide

```
**ng new ng-myenterprise-template**
```
//To create an Angular project within an existing folder using the Angular CLI, follow these steps: Navigate to the Existing Folder.
```
ng new ng-myenterprise-template --directory .
```

✔ Which stylesheet format would you like to use? Sass (SCSS) [https://sass-lang.com/documentation/syntax#scss]
✔ Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? Yes
	https://angular.dev/guide/ssr
✔ Would you like to use the Server Routing and App Engine APIs (Developer Preview) for this server application? Yes


# Prompts
```md

scaffold all the complete project aspects as per the copilot custome instructions.

✅ Standalone components (Angular 19+)
✅ Material Design UI
✅ Responsive layout
✅ Navigation structure
✅ Proper styling
✅ TypeScript best practices
✅ Follows Angular coding standards

# GitHub Copilot Prompt — Scaffold a Complete Angular Project

You are an expert Angular architect.  
Scaffold a **complete Angular project structure** with modern best practices, following these requirements:

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

🚀 Bonus Setup
* Add TailwindCSS (npx tailwindcss init -p)
* Configure Prettier + ESLint
* Add Husky pre-commit hook for lint + test
* Add Storybook setup for shared components
* Add environment switcher in navbar for debugging

```