import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
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

    const adminUser = locals.runtime?.env?.ADMIN_USER || import.meta.env.ADMIN_USER;
    const adminPass = locals.runtime?.env?.ADMIN_PASS || import.meta.env.ADMIN_PASS;

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

    console.log('[METRICS] ====== START METRICS REQUEST ======');
    console.log('[METRICS] Request time:', new Date().toISOString());
    console.log('[METRICS] KV Storage check:');
    console.log('[METRICS] - locals.runtime exists:', !!locals.runtime);
    console.log('[METRICS] - FUNNEL_DATA exists:', !!locals.runtime?.env?.FUNNEL_DATA);

    try {
      // Try to get cached live data first
      const cachedData = await locals.runtime?.env?.FUNNEL_DATA?.get('funnel:live');

      if (cachedData) {
        console.log('[METRICS] ✅ Using cached data');
        data = JSON.parse(cachedData);
        console.log('[METRICS] Cached data summary:', {
          totalVisitors: data.summary?.totalVisitors || 0,
          totalConversions: data.summary?.totalConversions || 0,
          lastUpdated: data.lastUpdated
        });
      } else {
        console.log('[METRICS] No cache found, aggregating fresh data...');
        // If no cached data, aggregate from leads
        data = await aggregateFunnelData(locals.runtime);

        // Cache the aggregated data for 5 minutes
        if (locals.runtime?.env?.FUNNEL_DATA) {
          await locals.runtime.env.FUNNEL_DATA.put(
            'funnel:live',
            JSON.stringify(data),
            { expirationTtl: 300 } // 5 minutes
          );
          console.log('[METRICS] ✅ Cached aggregated data for 5 minutes');
        }
      }
    } catch (error) {
      console.error('[METRICS] ❌ Error getting funnel data:', error);
      // Return empty state if no data available
      data = getEmptyFunnelData();
    }

    // Get latest AI recommendations
    const aiAdvice = await locals.runtime?.env?.FUNNEL_DATA?.get('funnel:ai_advice:latest');
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
      locals.runtime?.env?.FUNNEL_DATA?.get(`funnel:daily:${today}`),
      locals.runtime?.env?.FUNNEL_DATA?.get(`funnel:daily:${yesterday}`)
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

    console.log('[METRICS] Response summary:', {
      success: true,
      totalVisitors: data.summary?.totalVisitors || 0,
      totalConversions: data.summary?.totalConversions || 0,
      recommendationsCount: recommendations.length,
      hasTrends: !!trends.today || !!trends.yesterday
    });
    console.log('[METRICS] ====== END METRICS REQUEST ======');

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

async function aggregateFunnelData(runtime: any) {
  try {
    console.log('[AGGREGATE] Starting data aggregation...');
    console.log('[AGGREGATE] KV availability:', {
      runtime: !!runtime,
      env: !!runtime?.env,
      FUNNEL_DATA: !!runtime?.env?.FUNNEL_DATA
    });

    if (!runtime?.env?.FUNNEL_DATA) {
      console.error('[AGGREGATE] ⚠️ KV not available, returning demo data for local development');
      return getDemoFunnelData();
    }

    // Get all leads from KV
    console.log('[AGGREGATE] Fetching leads with prefix: funnel:lead:');
    const leadList = await runtime.env.FUNNEL_DATA.list({ prefix: 'funnel:lead:' });

    console.log('[AGGREGATE] Lead list results:', {
      found: !!leadList,
      keyCount: leadList?.keys?.length || 0,
      cursor: leadList?.cursor || 'none'
    });

    if (!leadList || !leadList.keys || leadList.keys.length === 0) {
      console.log('[AGGREGATE] No leads found in KV storage');
      return getEmptyFunnelData();
    }

    // Fetch all lead data
    const leads = await Promise.all(
      leadList.keys.slice(0, 100).map(async (key: { name: string }) => {
        const data = await runtime.env.FUNNEL_DATA.get(key.name);
        return data ? JSON.parse(data) : null;
      })
    );

    // Filter out nulls and count by variant
    const validLeads = leads.filter(Boolean);
    const leadsA = validLeads.filter(l => l.variant === 'a');
    const leadsB = validLeads.filter(l => l.variant === 'b');

    // Get REAL pageview counts from tracking data
    console.log('[AGGREGATE] Fetching pageview data...');
    const { visitorsA, visitorsB } = await getRealPageviews(runtime);

    console.log('[AGGREGATE] Data summary:');
    console.log('[AGGREGATE] - Variant A: ' + visitorsA + ' visitors, ' + leadsA.length + ' conversions');
    console.log('[AGGREGATE] - Variant B: ' + visitorsB + ' visitors, ' + leadsB.length + ' conversions');

    const totalVisitors = visitorsA + visitorsB;
    const totalConversions = leadsA.length + leadsB.length;
    
    console.log('[AGGREGATE] Totals: ' + totalVisitors + ' visitors, ' + totalConversions + ' conversions');

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

async function getRealPageviews(runtime: any): Promise<{ visitorsA: number; visitorsB: number }> {
  try {
    console.log('[PAGEVIEWS] Fetching pageview data for last 30 days...');
    
    // Get pageview data for last 30 days to get cumulative count
    const dates: string[] = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    console.log('[PAGEVIEWS] Checking dates:', dates.slice(0, 3), '... (30 days total)');

    let visitorsA = 0;
    let visitorsB = 0;
    const allSessionsA = new Set<string>();
    const allSessionsB = new Set<string>();
    let dataFoundDays = 0;

    // Fetch pageview data for each date
    await Promise.all(dates.map(async (date) => {
      const [pageviewDataA, pageviewDataB] = await Promise.all([
        runtime?.env?.FUNNEL_DATA?.get(`funnel:pageviews:${date}:a`),
        runtime?.env?.FUNNEL_DATA?.get(`funnel:pageviews:${date}:b`)
      ]);

      if (pageviewDataA || pageviewDataB) {
        dataFoundDays++;
      }

      if (pageviewDataA) {
        const parsed = JSON.parse(pageviewDataA);
        parsed.sessions?.forEach((s: string) => allSessionsA.add(s));
      }

      if (pageviewDataB) {
        const parsed = JSON.parse(pageviewDataB);
        parsed.sessions?.forEach((s: string) => allSessionsB.add(s));
      }
    }));

    visitorsA = allSessionsA.size;
    visitorsB = allSessionsB.size;

    console.log('[PAGEVIEWS] Results:', {
      daysWithData: dataFoundDays,
      uniqueVisitorsA: visitorsA,
      uniqueVisitorsB: visitorsB,
      totalVisitors: visitorsA + visitorsB
    });

    return { visitorsA, visitorsB };
  } catch (error) {
    console.error('[PAGEVIEWS] ❌ Error:', error);
    return { visitorsA: 0, visitorsB: 0 };
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

function getDemoFunnelData() {
  // Return realistic demo data for local development
  const now = new Date();
  const visitorsA = 156;
  const visitorsB = 144;
  const conversionsA = 12;
  const conversionsB = 18;
  
  return {
    summary: {
      totalVisitors: visitorsA + visitorsB,
      totalConversions: conversionsA + conversionsB,
      totalRevenue: (conversionsA + conversionsB) * 200,
      testDuration: 3,
      confidenceLevel: 89,
      winner: 'Variant B',
      improvement: '+50%'
    },
    variants: {
      a: {
        visitors: visitorsA,
        conversions: conversionsA,
        conversionRate: (conversionsA / visitorsA) * 100,
        revenue: conversionsA * 200,
        trafficAllocation: 52
      },
      b: {
        visitors: visitorsB,
        conversions: conversionsB,
        conversionRate: (conversionsB / visitorsB) * 100,
        revenue: conversionsB * 200,
        trafficAllocation: 48
      }
    },
    recommendations: [
      {
        priority: 'High',
        suggestion: 'Variant B is showing 50% better conversion rate. Consider increasing traffic allocation.',
        rationale: 'Statistical significance approaching 90% confidence level'
      },
      {
        priority: 'Medium',
        suggestion: 'The "Free AI Optimization" headline in Variant B resonates better with visitors',
        rationale: 'Direct value proposition performs better than feature-focused messaging'
      }
    ],
    recentActivity: [
      {
        time: new Date(now.getTime() - 5 * 60000).toLocaleString('en-GB'),
        action: 'New lead from Variant B: John Smith (Demo)',
        type: 'success'
      },
      {
        time: new Date(now.getTime() - 15 * 60000).toLocaleString('en-GB'),
        action: 'New lead from Variant A: Jane Doe (Demo)',
        type: 'success'
      },
      {
        time: new Date(now.getTime() - 30 * 60000).toLocaleString('en-GB'),
        action: 'Running in local demo mode - no KV storage available',
        type: 'warning'
      }
    ],
    lastUpdated: now.toISOString()
  };
}
