import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Auth interceptor attaches Bearer token to protected resource requests.
 * It will try to acquire a token silently for the matching resource scopes.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Always prefer scoped token based on protectedResources, else fallback to cached token
  return from(auth.getAccessTokenForRequest(req.url)).pipe(
    switchMap(token => {
      const bearer = token || auth.token;
      const reqWithAuth = bearer
        ? req.clone({ setHeaders: { Authorization: `Bearer ${bearer}` } })
        : req;
      return next(reqWithAuth);
    }),
    catchError(() => {
      // On any unexpected error, proceed without header
      return next(req);
    })
  );
};
