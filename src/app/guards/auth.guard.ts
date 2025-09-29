import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
): boolean => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const currentUser = authService.currentUserValue;
  
  // Check if user is authenticated
  if (!currentUser || !authService.isAuthenticated) {
    // Not logged in, redirect to login page
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if token is expired
  if (authService.isTokenExpired()) {
    authService.logout();
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if route is restricted by role
  const expectedRoles = route.data['expectedRoles'] as string[];
  if (expectedRoles && expectedRoles.length > 0) {
    const userRole = currentUser.role;
    if (!expectedRoles.includes(userRole)) {
      // User doesn't have required role, redirect to dashboard
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};