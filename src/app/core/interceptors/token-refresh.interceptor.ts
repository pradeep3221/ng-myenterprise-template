import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

/**
 * tokenRefreshInterceptor
 * - Catches 401 responses
 * - Attempts one silent token acquisition and retries the original request once
 * - If still failing, clears local auth state and redirects to login
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return from(auth.acquireTokenSilentAndStore()).pipe(
          switchMap(token => {
            if (token) {
              const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
              return next(retryReq);
            }
            // No token obtained; propagate error
            return throwError(() => err);
          }),
          catchError(innerErr => {
            // Hard failure: optionally clear state or navigate to login
            auth.logout(); // will clear local state and redirect
            return throwError(() => innerErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
