import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, request } = context;

  // Handle funnel routing - FORCE TO B FOR TESTING
  if (url.pathname === '/funnel' || url.pathname === '/funnel/') {
    console.log('=== MIDDLEWARE: FORCING REDIRECT TO FUNNEL B ===');

    const redirectUrl = new URL('/funnel/b/', url.origin);
    console.log('Redirecting to:', redirectUrl.toString());

    // Create response with headers in constructor (headers are immutable after creation)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
        'Set-Cookie': 'funnel_variant=b; Path=/; Max-Age=2592000; SameSite=Lax'
      }
    });
  }

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
