import type { APIRoute } from 'astro';

export const prerender = false;

// FORCE TO B FOR TESTING - Prove the route works
export const GET: APIRoute = async () => {
  console.log('=== ASTRO ROUTE /funnel - FORCING TO B ===');

  // Create redirect with explicit headers
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/funnel/b/',
      'Set-Cookie': 'funnel_variant=b; Path=/; Max-Age=2592000; SameSite=Lax',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Test-Route': 'astro-funnel-ts'
    }
  });
};
