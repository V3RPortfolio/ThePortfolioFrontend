export const environment = {
    WORDPRESS_BACKEND_API: process.env['WORDPRESS_BACKEND_API'] || 'http://localhost:8080',
    WORDPRESS_API_KEY_USERNAME: process.env['WORDPRESS_API_KEY_USERNAME'] || 'admin',
    WORDPRESS_API_KEY: process.env['WORDPRESS_API_KEY'] || 'password',
};
