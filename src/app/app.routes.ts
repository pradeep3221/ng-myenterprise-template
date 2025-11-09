import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'orders',
		loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes)
	},
	{ path: '', redirectTo: 'orders', pathMatch: 'full' },
	{ path: '**', loadComponent: () => import('./shared/ui/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
