import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { environment } from '../../environments/environment';

// List of regex strings to BYPASS token injection and refresh handling
// You can add more patterns (e.g., for external services or static assets)
export const AUTH_BYPASS_URLS: string[] = [
  '^.*/api/auth/v1/token$',
  '^.*/api/auth/v1/refresh$',
];

const BYPASS_REGEX: RegExp[] = AUTH_BYPASS_URLS.map((p) => new RegExp(p));

// Single-flight refresh control
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isBypassed(url: string): boolean {
  return BYPASS_REGEX.some((rx) => rx.test(url));
}

function shouldAttachAuth(url: string): boolean {
  // Only attach to ADMIN_BACKEND_API origin
  return !!environment.ADMIN_BACKEND_API && url.startsWith(environment.ADMIN_BACKEND_API);
}

function addAuthHeader(req: HttpRequest<unknown>, token: string, tokenType?: string) {
  const type = tokenType || 'Bearer';
  return req.clone({
    setHeaders: {
      Authorization: `${type} ${token}`,
    },
  });
}

function decodeJwtExp(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    if (payload && typeof payload.exp === 'number') {
      return payload.exp; // seconds since epoch
    }
  } catch {
    // ignore invalid/opaque token
  }
  return null;
}

function isTokenExpired(token: string, skewSeconds = 10): boolean {
  const exp = decodeJwtExp(token);
  if (!exp) return false; // If we can't determine, assume not expired; 401 will handle
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec + skewSeconds >= exp;
}

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthenticationService);

  // Skip bypassed URLs entirely
  if (isBypassed(req.url)) {
    return next(req);
  }

  const access = auth.getAccessToken();
  const tokenType = auth.getTokenType() || 'Bearer';

  // If request should not carry auth, forward as-is
  if (!shouldAttachAuth(req.url)) {
    return next(req);
  }

  // If we have a token and it's not expired, attach and go
  if (access && !isTokenExpired(access)) {
    const authReq = addAuthHeader(req, access, tokenType);
    return next(authReq).pipe(
      catchError((err) => handleAuthError(err, req, next, auth))
    );
  }

  // If no token or expired -> attempt refresh flow, else forward and let 401 be handled
  return handleRefreshAndProceed(req, next, auth);
};

function handleAuthError(
  err: unknown,
  req: HttpRequest<unknown>,
  next: Parameters<HttpInterceptorFn>[1],
  auth: AuthenticationService,
): Observable<any> {
  if (err instanceof HttpErrorResponse && err.status === 401 && !isBypassed(req.url) && shouldAttachAuth(req.url)) {
    return handleRefreshAndProceed(req, next, auth);
  }
  return throwError(() => err);
}

function handleRefreshAndProceed(
  req: HttpRequest<unknown>,
  next: Parameters<HttpInterceptorFn>[1],
  auth: AuthenticationService,
): Observable<any> {
  const access = auth.getAccessToken();
  const refresh = auth.getRefreshToken();

  if (!refresh) {
    // No refresh token; clear and forward original request (likely to 401)
    if (!access) auth.clearTokens();
    return next(req);
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return auth.refreshToken(refresh).pipe(
      switchMap((res) => {
        const newAccess = res.access_token;
        const tokenType = res.token_type || 'Bearer';
        refreshTokenSubject.next(newAccess);
        const authReq = newAccess ? addAuthHeader(req, newAccess, tokenType) : req;
        return next(authReq);
      }),
      catchError((refreshErr) => {
        auth.clearTokens();
        return throwError(() => refreshErr);
      }),
      // Reset flag regardless of outcome
      finalizeReset()
    );
  }

  // Already refreshing: queue until we get a new token
  return refreshTokenSubject.pipe(
    filter((t): t is string => !!t),
    take(1),
    switchMap((token) => {
      const tokenType = auth.getTokenType() || 'Bearer';
      const authReq = addAuthHeader(req, token, tokenType);
      return next(authReq);
    })
  );
}

function finalizeReset() {
  return <T>(source: Observable<T>) => new Observable<T>((subscriber) => {
    const subscription = source.subscribe({
      next: (v) => subscriber.next(v),
      error: (e) => subscriber.error(e),
      complete: () => subscriber.complete(),
    });
    return () => {
      isRefreshing = false;
      subscription.unsubscribe();
    };
  });
}
