import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, request } = context;
  
  // Check if this is an admin route
  if (url.pathname.startsWith('/admin/')) {
    // Check for Basic Auth FIRST
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new Response('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
          'Content-Type': 'text/plain'
        }
      });
    }

    // Verify credentials
    try {
      const credentials = atob(authHeader.split(' ')[1]);
      const [username, password] = credentials.split(':');

      const adminUser = import.meta.env.ADMIN_USER;
      const adminPass = import.meta.env.ADMIN_PASS;

      if (!adminUser || !adminPass) {
        console.error('Admin credentials not configured. Make sure ADMIN_USER and ADMIN_PASS are set in .env');
        return new Response('Admin area not configured', { status: 500 });
      }

      if (username !== adminUser || password !== adminPass) {
        return new Response('Invalid credentials', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
            'Content-Type': 'text/plain'
          }
        });
      }
    } catch (error) {
      return new Response('Invalid authentication format', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
          'Content-Type': 'text/plain'
        }
      });
    }
    
    // If authentication passes, proceed and add noindex header
    const response = await next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }
  
  return next();
};
