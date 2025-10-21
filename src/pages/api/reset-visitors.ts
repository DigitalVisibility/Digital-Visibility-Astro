import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify Basic Auth
    const credentials = atob(authHeader.split(' ')[1]);
    const [username, password] = credentials.split(':');

    const adminUser = locals.runtime?.env?.ADMIN_USER || import.meta.env.ADMIN_USER;
    const adminPass = locals.runtime?.env?.ADMIN_PASS || import.meta.env.ADMIN_PASS;

    if (username !== adminUser || password !== adminPass) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[RESET VISITORS] Starting visitor data reset');

    // Delete only pageview tracking data (last 30 days)
    const keysToDelete: string[] = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      keysToDelete.push(`funnel:pageviews:${dateStr}:a`);
      keysToDelete.push(`funnel:pageviews:${dateStr}:b`);
    }

    // Delete all visitor keys
    await Promise.all(
      keysToDelete.map(key =>
        locals.runtime?.env?.FUNNEL_DATA?.delete(key)
      )
    );

    // Also clear the live cache
    await locals.runtime?.env?.FUNNEL_DATA?.delete('funnel:live');

    console.log('[RESET VISITORS SUCCESS] Deleted', keysToDelete.length, 'visitor tracking keys');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Visitor tracking data reset successfully',
        keysDeleted: keysToDelete.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[RESET VISITORS ERROR]:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
