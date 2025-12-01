import type { AuthResponse, RefreshTokenPayload } from "../interfaces/authResponse.interface";
import httpService from "./http.service";

import { TOKEN_TYPE_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, authApi } from "../constants";

export class AuthenticationService {
  // POST /api/auth/v1/refresh
  refreshToken(refreshToken: string): Promise<AuthResponse> {
    const url = `${authApi}/refresh`;
    const body: RefreshTokenPayload = { refresh_token: refreshToken };
    return httpService.post<AuthResponse>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // GET /api/auth/v1/me (expects Authorization header; typically attached via interceptor)
  getMe<T = any>(): Promise<T> {
    const url = `${authApi}/me`;
    return httpService.get<T>(url, {}, true);
  }

  // Token helpers
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getTokenType(): string | null {
    return localStorage.getItem(TOKEN_TYPE_KEY);
  }

  setTokens(res: AuthResponse): void {
    if (res.access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
    }
    if (res.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
    }
    if (res.token_type) {
      localStorage.setItem(TOKEN_TYPE_KEY, res.token_type);
    }
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}


export default new AuthenticationService();