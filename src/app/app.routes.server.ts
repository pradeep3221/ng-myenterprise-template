import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Do not prerender dynamic routes with params
  { path: 'orders/:id', renderMode: RenderMode.Server },
  // Prerender everything else (static routes)
  { path: '**', renderMode: RenderMode.Prerender }
];
