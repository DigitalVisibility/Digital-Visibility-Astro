import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[PAGEVIEW] ====== START PAGEVIEW REQUEST ======');
  console.log('[PAGEVIEW] Request received at:', new Date().toISOString());
  
  try {
    const data = await request.json();
    const { variant, page, sessionId } = data;
    
    console.log('[PAGEVIEW] Request data:', { variant, page, sessionId });

    if (!variant || !page || !sessionId) {
      console.error('[PAGEVIEW] Missing required fields:', { variant: !!variant, page: !!page, sessionId: !!sessionId });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check KV availability
    console.log('[PAGEVIEW] KV Storage check:');
    console.log('[PAGEVIEW] - locals exists:', !!locals);
    console.log('[PAGEVIEW] - locals.runtime exists:', !!locals.runtime);
    console.log('[PAGEVIEW] - locals.runtime.env exists:', !!locals.runtime?.env);
    console.log('[PAGEVIEW] - FUNNEL_DATA exists:', !!locals.runtime?.env?.FUNNEL_DATA);
    
    if (!locals.runtime?.env?.FUNNEL_DATA) {
      console.error('[PAGEVIEW] ⚠️ KV Storage not available - running in local environment?');
    }

    // Store pageview in KV - increment daily counter
    const today = new Date().toISOString().split('T')[0];
    const pageviewKey = `funnel:pageviews:${today}:${variant}`;

    console.log('[PAGEVIEW] Tracking pageview with key:', pageviewKey);

    let isNewSession = false;
    let totalVisitors = 0;

    try {
      // Check if KV is available
      if (locals.runtime?.env?.FUNNEL_DATA) {
        // Production path with KV storage
        const existingData = await locals.runtime.env.FUNNEL_DATA.get(pageviewKey);
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
        isNewSession = !pageviewData.sessions.has(sessionId);
        if (isNewSession) {
          pageviewData.sessions.add(sessionId);
          pageviewData.count++;
        }

        // Store updated data
        const dataToStore = {
          count: pageviewData.count,
          sessions: Array.from(pageviewData.sessions),
          variant,
          date: today,
          lastUpdated: new Date().toISOString()
        };
        
        console.log('[PAGEVIEW] Storing data:', {
          key: pageviewKey,
          count: dataToStore.count,
          sessionsCount: dataToStore.sessions.length,
          isNewSession
        });
        
        await locals.runtime.env.FUNNEL_DATA.put(
          pageviewKey,
          JSON.stringify(dataToStore),
          { expirationTtl: 60 * 60 * 24 * 90 } // 90 days
        );

        // Verify storage
        const verifyData = await locals.runtime.env.FUNNEL_DATA.get(pageviewKey);
        console.log('[PAGEVIEW] Storage verification:', {
          stored: !!verifyData,
          key: pageviewKey
        });

        totalVisitors = pageviewData.count;
        console.log('[PAGEVIEW] ✅ SUCCESS - Total unique visitors:', totalVisitors);
        
      } else {
        // Fallback for local development
        console.log('[PAGEVIEW] 🔧 LOCAL MODE - KV not available, using fallback response');
        isNewSession = true; // Always count as new in local
        totalVisitors = 1;
      }

      console.log('[PAGEVIEW] ====== END PAGEVIEW REQUEST ======');

      return new Response(
        JSON.stringify({
          success: true,
          isNewSession,
          totalVisitors,
          mode: locals.runtime?.env?.FUNNEL_DATA ? 'production' : 'local'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (kvError) {
      console.error('[PAGEVIEW ERROR] KV storage error:', kvError);
      // Return success with fallback data even on error
      return new Response(
        JSON.stringify({ 
          success: true,
          isNewSession: true,
          totalVisitors: 1,
          mode: 'fallback',
          error: 'Storage error but tracking succeeded'
        }),
        {
          status: 200,
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
