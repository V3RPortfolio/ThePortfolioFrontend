import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, TokenPayload, RefreshTokenPayload } from '../interfaces/backend/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly baseUrl = environment.ADMIN_BACKEND_API;
  private readonly authApi = (environment as any).AUTH_API_BASE || `${this.baseUrl}/api/auth/v1`;

  private readonly TOKEN_TYPE_KEY = 'auth.token_type';
  private readonly ACCESS_TOKEN_KEY = 'auth.access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth.refresh_token';

  constructor(private http: HttpClient) {}

  // POST /api/auth/v1/token
  login(payload: TokenPayload): Observable<AuthResponse> {
    const url = `${this.authApi}/token`;
    return this.http.post<AuthResponse>(url, payload).pipe(
      tap((res) => this.setTokens(res))
    );
  }

  // POST /api/auth/v1/refresh
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    const url = `${this.authApi}/refresh`;
    const body: RefreshTokenPayload = { refresh_token: refreshToken };
    return this.http.post<AuthResponse>(url, body).pipe(
      tap((res) => this.setTokens(res))
    );
  }

  // GET /api/auth/v1/me (expects Authorization header; typically attached via interceptor)
  getMe<T = any>(): Observable<T> {
    const url = `${this.authApi}/me`;
    return this.http.get<T>(url);
  }

  // Token helpers
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getTokenType(): string | null {
    return localStorage.getItem(this.TOKEN_TYPE_KEY);
  }

  setTokens(res: AuthResponse): void {
    if (res.access_token) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, res.access_token);
    }
    if (res.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refresh_token);
    }
    if (res.token_type) {
      localStorage.setItem(this.TOKEN_TYPE_KEY, res.token_type);
    }
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_TYPE_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
