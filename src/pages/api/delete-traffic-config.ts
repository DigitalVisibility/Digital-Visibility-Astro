import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Delete traffic config from KV
    await locals.runtime?.env?.FUNNEL_DATA?.delete('funnel:traffic_config');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Traffic config deleted - will use default 50/50 split',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
