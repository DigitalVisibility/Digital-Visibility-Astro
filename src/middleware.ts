import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, request } = context;

  // Handle funnel A/B routing
  if (url.pathname === '/funnel' || url.pathname === '/funnel/') {
    console.log('=== MIDDLEWARE: Funnel A/B Split ===');

    // Check for existing variant cookie
    const cookieHeader = request.headers.get('Cookie') || '';
    const existingVariant = cookieHeader
      .split('; ')
      .find(row => row.startsWith('funnel_variant='))
      ?.split('=')[1];

    let variant: string;

    if (existingVariant && (existingVariant === 'a' || existingVariant === 'b')) {
      // User already has a variant assigned, use it
      variant = existingVariant;
      console.log('Existing variant from cookie:', variant);
    } else {
      // New user - assign variant based on 50/50 random split
      const random = Math.random();
      variant = random < 0.5 ? 'a' : 'b';
      console.log('New assignment - Random:', random, 'Variant:', variant);
    }

    const redirectUrl = new URL(`/funnel/${variant}/`, url.origin);
    console.log('Redirecting to:', redirectUrl.toString());

    // Create response with headers (set cookie only for new users)
    const headers: Record<string, string> = {
      'Location': redirectUrl.toString()
    };

    if (!existingVariant) {
      headers['Set-Cookie'] = `funnel_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`;
    }

    return new Response(null, {
      status: 302,
      headers
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
