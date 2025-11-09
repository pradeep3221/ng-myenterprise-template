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


```

---

## Enterprise Additions

This template includes enterprise scaffolding:

- Runtime configuration via `public/config.json` and `APP_CONFIG` token
- Core services: `ApiService`, `LoggerService`, `AuthService`, `AnalyticsService`
- HTTP auth interceptor and `authGuard`
- Global error handler
- Feature example: `orders` with lazy routes
- Shared UI primitives: `ButtonComponent`, `NotFoundComponent`
- Styles: SCSS partials under `src/styles/*` imported by `src/styles.scss`

### Develop
```pwsh
ng serve
```

### Build SSR and run
```pwsh
ng build
node dist/ng-myenterprise-template/server/server.mjs
```

### Docker (optional)
```pwsh
docker build -t enterprise-angular .
docker run -p 4000:4000 enterprise-angular
```

For folder structure and conventions, see `.github/instructions/angular-folder-structure.instructions.md`.