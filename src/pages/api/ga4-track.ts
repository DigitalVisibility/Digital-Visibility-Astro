import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, platform }) => {
  try {
    const body = await request.json();
    const { event, data, variant } = body;

    if (!event || !data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing event or data' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Store GA4 event data in KV store
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    
    const ga4Event = {
      date: today,
      timestamp,
      event,
      data,
      variant,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('cf-connecting-ip')
    };

    // Store individual event
    await platform?.env?.FUNNEL_DATA?.put(
      `ga4:event:${Date.now()}`,
      JSON.stringify(ga4Event),
      { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
    );

    // Update daily aggregated data
    await updateDailyGA4Data(platform?.env, today, event, data, variant);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('GA4 tracking error:', error);
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

async function updateDailyGA4Data(env, date, event, data, variant) {
  try {
    const dailyKey = `ga4:daily:${date}`;
    const existingData = await env?.FUNNEL_DATA?.get(dailyKey);
    
    let dailyStats = existingData ? JSON.parse(existingData) : {
      date,
      variants: {
        A: { visitors: 0, conversions: 0, pageviews: 0 },
        B: { visitors: 0, conversions: 0, pageviews: 0 }
      },
      total: { visitors: 0, conversions: 0, pageviews: 0 }
    };

    // Update stats based on event type
    switch (event) {
      case 'page_view':
        dailyStats.variants[variant].pageviews++;
        dailyStats.total.pageviews++;
        break;
      
      case 'session_start':
        dailyStats.variants[variant].visitors++;
        dailyStats.total.visitors++;
        break;
      
      case 'conversion':
      case 'form_submission':
        dailyStats.variants[variant].conversions++;
        dailyStats.total.conversions++;
        break;
    }

    // Store updated daily data
    await env?.FUNNEL_DATA?.put(
      dailyKey,
      JSON.stringify(dailyStats),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
    );

  } catch (error) {
    console.error('Error updating daily GA4 data:', error);
  }
}
