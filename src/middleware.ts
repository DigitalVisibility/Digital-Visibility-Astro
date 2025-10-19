import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, request } = context;

  // Handle funnel A/B split routing BEFORE anything else
  if (url.pathname === '/funnel' || url.pathname === '/funnel/') {
    console.log('=== MIDDLEWARE: Funnel route detected ===');
    console.log('Path:', url.pathname);

    // Simple 50/50 random split - NO cookies, NO KV for debugging
    const random = Math.random();
    const variant = random < 0.5 ? 'a' : 'b';

    console.log('Random:', random);
    console.log('Variant:', variant);
    console.log('Logic: random < 0.5 =', random < 0.5);

    const redirectUrl = new URL(`/funnel/${variant}/`, url.origin);
    console.log('Redirecting to:', redirectUrl.toString());

    const response = Response.redirect(redirectUrl.toString(), 302);
    response.headers.set('Set-Cookie', `funnel_variant=${variant}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`);

    console.log('=== MIDDLEWARE: Redirect response created ===');
    return response;
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
