// DTOs for authentication endpoints based on OpenAPI spec in Authentication.md

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string; // default: 'bearer'
}

export interface TokenPayload {
  username: string;
  password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface ErrorMessage {
  message: string;
}

// --- OAuth2 (Google) interfaces ---

/** Response from GET /auth/oauth2/login/google */
export interface GoogleOAuth2RedirectUrlPayload {
  redirect_url: string;
}

/** Response from GET /auth/oauth2/info */
export interface GoogleOauth2Info {
  email: string;
  name?: string | null;
  picture?: string | null;
  sub?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  email_verified?: boolean | null;
}

/**
 * Query parameters forwarded by Google to the frontend callback URL
 * after the user completes (or cancels) the Google OAuth2 flow.
 */
export interface GoogleOAuth2CallbackParams {
  code?: string;
  state?: string;
  scope?: string;
  error?: string;
  redirect?: string; // Custom param we set to know which frontend callback URL to use (in case we have multiple)
  /** Any other params Google may include */
  [key: string]: string | undefined;
}
