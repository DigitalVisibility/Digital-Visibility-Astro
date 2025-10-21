import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { variant, page, sessionId } = data;

    if (!variant || !page || !sessionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Store pageview in KV - increment daily counter
    const today = new Date().toISOString().split('T')[0];
    const pageviewKey = `funnel:pageviews:${today}:${variant}`;

    console.log('[PAGEVIEW DEBUG] Tracking pageview:', { variant, page, sessionId, date: today });

    try {
      // Get existing pageview data
      const existingData = await locals.runtime?.env?.FUNNEL_DATA?.get(pageviewKey);
      let pageviewData: { count: number; sessions: Set<string> };

      if (existingData) {
        const parsed = JSON.parse(existingData);
        pageviewData = {
          count: parsed.count || 0,
          sessions: new Set(parsed.sessions || [])
        };
      } else {
        pageviewData = {
          count: 0,
          sessions: new Set()
        };
      }

      // Add this session if it's new
      const isNewSession = !pageviewData.sessions.has(sessionId);
      if (isNewSession) {
        pageviewData.sessions.add(sessionId);
        pageviewData.count++;
      }

      // Store updated data
      await locals.runtime?.env?.FUNNEL_DATA?.put(
        pageviewKey,
        JSON.stringify({
          count: pageviewData.count,
          sessions: Array.from(pageviewData.sessions),
          variant,
          date: today,
          lastUpdated: new Date().toISOString()
        }),
        { expirationTtl: 60 * 60 * 24 * 90 } // 90 days
      );

      console.log('[PAGEVIEW SUCCESS] Stored pageview, total unique visitors:', pageviewData.count);

      return new Response(
        JSON.stringify({
          success: true,
          isNewSession,
          totalVisitors: pageviewData.count
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (kvError) {
      console.error('[PAGEVIEW ERROR] KV storage error:', kvError);
      return new Response(
        JSON.stringify({ success: false, error: 'Storage error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('[PAGEVIEW ERROR] Pageview tracking error:', error);
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
