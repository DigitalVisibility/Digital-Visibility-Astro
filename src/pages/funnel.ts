import type { APIRoute } from 'astro';

export const prerender = false;

// Simple A/B redirect - FORCE TO B FOR TESTING
export const GET: APIRoute = async ({ redirect }) => {
  console.log('=== /funnel route hit - redirecting to B ===');

  // Force redirect to variant B for testing
  return redirect('/funnel/b/', 302);
};
