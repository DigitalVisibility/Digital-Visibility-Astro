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

    console.log('[RESET LEADS] Starting lead data reset');

    // Get all lead keys
    const leadList = await locals.runtime?.env?.FUNNEL_DATA?.list({ prefix: 'funnel:lead:' });
    const keysToDelete: string[] = [];

    if (leadList?.keys) {
      leadList.keys.forEach(key => keysToDelete.push(key.name));
    }

    // Delete all lead keys
    await Promise.all(
      keysToDelete.map(key =>
        locals.runtime?.env?.FUNNEL_DATA?.delete(key)
      )
    );

    // Also clear the live cache
    await locals.runtime?.env?.FUNNEL_DATA?.delete('funnel:live');

    console.log('[RESET LEADS SUCCESS] Deleted', keysToDelete.length, 'lead records');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead/conversion data reset successfully',
        keysDeleted: keysToDelete.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[RESET LEADS ERROR]:', error);
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
