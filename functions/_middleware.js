// Cloudflare Pages Functions Middleware
// This runs at the edge on every request

const FUNNEL_COOKIE_NAME = 'funnel_variant';
const FUNNEL_COOKIE_MAX_AGE = 2592000; // 30 days

/**
 * Test endpoint to verify middleware is working
 */
const handleMiddlewareTest = () => {
  return new Response('✓ Middleware is working! Cloudflare Pages Functions are active.', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'X-Middleware-Test': 'true',
      'X-Powered-By': 'Cloudflare Pages Functions'
    }
  });
};

/**
 * Handle funnel A/B testing with 50/50 split
 */
const handleFunnelRouting = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Check for existing variant cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const existingVariant = cookieHeader
    .split('; ')
    .find(row => row.startsWith(`${FUNNEL_COOKIE_NAME}=`))
    ?.split('=')[1];

  let variant;

  if (existingVariant && (existingVariant === 'a' || existingVariant === 'b')) {
    // User already has a variant assigned, use it
    variant = existingVariant;
  } else {
    // New user - assign variant based on 50/50 random split
    variant = Math.random() < 0.5 ? 'a' : 'b';
  }

  // Redirect to the variant page with trailing slash
  const redirectUrl = new URL(`/funnel/${variant}/`, url.origin);

  // Create response headers
  const headers = {
    'Location': redirectUrl.toString()
  };

  // Set cookie only for new users
  if (!existingVariant) {
    headers['Set-Cookie'] = `${FUNNEL_COOKIE_NAME}=${variant}; Path=/; Max-Age=${FUNNEL_COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
  }

  return new Response(null, {
    status: 302,
    headers
  });
};

/**
 * Handle admin authentication with Basic Auth
 */
const handleAdminAuth = async (context) => {
  const { request, env } = context;
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

    // Get credentials from environment variables
    const adminUser = env.ADMIN_USER;
    const adminPass = env.ADMIN_PASS;

    if (!adminUser || !adminPass) {
      console.error('Admin credentials not configured. Make sure ADMIN_USER and ADMIN_PASS are set.');
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

    // Authentication passed - continue to the page and add noindex header
    const response = await context.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;

  } catch (error) {
    return new Response('Invalid authentication format', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
        'Content-Type': 'text/plain'
      }
    });
  }
};

/**
 * Main middleware handler
 */
export const onRequest = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Test endpoint to verify middleware is working
  if (url.pathname === '/middleware-test') {
    return handleMiddlewareTest();
  }

  // Handle funnel A/B routing
  if (url.pathname === '/funnel' || url.pathname === '/funnel/') {
    return handleFunnelRouting(context);
  }

  // Handle admin authentication
  if (url.pathname.startsWith('/admin/')) {
    return handleAdminAuth(context);
  }

  // Continue to the next middleware or page
  return context.next();
};
