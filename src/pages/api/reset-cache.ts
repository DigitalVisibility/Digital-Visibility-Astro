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

    console.log('[RESET CACHE] Starting cache reset');

    // Delete cached metrics and daily aggregates
    const keysToDelete: string[] = ['funnel:live'];
    const now = new Date();

    // Also clear daily aggregates for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      keysToDelete.push(`funnel:daily:${dateStr}`);
    }

    // Delete all cache keys
    await Promise.all(
      keysToDelete.map(key =>
        locals.runtime?.env?.FUNNEL_DATA?.delete(key)
      )
    );

    console.log('[RESET CACHE SUCCESS] Cleared', keysToDelete.length, 'cache keys');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cache cleared successfully - metrics will recalculate on next fetch',
        keysDeleted: keysToDelete.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[RESET CACHE ERROR]:', error);
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
