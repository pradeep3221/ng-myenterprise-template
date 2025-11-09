---
description: 'Angular-specific Workspace and project file structure'
applyTo: '**/*.ts, **/*.html, **/*.scss, **/*.css'
---

# Angular Folder Structure Guide (Angular 17+)

These instructions define a clear, scalable folder structure for Angular apps using standalone APIs, route-first lazy loading, and SSR (Angular Universal). This repository already follows several of these conventions (for example, `app.routes.ts`, `app.config.ts`, `main.server.ts`), and this guide standardizes the rest.

Best organizational patterns to manage large and complex frontend projects
    * Barrel Pattern?

## Goals

- Predictable navigation: find any file by feature and type.
- Scalable: support many features and teams without tangling dependencies.
- Standalone-first: prefer standalone components, route configs, and provider configuration.
- SSR-ready: separate server-only code; keep universal-safe browser logic guarded.
- Testing-first: co-located unit tests and minimal friction for e2e.

## Guiding principles

- Organize by feature first, by type second (feature folders contain components, routes, services, etc.).
- Keep singletons and cross-cutting concerns in `core/` (provided in root, created once).
- Share purely presentational, reusable UI in `shared/` (no app state, no global providers).
- Use route-based lazy loading for features. Avoid global module barrels; prefer explicit imports.
- One responsibility per file; consistent naming and suffixes.

## High-level structure

```
.
├─ public/                     # Static files served as-is (favicon, runtime config, robots.txt)
├─ src/
│  ├─ app/
│  │  ├─ core/                 # App-wide singletons and cross-cutting concerns
│  │  ├─ shared/               # Reusable UI: presentational components, directives, pipes
│  │  ├─ features/             # Feature areas (lazy loaded where possible)
│  │  ├─ app.component.*       # Root shell component (layout, router-outlet)
│  │  ├─ app.routes.ts         # Root route config (lazy-load feature routes)
│  │  ├─ app.config.ts         # Client-side providers (provideRouter, HttpClient, etc.)
│  │  ├─ app.config.server.ts  # Server-side providers (SSR-specific)
│  │  ├─ app.routes.server.ts  # Server-side route config patches when needed
│  ├─ assets/                  # Images, fonts, i18n, icons
│  │  └─ i18n/                 # Localization JSON files
│  ├─ styles/                  # Global styles: SCSS partials and design tokens
│  │  ├─ _variables.scss
│  │  ├─ _mixins.scss
│  │  ├─ _reset.scss
│  │  └─ index.scss            # Imports partials; imported by root styles.scss
│  ├─ main.ts                  # Client bootstrap
│  ├─ main.server.ts           # Server bootstrap (Angular Universal)
│  ├─ server.ts                # SSR server entry (e.g., Express)
│  └─ styles.scss              # Global stylesheet entry
├─ angular.json
├─ package.json
└─ tsconfig*.json
```

Notes:
- Keep `public/` for runtime-config JSON (for example, `public/config.json`), `robots.txt`, and files that must not be processed by the Angular builder.
- Put all images, fonts, and i18n files under `src/assets/`. Reference them via `/assets/...`.
- If you add Playwright or Cypress for e2e, create a top-level `e2e/` folder.

## Inside `app/`: layering and responsibilities

### `core/` (app singletons)

Put items created once and provided in root:
- Http interceptors
- Route guards/resolvers
- Global error and logging services
- Auth/session, API clients, configuration tokens
- Layout shell elements that are global (header, footer) if they depend on global state

Structure example:

```
src/app/core/
├─ config/
│  ├─ app-config.token.ts      # InjectionToken<AppConfig>
│  ├─ load-app-config.ts       # APP_INITIALIZER to fetch public/config.json
│  └─ types.ts                 # Config interfaces
├─ interceptors/
│  └─ auth.interceptor.ts
├─ guards/
│  └─ auth.guard.ts
├─ services/
│  ├─ auth.service.ts
│  └─ logger.service.ts
└─ layout/
	 └─ shell.component.ts
```

Provide core providers via `app.config.ts` (browser) and `app.config.server.ts` (server) rather than NgModules.

### `shared/` (reusable, stateless UI)

Pure presentational building blocks:
- Dumb components (inputs/outputs, no global state)
- Directives and pipes
- UI primitives and design system wrappers

Structure example:

```
src/app/shared/
├─ ui/
│  ├─ button/
│  │  ├─ button.component.ts
│  │  ├─ button.component.html
│  │  └─ button.component.scss
│  └─ card/
├─ pipes/
│  └─ currency-short.pipe.ts
└─ directives/
	 └─ autofocus.directive.ts
```

Do not register providers in `shared/` unless they are strictly component-scoped (providedIn: 'root' is fine for stateless utilities).

### `features/` (route/lazy oriented)

Each feature is an isolated folder with its own routes and internals:

```
src/app/features/
└─ orders/
	 ├─ components/              # Feature-only components
	 ├─ pages/                   # Routed pages (standalone)
	 ├─ data-access/             # Services, stores, queries
	 ├─ state/                   # Signals or NgRx (if used)
	 ├─ utils/                   # Feature utilities
	 ├─ orders.routes.ts         # Route config for the feature
	 └─ index.ts                 # Optional public API (types only)
```

Route configuration pattern (standalone, lazy):

```ts
// src/app/app.routes.ts
export const appRoutes: Route[] = [
	{
		path: 'orders',
		loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes),
	},
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: '**', loadComponent: () => import('./shared/ui/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
```

```ts
// src/app/features/orders/orders.routes.ts
export const ordersRoutes: Route[] = [
	{ path: '', loadComponent: () => import('./pages/orders-list/orders-list.page').then(m => m.OrdersListPage) },
	{ path: ':id', loadComponent: () => import('./pages/order-detail/order-detail.page').then(m => m.OrderDetailPage) }
];
```

## Naming conventions

- Folders and file names: kebab-case (`orders-list.page.ts`, `order-detail.component.ts`).
- Classes, types, and enums: PascalCase.
- Variables, functions, methods, properties: camelCase.
- Suffixes:
	- Component: `.component.ts`
	- Page (routed standalones): `.page.ts`
	- Directive: `.directive.ts`
	- Pipe: `.pipe.ts`
	- Service: `.service.ts`
	- Guard: `.guard.ts`
	- Interceptor: `.interceptor.ts`
	- Routes: `.routes.ts`
	- Specs: `.spec.ts`

## Styling structure

- Keep global design tokens and mixins in `src/styles/` as partials, imported from `src/styles.scss`.
- Co-locate component styles next to components (`.component.scss`).
- Prefer BEM or a small, documented class-naming convention; keep specificity low.

Example `styles/index.scss`:

```scss
@forward 'variables';
@use 'reset';
@use 'mixins';
```

## Assets and i18n

- Put images, fonts, and data files under `src/assets/`.
- i18n JSON under `src/assets/i18n/{locale}.json`.
- Reference assets with `/assets/...` paths.

## SSR and server-only code

- Client bootstrap: `src/main.ts`; Server bootstrap: `src/main.server.ts`.
- SSR server entry (for example, Express): `src/server.ts`. Keep Node-only imports isolated here.
- Avoid using browser-only APIs at module top-level. If needed, guard with platform checks (for example, `isPlatformBrowser`) inside lifecycle hooks.
- Provide server-specific providers in `app.config.server.ts` (cookies, absolute URLs, etc.).

## Testing

- Co-locate unit tests: `*.spec.ts` next to the unit under test.
- Use shallow component tests for presentational components in `shared/`.
- For e2e, create `e2e/` at the repo root (for example, Playwright or Cypress). Keep page objects under `e2e/pages/`.

## Runtime configuration and environments

- Prefer runtime config loaded from `public/config.json` at startup via `APP_INITIALIZER` and an `InjectionToken` (see `core/config/`). This avoids rebuilds per environment.
- For compile-time flags, keep a small `environment.ts` only if necessary, but minimize its usage in favor of runtime config.

## Barrel files (index.ts)

- Use selective barrels only for types and pure utilities inside a feature.
- Avoid large, app-wide barrels that encourage broad, implicit dependencies and increase the risk of cycles.

## Anti-patterns checklist

- Putting singletons in `shared/` (they belong in `core/`).
- Feature services provided globally by mistake (scope within the feature when possible).
- Eagerly loading large features in `app.routes.ts`.
- Deep relative imports out of a feature (`../../../../core/...`). Prefer absolute paths via TS path mapping if needed.

## Scaffolding helpers (CLI)

Use Angular CLI with standalone flags and explicit paths:

```bash
ng g c app/shared/ui/button --standalone
ng g c app/features/orders/pages/orders-list --standalone --flat=false --name=orders-list.page
ng g s app/features/orders/data-access/orders --flat=false
ng g directive app/shared/directives/autofocus --standalone
```

## Adoption checklist for this repo

1. Create `src/app/core/` and `src/app/shared/` if missing; move cross-cutting services to `core/`.
2. Create `src/app/features/` and start migrating routed pages into feature folders with `*.routes.ts`.
3. Add `src/styles/` partials and import them from `src/styles.scss`.
4. Add `src/assets/i18n/` if planning localization.
5. Introduce runtime config loading in `core/config/` and fetch from `public/config.json`.
6. Ensure SSR-specific providers live in `app.config.server.ts` and browser-only logic is guarded.

For more background, see Angular’s official file structure recommendations: https://angular.dev/reference/configs/file-structure


