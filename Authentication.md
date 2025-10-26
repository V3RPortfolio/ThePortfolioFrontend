# Authentication Component

This section contains details about the authentication system that will be used within the frontend Angular Application.


## Techstack

1. Framework: Angular
2. stylesheet: scss
3. Markup: HTML
4. CSS Framework: Bootstrap

## Components and Services

1. Service: src/app/services/authentication.service.ts
2. Interceptor: src/app/interceptors/authentication.interceptor.ts
3. Page: src/app/pages/login/
4. Component: src/app/components/loginForm/

## Backend
1. Url: https://gateway.vip3rtech6069.com/
2. Openapi specification:

```json
{
    "openapi": "3.1.0",
    "info": {
        "title": "Portfolio API",
        "version": "1.0.0",
        "description": "Portfolio API"
    },
    "paths": {
        "/api/auth/v1/token": {
            "post": {
                "operationId": "authentication_views_login",
                "summary": "Login",
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
                    "401": {
                        "description": "Unauthorized",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorMessage"
                                }
                            }
                        }
                    }
                },
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/TokenPayload"
                            }
                        }
                    },
                    "required": true
                }
            }
        },
        "/api/auth/v1/refresh": {
            "post": {
                "operationId": "authentication_views_refresh_token",
                "summary": "Refresh Token",
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
                    "401": {
                        "description": "Unauthorized",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorMessage"
                                }
                            }
                        }
                    }
                },
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/RefreshTokenPayload"
                            }
                        }
                    },
                    "required": true
                }
            }
        },
        "/api/auth/v1/me": {
            "get": {
                "operationId": "authentication_views_me",
                "summary": "Me",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "title": "Response",
                                    "type": "object"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Unauthorized",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorMessage"
                                }
                            }
                        }
                    }
                },
                "security": [
                    {
                        "AuthBearer": []
                    }
                ]
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
            "ErrorResponse": {
                "properties": {
                    "error": {
                        "title": "Error",
                        "type": "string"
                    },
                    "stack_trace": {
                        "anyOf": [
                            {
                                "type": "string"
                            },
                            {
                                "type": "null"
                            }
                        ],
                        "title": "Stack Trace"
                    }
                },
                "required": [
                    "error"
                ],
                "title": "ErrorResponse",
                "type": "object"
            },
            "RegenerateTokenResponse": {
                "properties": {
                    "token": {
                        "title": "Token",
                        "type": "string"
                    },
                    "message": {
                        "title": "Message",
                        "type": "string"
                    }
                },
                "required": [
                    "token",
                    "message"
                ],
                "title": "RegenerateTokenResponse",
                "type": "object"
            },
            "CreateResponse": {
                "properties": {
                    "payload": {
                        "default": [],
                        "items": {
                            "$ref": "#/components/schemas/CreateResponsePayload"
                        },
                        "title": "Payload",
                        "type": "array"
                    }
                },
                "title": "CreateResponse",
                "type": "object"
            },
            "CreateResponsePayload": {
                "properties": {
                    "model": {
                        "anyOf": [
                            {
                                "type": "object"
                            },
                            {
                                "type": "null"
                            }
                        ],
                        "title": "Model"
                    },
                    "success": {
                        "title": "Success",
                        "type": "boolean"
                    },
                    "error": {
                        "anyOf": [
                            {
                                "type": "string"
                            },
                            {
                                "type": "null"
                            }
                        ],
                        "title": "Error"
                    }
                },
                "required": [
                    "success"
                ],
                "title": "CreateResponsePayload",
                "type": "object"
            }
        },
        "securitySchemes": {
            "AuthBearer": {
                "type": "http",
                "scheme": "bearer"
            }
        }
    },
    "servers": []
}
```

## Functionalities
1. Login
2. Refresh token
3. Validate token in interceptor
4. Refresh expired tokens via interceptor