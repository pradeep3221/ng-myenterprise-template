import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isAuthed = auth.isAuthenticated();
  console.log('🔒 [AUTH-GUARD] isAuthenticated:', isAuthed, 'for url:', state.url);
  if (!isAuthed) {
    void router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};
