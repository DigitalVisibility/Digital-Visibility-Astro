import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, platform }) => {
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
    
    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_USER) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get live funnel data
    const liveData = await platform?.env?.FUNNEL_DATA?.get('funnel:live');
    if (!liveData) {
      return new Response(
        JSON.stringify({ success: false, error: 'No live data available' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = JSON.parse(liveData);

    // Get latest AI recommendations
    const aiAdvice = await platform?.env?.FUNNEL_DATA?.get('funnel:ai_advice:latest');
    let recommendations = [];
    
    if (aiAdvice) {
      try {
        const advice = JSON.parse(aiAdvice);
        const parsed = JSON.parse(advice.data);
        recommendations = parsed.recommendations || [];
      } catch (error) {
        console.error('Failed to parse AI advice:', error);
        recommendations = [{
          priority: 'Medium',
          suggestion: 'AI analysis in progress',
          rationale: 'Recommendations being generated'
        }];
      }
    }

    // Get historical data for trends
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [todayData, yesterdayData] = await Promise.all([
      platform?.env?.FUNNEL_DATA?.get(`funnel:daily:${today}`),
      platform?.env?.FUNNEL_DATA?.get(`funnel:daily:${yesterday}`)
    ]);

    const trends = {
      today: todayData ? JSON.parse(todayData) : null,
      yesterday: yesterdayData ? JSON.parse(yesterdayData) : null
    };

    // Calculate daily changes
    const dailyChanges = calculateDailyChanges(trends.today, trends.yesterday);

    const response = {
      success: true,
      data: {
        ...data,
        recommendations,
        trends,
        dailyChanges,
        lastUpdated: data.lastUpdated || new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );

  } catch (error) {
    console.error('Funnel metrics API error:', error);
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

function calculateDailyChanges(today, yesterday) {
  if (!today || !yesterday) {
    return {
      visitors: { change: 0, percentage: 0 },
      conversions: { change: 0, percentage: 0 },
      revenue: { change: 0, percentage: 0 }
    };
  }

  const visitorsChange = today.summary.totalVisitors - yesterday.summary.totalVisitors;
  const conversionsChange = today.summary.totalConversions - yesterday.summary.totalConversions;
  const revenueChange = today.summary.totalRevenue - yesterday.summary.totalRevenue;

  return {
    visitors: {
      change: visitorsChange,
      percentage: yesterday.summary.totalVisitors > 0 ? 
        (visitorsChange / yesterday.summary.totalVisitors * 100) : 0
    },
    conversions: {
      change: conversionsChange,
      percentage: yesterday.summary.totalConversions > 0 ? 
        (conversionsChange / yesterday.summary.totalConversions * 100) : 0
    },
    revenue: {
      change: revenueChange,
      percentage: yesterday.summary.totalRevenue > 0 ? 
        (revenueChange / yesterday.summary.totalRevenue * 100) : 0
    }
  };
}
