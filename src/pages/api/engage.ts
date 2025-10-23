import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[ENGAGE] ====== START ENGAGEMENT REQUEST ======');
  
  try {
    const events = await request.json();
    
    console.log('[ENGAGE] Received events:', {
      count: Array.isArray(events) ? events.length : 1,
      timestamp: new Date().toISOString()
    });

    // Store engagement events in KV if available
    if (locals.runtime?.env?.FUNNEL_DATA) {
      try {
        // Store events with timestamp key
        const timestamp = Date.now();
        const key = `funnel:engage:${timestamp}`;
        
        await locals.runtime.env.FUNNEL_DATA.put(
          key,
          JSON.stringify({
            events: Array.isArray(events) ? events : [events],
            timestamp: new Date().toISOString()
          }),
          { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
        );
        
        console.log('[ENGAGE] ✅ Stored engagement events in KV');
      } catch (kvError) {
        console.error('[ENGAGE] KV storage error:', kvError);
      }
    } else {
      console.log('[ENGAGE] 🔧 LOCAL MODE - KV not available, events logged only');
    }

    // Log events for debugging
    if (Array.isArray(events)) {
      events.forEach((event, index) => {
        console.log(`[ENGAGE] Event ${index + 1}:`, {
          type: event.type,
          variant: event.variant,
          page: event.page,
          sessionId: event.sessionId?.substring(0, 8) + '...',
          data: event.data
        });
      });
    }

    console.log('[ENGAGE] ====== END ENGAGEMENT REQUEST ======');

    return new Response(
      JSON.stringify({ 
        success: true, 
        received: Array.isArray(events) ? events.length : 1,
        mode: locals.runtime?.env?.FUNNEL_DATA ? 'production' : 'local'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('[ENGAGE] ❌ Error processing engagement events:', error);
    
    // Still return success to not block client-side tracking
    return new Response(
      JSON.stringify({ 
        success: true,
        error: 'Processing error but events received'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};