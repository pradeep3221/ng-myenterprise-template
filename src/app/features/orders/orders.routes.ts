import { Route } from '@angular/router';

export const ordersRoutes: Route[] = [
  { path: '', loadComponent: () => import('./pages/orders-list/orders-list.page').then(m => m.OrdersListPage) },
  { path: ':id', loadComponent: () => import('./pages/order-detail/order-detail.page').then(m => m.OrderDetailPage) }
];
