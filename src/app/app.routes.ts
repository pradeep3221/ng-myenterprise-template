import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout';

export const routes: Routes = [
	{
		path: '',
		component: AdminLayoutComponent,
		children: [
			{
				path: 'orders',
				loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes)
			},
			{ path: '', redirectTo: 'orders', pathMatch: 'full' }
		]
	},
	{ path: '**', loadComponent: () => import('./shared/ui/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
