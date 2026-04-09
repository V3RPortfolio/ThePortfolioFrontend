## Oauth2 Implementation

**Project Directory: /app**
**Project Type: Angular**
**Application Base URL: http://localhost:4200**
**Backend Base URL: https://gateway.zohairmehtab.com**

### Important Files

1. **Route Name Definition:** src/app/app.constants.ts

2. **Route Configuration:** src/app/app.routes.ts

3. **Login Page:** src/app/pages/login

4. **Oauth2 Button & Functionality Component:** src/app/components/oauth2/google

5. **Authentication Service:** src/app/services/authentication.service.ts


### Backend OpenApi Specification

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Portfolio API",
    "version": "1.0.0",
    "description": "Portfolio API"
  },
  "paths": {
    "/auth/oauth2/login/google": {
      "get": {
        "operationId": "authentication_views_oauth2_google_oauth_login",
        "summary": "Google Oauth Login",
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GoogleOAuth2RedirectUrlPayload"
                }
              }
            }
          }
        }
      }
    },
    "/auth/oauth2/callback/google": {
      "get": {
        "operationId": "authentication_views_oauth2_google_oauth",
        "summary": "Google Oauth",
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "title": "Response",
                  "type": "object"
                }
              }
            }
          }
        }
      }
    },
    "/auth/oauth2/info": {
      "get": {
        "operationId": "authentication_views_oauth2_get_user_info",
        "summary": "Get User Info",
        "parameters": [
          {
            "in": "query",
            "name": "token",
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "title": "Token"
            },
            "required": false
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GoogleOauth2Info"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "title": "Response",
                  "type": "object"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "title": "Response",
                  "type": "object"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "title": "Response",
                  "type": "object"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "AuthResponse": {
        "properties": {
          "access_token": {
            "title": "Access Token",
            "type": "string"
          },
          "refresh_token": {
            "title": "Refresh Token",
            "type": "string"
          },
          "token_type": {
            "default": "bearer",
            "title": "Token Type",
            "type": "string"
          }
        },
        "required": [
          "access_token",
          "refresh_token"
        ],
        "title": "AuthResponse",
        "type": "object"
      },
      "ErrorMessage": {
        "properties": {
          "message": {
            "title": "Message",
            "type": "string"
          }
        },
        "required": [
          "message"
        ],
        "title": "ErrorMessage",
        "type": "object"
      },
      "TokenPayload": {
        "properties": {
          "username": {
            "title": "Username",
            "type": "string"
          },
          "password": {
            "title": "Password",
            "type": "string"
          }
        },
        "required": [
          "username",
          "password"
        ],
        "title": "TokenPayload",
        "type": "object"
      },
      "RefreshTokenPayload": {
        "properties": {
          "refresh_token": {
            "title": "Refresh Token",
            "type": "string"
          }
        },
        "required": [
          "refresh_token"
        ],
        "title": "RefreshTokenPayload",
        "type": "object"
      },
      "GoogleOAuth2RedirectUrlPayload": {
        "properties": {
          "redirect_url": {
            "title": "Redirect Url",
            "type": "string"
          }
        },
        "required": [
          "redirect_url"
        ],
        "title": "GoogleOAuth2RedirectUrlPayload",
        "type": "object"
      },
      "GoogleOauth2Info": {
        "properties": {
          "email": {
            "title": "Email",
            "type": "string"
          },
          "name": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Name"
          },
          "picture": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Picture"
          },
          "sub": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Sub"
          },
          "given_name": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Given Name"
          },
          "family_name": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Family Name"
          },
          "email_verified": {
            "anyOf": [
              {
                "type": "boolean"
              },
              {
                "type": "null"
              }
            ],
            "title": "Email Verified"
          }
        },
        "required": [
          "email"
        ],
        "title": "GoogleOauth2Info",
        "type": "object"
      }
    }
  },
  "servers": []
}
```

### Objectives

The main objective of this task is to add OAuth2 login using Google. The feature will be added to the Angular application's login page. 

Currently the page supports login using username and password. The new objective is to add a 'Sign In With Google' button which will trigger an OAuth2 authentication flow and finally return a access token and a refresh token generated by the backend application.

The frontend application will store the tokens for authorized requests to the backend application

### OAuth2 Flow

1. Frontend sends a request to backend to retrieve the redirect URL for google Oauth2.

2. Frontend redirects the user to Google's login page. It should update the query parameters of the URL so that the redirect url is set as the frontend applications '/oauth2/callback/google' route instead of the backend application. Currently, the URL returned by the backend application sets redirect URL as the backend application.

3. Google completes authentication and redirects the user to callback URL. It sends some data as query parameters like code, state, iss, etc. 

4. Frontend application receives the parameters and calls the callback URL of the backend application to pass the data and retrieve access token and refresh token in exchange.

5. Frontend application sets the token to storage and redirects the user to admin page.

### Task Breakdown

1. Create interfaces related to the payload that the frontend will receive as response when making requests to related to OAuth2 login. The schema related to each request can be found in the OpenApi specification.

2. Update the authentication service to include the feature of fetching redirect url, retrieving exchange token in exchange for the code, state, and other data provided by Google's callback request.

3. Update the Google OAuth2 button component's functionality. First it replaces the redirect URL provided by backend with Frontend's login page URL. It then redirects the user to Google's OAuth2 login page using the complete URL with query params.

4. Update the login page to receive query parameters from request. It should extract code, scope, state, and error parameters and their values from the Google's Oauth callback. It should then send the data to backend's callback url and retrieve an access token.

5. The login page upon receiving successful access token should save the data using authentication service and redirect the user to admin page.