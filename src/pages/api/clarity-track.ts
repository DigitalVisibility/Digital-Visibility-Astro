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

    // Store Clarity event data in KV store
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    
    const clarityEvent = {
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
      `clarity:event:${Date.now()}`,
      JSON.stringify(clarityEvent),
      { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
    );

    // Update daily aggregated data
    await updateDailyClarityData(platform?.env, today, event, data, variant);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Clarity tracking error:', error);
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

async function updateDailyClarityData(env, date, event, data, variant) {
  try {
    const dailyKey = `clarity:daily:${date}`;
    const existingData = await env?.FUNNEL_DATA?.get(dailyKey);
    
    let dailyStats = existingData ? JSON.parse(existingData) : {
      date,
      engagement: {
        averageSessionDuration: 0,
        bounceRate: 0,
        rageClicks: 0,
        scrollDepth: 0
      },
      heatmap: {
        ctaClicks: 0,
        formInteractions: 0
      },
      events: {
        pageView: 0,
        sessionStart: 0,
        rageClick: 0,
        scrollDepth: 0,
        ctaClick: 0,
        formInteraction: 0
      }
    };

    // Update stats based on event type
    switch (event) {
      case 'sessionStart':
        dailyStats.events.sessionStart++;
        if (data.duration) {
          dailyStats.engagement.averageSessionDuration = 
            (dailyStats.engagement.averageSessionDuration + data.duration) / 2;
        }
        break;
      
      case 'pageView':
        dailyStats.events.pageView++;
        break;
      
      case 'rageClick':
        dailyStats.events.rageClick++;
        dailyStats.engagement.rageClicks++;
        break;
      
      case 'scrollDepth':
        dailyStats.events.scrollDepth++;
        if (data.depth > dailyStats.engagement.scrollDepth) {
          dailyStats.engagement.scrollDepth = data.depth;
        }
        break;
      
      case 'ctaClick':
        dailyStats.events.ctaClick++;
        dailyStats.heatmap.ctaClicks++;
        break;
      
      case 'formInteraction':
        dailyStats.events.formInteraction++;
        dailyStats.heatmap.formInteractions++;
        break;
    }

    // Store updated daily data
    await env?.FUNNEL_DATA?.put(
      dailyKey,
      JSON.stringify(dailyStats),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
    );

  } catch (error) {
    console.error('Error updating daily Clarity data:', error);
  }
}
