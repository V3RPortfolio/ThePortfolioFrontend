export const environment = {
    WORDPRESS_BACKEND_API: process.env['WORDPRESS_BACKEND_API'] || 'http://localhost:8080',
    WORDPRESS_API_KEY_USERNAME: process.env['WORDPRESS_API_KEY_USERNAME'] || 'admin',
    WORDPRESS_API_KEY: process.env['WORDPRESS_API_KEY'] || 'password',

    ADMIN_GITHUB_API: process.env['DJANGO_GITHUB_BACKEND_API'] || 'http://localhost:8000/github/graphql/v1',
    ADMIN_CSRF_API: process.env['DJANGO_GET_CSRF_PATH'] || 'http://localhost:8000/csrf',
    ADMIN_BACKEND_API: process.env['DJANGO_ADMIN_BACKEND_API'] || 'http://localhost:8000',
    // Derived auth API base for convenience in services/interceptors
    GATEWAY_BACKEND_API: process.env['GATEWAY_BACKEND_API'] || 'http://localhost:8005',
};
