import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_TYPE_KEY, authApi, jwtHeader, loginPath } from '../constants';
import type { AuthResponse, RefreshTokenPayload } from '../interfaces/authResponse.interface';
class HttpService {

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

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const url = `${authApi}/refresh`;
        const body: RefreshTokenPayload = { refresh_token: refreshToken };
        const res = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
        }

        return (await res.json()) as AuthResponse;
    }

    private addAuthorizationHeader(headers: Record<string, any>): boolean {
        const tokenType = this.getTokenType();
        const accessToken = this.getAccessToken();
        if (!tokenType || !accessToken) return false;

        headers[jwtHeader] = `${tokenType} ${accessToken}`;
        return true;
    }

    async fetch<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {
        const headers: Record<string, any> = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        if (withAuth && !this.addAuthorizationHeader(headers)) throw new Error('No access token found for authorized request');

        let res = await fetch(url, {
            ...options,
            headers
        });

        if(withAuth && !!this.getAccessToken() && res.status === 401) {
            console.info('Access token expired, attempting to refresh token...');
            const refreshToken = this.getRefreshToken();
            if(!refreshToken) {
                window.location.href = loginPath;
                throw new Error('No refresh token found for token refresh');
            }

            try {
                const newTokens = await this.refreshToken(refreshToken);
                if(newTokens.access_token) {
                    console.info('Token refresh successful, retrying original request with new access token');
                    this.setTokens(newTokens);
                    // Retry original request with new access token
                    this.addAuthorizationHeader(headers);
                    console.info('Retrying request to', url, 'with new access token');
                    res = await fetch(url, {
                        ...options,
                        headers: headers
                    });
                } else {
                    console.error('Token refresh response did not contain new access token:', newTokens);
                    window.location.href = loginPath;
                    throw new Error('Token refresh failed, user logged out');
                    
                }
            } catch (err) {
                this.clearTokens();
                throw new Error('Token refresh failed, user logged out');
            }
        }

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
        }

        // If response has no body
        if (res.status === 204) {
            return undefined as unknown as T;
        }

        return (await res.json()) as T;
    }

    async get<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {        
        try {
            return await this.fetch<T>(url, { ...options, method: 'GET' }, withAuth);
        } catch (err) {
            console.error(`GET request to ${url} failed:`, err);
            throw err;
        }
    }

    async post<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {

        try {
            return await this.fetch<T>(url, { ...options, method: 'POST' }, withAuth);
        } catch (err) {
            console.error(`POST request to ${url} failed:`, err);
            throw err;
        }
    }

    async put<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {
        
        try {
            return await this.fetch<T>(url, { ...options, method: 'PUT' }, withAuth);
        } catch (err) {
            console.error(`PUT request to ${url} failed:`, err);
            throw err;
        }
    }

    async delete<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {
        try {
            return await this.fetch<T>(url, { ...options, method: 'DELETE' }, withAuth);
        } catch (err) {
            console.error(`DELETE request to ${url} failed:`, err);
            throw err;
        }
    }
}

export default new HttpService();