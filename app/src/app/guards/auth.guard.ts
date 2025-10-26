import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { RoutePaths } from '../app.constants';

// Function-based guard for Angular 15+
export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  // Redirect to login with returnUrl
  return router.createUrlTree([`/${RoutePaths.login}`], {
    queryParams: { returnUrl: state.url }
  });
};
