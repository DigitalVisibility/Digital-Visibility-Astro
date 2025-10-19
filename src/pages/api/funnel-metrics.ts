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

    const adminUser = platform?.env?.ADMIN_USER || import.meta.env.ADMIN_USER;
    const adminPass = platform?.env?.ADMIN_PASS || import.meta.env.ADMIN_PASS;

    if (username !== adminUser || password !== adminPass) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Aggregate real-time data from KV leads
    let data;

    try {
      // Try to get cached live data first
      const cachedData = await platform?.env?.FUNNEL_DATA?.get('funnel:live');

      if (cachedData) {
        data = JSON.parse(cachedData);
      } else {
        // If no cached data, aggregate from leads
        data = await aggregateFunnelData(platform);

        // Cache the aggregated data for 5 minutes
        if (platform?.env?.FUNNEL_DATA) {
          await platform.env.FUNNEL_DATA.put(
            'funnel:live',
            JSON.stringify(data),
            { expirationTtl: 300 } // 5 minutes
          );
        }
      }
    } catch (error) {
      console.error('Error getting funnel data:', error);
      // Return empty state if no data available
      data = getEmptyFunnelData();
    }

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

async function aggregateFunnelData(platform: any) {
  try {
    // Get all leads from KV
    const leadList = await platform?.env?.FUNNEL_DATA?.list({ prefix: 'funnel:lead:' });

    if (!leadList || !leadList.keys || leadList.keys.length === 0) {
      return getEmptyFunnelData();
    }

    // Fetch all lead data
    const leads = await Promise.all(
      leadList.keys.slice(0, 100).map(async (key: { name: string }) => {
        const data = await platform.env.FUNNEL_DATA.get(key.name);
        return data ? JSON.parse(data) : null;
      })
    );

    // Filter out nulls and count by variant
    const validLeads = leads.filter(Boolean);
    const leadsA = validLeads.filter(l => l.variant === 'a');
    const leadsB = validLeads.filter(l => l.variant === 'b');

    // For now, estimate visitors as leads * 20 (5% conversion rate estimate)
    // In a real implementation, you'd track actual page views
    const visitorsA = Math.max(leadsA.length * 20, leadsA.length);
    const visitorsB = Math.max(leadsB.length * 20, leadsB.length);
    const totalVisitors = visitorsA + visitorsB;
    const totalConversions = leadsA.length + leadsB.length;

    const conversionRateA = visitorsA > 0 ? (leadsA.length / visitorsA) * 100 : 0;
    const conversionRateB = visitorsB > 0 ? (leadsB.length / visitorsB) * 100 : 0;

    // Calculate winner and improvement
    let winner = 'Insufficient Data';
    let improvement = '0%';

    if (totalConversions >= 5) {
      if (conversionRateB > conversionRateA && conversionRateA > 0) {
        winner = 'Variant B';
        improvement = '+' + (((conversionRateB - conversionRateA) / conversionRateA) * 100).toFixed(1) + '%';
      } else if (conversionRateA > conversionRateB && conversionRateB > 0) {
        winner = 'Variant A';
        improvement = '+' + (((conversionRateA - conversionRateB) / conversionRateB) * 100).toFixed(1) + '%';
      } else {
        winner = 'Tie';
        improvement = '0%';
      }
    }

    return {
      summary: {
        totalVisitors,
        totalConversions,
        totalRevenue: totalConversions * 200, // £200 per conversion
        testDuration: 1,
        confidenceLevel: totalConversions > 20 ? 95 : totalConversions > 10 ? 85 : 70,
        winner,
        improvement
      },
      variants: {
        a: {
          visitors: visitorsA,
          conversions: leadsA.length,
          conversionRate: conversionRateA,
          revenue: leadsA.length * 200,
          trafficAllocation: totalVisitors > 0 ? (visitorsA / totalVisitors) * 100 : 50
        },
        b: {
          visitors: visitorsB,
          conversions: leadsB.length,
          conversionRate: conversionRateB,
          revenue: leadsB.length * 200,
          trafficAllocation: totalVisitors > 0 ? (visitorsB / totalVisitors) * 100 : 50
        }
      },
      recommendations: [],
      recentActivity: validLeads.slice(-5).reverse().map(lead => ({
        time: new Date(lead.timestamp).toLocaleString('en-GB'),
        action: `New lead from Variant ${lead.variant.toUpperCase()}: ${lead.name}`,
        type: 'success'
      })),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error aggregating funnel data:', error);
    return getEmptyFunnelData();
  }
}

function getEmptyFunnelData() {
  return {
    summary: {
      totalVisitors: 0,
      totalConversions: 0,
      totalRevenue: 0,
      testDuration: 0,
      confidenceLevel: 0,
      winner: 'No Data',
      improvement: '0%'
    },
    variants: {
      a: {
        visitors: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0,
        trafficAllocation: 50
      },
      b: {
        visitors: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0,
        trafficAllocation: 50
      }
    },
    recommendations: [],
    recentActivity: [{
      time: 'Just now',
      action: 'Waiting for funnel submissions',
      type: 'info'
    }],
    lastUpdated: new Date().toISOString()
  };
}
