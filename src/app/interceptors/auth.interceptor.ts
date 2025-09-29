import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  
  // Add auth header with jwt token if available
  const token = authService.getToken();
  let authReq = req;
  
  if (token && !authService.isTokenExpired()) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // Add common headers
 if (!(req.body instanceof FormData)) {
    authReq = authReq.clone({
      headers: authReq.headers.set('Content-Type', 'application/json')
    });
  }


  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          break;
        case 401:
          errorMessage = 'Unauthorized access';
          // Auto logout if 401 response returned from api
          authService.logout();
          router.navigate(['/login']);
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 422:
          errorMessage = 'Validation failed';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          break;
      }

      // Show error toast for non-401 errors (401 is handled by redirect)
      if (error.status !== 401) {
        toastr.error(errorMessage, 'Error');
      }

      return throwError(() => error);
    })
  );
};