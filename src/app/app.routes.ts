import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage)
	},
	{
		path: 'auth/callback',
		loadComponent: () => import('./features/auth/auth-callback.component').then(m => m.AuthCallbackComponent)
	},
	{
		path: '',
		component: AdminLayoutComponent,
		canActivate: [authGuard],
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
