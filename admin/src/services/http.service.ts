import { ACCESS_TOKEN_KEY, TOKEN_TYPE_KEY } from '../constants';
class HttpService {

    private getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    private getTokenType(): string | null {
        return localStorage.getItem(TOKEN_TYPE_KEY);
    }

    private addAuthorizationHeader(headers: Record<string, any>): boolean {
        const tokenType = this.getTokenType();
        const accessToken = this.getAccessToken();
        if(!tokenType || !accessToken) return false;

        headers['Authorization'] = `${tokenType} ${accessToken}`;
        return true;
    }
    
    async get<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {

        const headers: Record<string, any> = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        if(withAuth && !this.addAuthorizationHeader(headers)) throw new Error('No access token found for authorized request');

        const res = await fetch(url, {
            ...options,
            headers
        });

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

    async post<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if(withAuth && !this.addAuthorizationHeader(headers)) throw new Error('No access token found for authorized request');

        const res = await fetch(url, {
            ...options,
            headers
        });

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

    async put<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if(withAuth && !this.addAuthorizationHeader(headers)) throw new Error('No access token found for authorized request');

        const res = await fetch(url, {
            ...options,
            headers
        });

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

    async delete<T>(
        url: string,
        options: RequestInit = {},
        withAuth: boolean = false
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if(withAuth && !this.addAuthorizationHeader(headers)) throw new Error('No access token found for authorized request');

        const res = await fetch(url, {
            ...options,
            headers
        });

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
}

export default new HttpService();