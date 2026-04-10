export const TOKEN_TYPE_KEY = 'auth.token_type';
export const ACCESS_TOKEN_KEY = 'auth.access_token';
export const REFRESH_TOKEN_KEY = 'auth.refresh_token';

export const jwtHeader = `${import.meta.env.VITE_JWT_HEADER || 'Authorization'}`;
export const authApi = `${import.meta.env.VITE_GATEWAY_API}/auth`;

export const baseUrl = import.meta.env.VITE_APP_BASE_URL || '';
export const loginPath = import.meta.env.VITE_APP_WEBSITE_URL || '/';
export const adminPath = '/admin';
export const requireAuth = import.meta.env.VITE_AUTHENTICATE === 'true';

export const devAccessToken = import.meta.env.VITE_DEV_ACCESS_TOKEN;
export const devRefreshToken = import.meta.env.VITE_DEV_REFRESH_TOKEN;
export const devTokenType = import.meta.env.VITE_DEV_TOKEN_TYPE;

export const elasticsearchEndpoint = `${import.meta.env.VITE_GATEWAY_API}/elastic`;
export const elasticIndices = {
    processExecutions: 'process_executions',
    processTree: 'process_tree',
    ioDevices: 'io_devices',
    deviceMetrics: 'device_metrics',
    runningProcesses: 'running_processes'
}