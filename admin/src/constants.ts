export const TOKEN_TYPE_KEY = 'auth.token_type';
export const ACCESS_TOKEN_KEY = 'auth.access_token';
export const REFRESH_TOKEN_KEY = 'auth.refresh_token';

export const baseUrl = import.meta.env.VITE_APP_BASE_URL || '';
export const gatewayApi = import.meta.env.VITE_GATEWAY_API || '';
export const requireAuth = import.meta.env.VITE_AUTHENTICATE === 'true';
export const loginPath = `${import.meta.env.VITE_APP_WEBSITE_URL}/login` || '/';

export const devAccessToken = import.meta.env.VITE_DEV_ACCESS_TOKEN;
export const devRefreshToken = import.meta.env.VITE_DEV_REFRESH_TOKEN;
export const devTokenType = import.meta.env.VITE_DEV_TOKEN_TYPE;

export const jwtHeader = `${import.meta.env.VITE_JWT_HEADER || 'Authorization'}`;

export const authApi = `${gatewayApi}/${import.meta.env.VITE_AUTH_API_PATH || 'auth'}`;
export const elasticsearchEndpoint = import.meta.env.VITE_ELASTIC_ENDPOINT || `${gatewayApi}/elastic`;
export const organizationApi = `${gatewayApi}/${import.meta.env.VITE_ORGANIZATION_API_PATH || 'organization'}`;
export const notificationApi = `${gatewayApi}/${import.meta.env.VITE_NOTIFICATION_API_PATH || 'notification'}`;
export const deviceApi = `${organizationApi}/devices`;



export const elasticIndices = {
    processExecutions: 'process_executions',
    processTree: 'process_tree',
    ioDevices: 'io_devices',
    deviceMetrics: 'device_metrics',
    runningProcesses: 'running_processes'
}

export type NotificationType = 'invitation' | 'alert';
export const TOAST_DURATION = 4000;