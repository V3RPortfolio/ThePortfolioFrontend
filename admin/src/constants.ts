export const TOKEN_TYPE_KEY = 'auth.token_type';
export const ACCESS_TOKEN_KEY = 'auth.access_token';
export const REFRESH_TOKEN_KEY = 'auth.refresh_token';
export const authApi = `${import.meta.env.VITE_GATEWAY_API}/auth`;


export const loginPath = import.meta.env.VITE_APP_WEBSITE_URL || '/';
export const adminPath = '/admin';
export const requireAuth = import.meta.env.VITE_AUTHENTICATE === 'true';