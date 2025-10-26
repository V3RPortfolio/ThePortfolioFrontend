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
