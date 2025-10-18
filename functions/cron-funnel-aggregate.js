// Cloudflare Worker for scheduled data aggregation
// Runs every 12 hours to pull GA4 & Clarity data and store in KV

export default {
  async scheduled(event, env, ctx) {
    console.log('Starting enhanced funnel data aggregation...');
    
    try {
      // Process engagement events first
      await processEngagementEvents(env);
      
      // Fetch data from both sources
      const [ga4Data, clarityData] = await Promise.all([
        fetchGA4Data(env),
        fetchClarityData(env)
      ]);
      
      // Process and aggregate data with engagement insights
      const aggregatedData = await processFunnelDataWithEngagement(ga4Data, clarityData, env);
      
      // Store in KV
      await storeFunnelData(aggregatedData, env);
      
      // Generate AI recommendations with detailed engagement data
      await generateEnhancedAIRecommendations(aggregatedData, env);
      
      console.log('Enhanced funnel data aggregation completed successfully');
      
    } catch (error) {
      console.error('Funnel data aggregation failed:', error);
      // Send alert to admin (implement notification system)
    }
  }
};

async function fetchGA4Data(env) {
  const GA4_ID = env.GA4_ID;
  if (!GA4_ID) {
    throw new Error('GA4_ID not configured');
  }
  
  try {
    // Get access token for GA4 Reporting API
    const accessToken = await getGA4AccessToken(env);
    if (!accessToken) {
      throw new Error('Failed to get GA4 access token');
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch data for both variants
    const [variantAData, variantBData] = await Promise.all([
      fetchGA4VariantData(accessToken, GA4_ID, 'a', yesterday, today),
      fetchGA4VariantData(accessToken, GA4_ID, 'b', yesterday, today)
    ]);

    return {
      date: today,
      variants: {
        A: variantAData,
        B: variantBData
      },
      total: {
        visitors: variantAData.visitors + variantBData.visitors,
        conversions: variantAData.conversions + variantBData.conversions,
        pageviews: variantAData.pageviews + variantBData.pageviews
      }
    };
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    // Return empty data on error
    return {
      date: new Date().toISOString().split('T')[0],
      variants: {
        A: { visitors: 0, conversions: 0, pageviews: 0 },
        B: { visitors: 0, conversions: 0, pageviews: 0 }
      },
      total: { visitors: 0, conversions: 0, pageviews: 0 }
    };
  }
}

async function getGA4AccessToken(env) {
  // For GA4 Reporting API, you need to use Google Cloud credentials
  // This requires setting up a service account and getting credentials
  // For now, we'll use a placeholder - you need to implement OAuth2 or service account auth
  
  const GA4_CLIENT_ID = env.GA4_CLIENT_ID;
  const GA4_CLIENT_SECRET = env.GA4_CLIENT_SECRET;
  const GA4_REFRESH_TOKEN = env.GA4_REFRESH_TOKEN;
  
  if (!GA4_CLIENT_ID || !GA4_CLIENT_SECRET || !GA4_REFRESH_TOKEN) {
    console.log('GA4 OAuth credentials not configured - using measurement protocol instead');
    return null;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GA4_CLIENT_ID,
        client_secret: GA4_CLIENT_SECRET,
        refresh_token: GA4_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting GA4 access token:', error);
    return null;
  }
}

async function fetchGA4VariantData(accessToken, propertyId, variant, startDate, endDate) {
  // Use our custom tracking data instead of external API calls
  return await getCustomGA4Data(env, propertyId, variant, startDate, endDate);
}

async function getCustomGA4Data(env, propertyId, variant, startDate, endDate) {
  try {
    // Get our custom tracked GA4 data from KV store
    const today = new Date().toISOString().split('T')[0];
    const ga4DataKey = `ga4:daily:${today}`;
    
    const ga4Data = await env.FUNNEL_DATA?.get(ga4DataKey);
    
    if (ga4Data) {
      const data = JSON.parse(ga4Data);
      return {
        visitors: data.variants[variant.toUpperCase()]?.visitors || 0,
        conversions: data.variants[variant.toUpperCase()]?.conversions || 0,
        pageviews: data.variants[variant.toUpperCase()]?.pageviews || 0
      };
    }
    
    // Return default values if no data found
    return { visitors: 0, conversions: 0, pageviews: 0 };
  } catch (error) {
    console.error(`Error getting custom GA4 data for variant ${variant}:`, error);
    return { visitors: 0, conversions: 0, pageviews: 0 };
  }
}

async function fetchClarityData(env) {
  const CLARITY_ID = env.CLARITY_ID;
  if (!CLARITY_ID) {
    throw new Error('CLARITY_ID not configured');
  }
  
  try {
    // Microsoft Clarity doesn't have a public export API
    // We need to use their webhook or data export features
    // For now, we'll implement a custom tracking solution
    
    const clarityData = await fetchClarityMetrics(env, CLARITY_ID);
    
    return {
      date: new Date().toISOString().split('T')[0],
      engagement: clarityData.engagement,
      heatmap: clarityData.heatmap
    };
  } catch (error) {
    console.error('Error fetching Clarity data:', error);
    // Return empty data on error
    return {
      date: new Date().toISOString().split('T')[0],
      engagement: {
        averageSessionDuration: 0,
        bounceRate: 0,
        rageClicks: 0,
        scrollDepth: 0
      },
      heatmap: {
        ctaClicks: 0,
        formInteractions: 0
      }
    };
  }
}

async function fetchClarityMetrics(env, clarityId) {
  // Since Clarity doesn't have a public export API, we'll implement
  // a custom solution using their JavaScript API and our own tracking
  
  try {
    // Option 1: Use Clarity's JavaScript API to get session data
    // This requires the Clarity script to be loaded and accessible
    const claritySessionData = await getClaritySessionData(env, clarityId);
    
    // Option 2: Parse Clarity data from our own tracking
    // We can track Clarity events in our KV store
    const trackedData = await getTrackedClarityData(env);
    
    return {
      engagement: {
        averageSessionDuration: claritySessionData.averageSessionDuration || trackedData.averageSessionDuration || 0,
        bounceRate: claritySessionData.bounceRate || trackedData.bounceRate || 0,
        rageClicks: claritySessionData.rageClicks || trackedData.rageClicks || 0,
        scrollDepth: claritySessionData.scrollDepth || trackedData.scrollDepth || 0
      },
      heatmap: {
        ctaClicks: claritySessionData.ctaClicks || trackedData.ctaClicks || 0,
        formInteractions: claritySessionData.formInteractions || trackedData.formInteractions || 0
      }
    };
  } catch (error) {
    console.error('Error fetching Clarity metrics:', error);
    return {
      engagement: { averageSessionDuration: 0, bounceRate: 0, rageClicks: 0, scrollDepth: 0 },
      heatmap: { ctaClicks: 0, formInteractions: 0 }
    };
  }
}

async function getClaritySessionData(env, clarityId) {
  // This would require implementing a way to query Clarity's data
  // Since they don't provide a public API, we'll use our own tracking
  console.log('Clarity session data retrieval not implemented - using custom tracking');
  return {
    averageSessionDuration: 0,
    bounceRate: 0,
    rageClicks: 0,
    scrollDepth: 0,
    ctaClicks: 0,
    formInteractions: 0
  };
}

async function getTrackedClarityData(env) {
  // Get Clarity data from our own tracking in KV store
  try {
    const today = new Date().toISOString().split('T')[0];
    const clarityDataKey = `clarity:daily:${today}`;
    
    const trackedData = await env.FUNNEL_DATA?.get(clarityDataKey);
    
    if (trackedData) {
      return JSON.parse(trackedData);
    }
    
    // Return default values if no data found
    return {
      averageSessionDuration: 0,
      bounceRate: 0,
      rageClicks: 0,
      scrollDepth: 0,
      ctaClicks: 0,
      formInteractions: 0
    };
  } catch (error) {
    console.error('Error getting tracked Clarity data:', error);
    return {
      averageSessionDuration: 0,
      bounceRate: 0,
      rageClicks: 0,
      scrollDepth: 0,
      ctaClicks: 0,
      formInteractions: 0
    };
  }
}

async function processFunnelData(ga4Data, clarityData, env) {
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate conversion rates
  const variantA = {
    ...ga4Data.variants.A,
    conversionRate: ga4Data.variants.A.visitors > 0 ? 
      (ga4Data.variants.A.conversions / ga4Data.variants.A.visitors) : 0,
    revenue: ga4Data.variants.A.conversions * 200 // £200 per conversion
  };
  
  const variantB = {
    ...ga4Data.variants.B,
    conversionRate: ga4Data.variants.B.visitors > 0 ? 
      (ga4Data.variants.B.conversions / ga4Data.variants.B.visitors) : 0,
    revenue: ga4Data.variants.B.conversions * 200 // £200 per conversion
  };
  
  // Calculate total metrics
  const totalVisitors = variantA.visitors + variantB.visitors;
  const totalConversions = variantA.conversions + variantB.conversions;
  const totalRevenue = variantA.revenue + variantB.revenue;
  
  // Calculate statistical significance
  const confidence = calculateConfidence(variantA, variantB);
  
  // Determine winner
  const winner = variantB.conversionRate > variantA.conversionRate ? 'B' : 'A';
  const improvement = winner === 'B' ? 
    ((variantB.conversionRate - variantA.conversionRate) / variantA.conversionRate * 100) :
    ((variantA.conversionRate - variantB.conversionRate) / variantB.conversionRate * 100);
  
  return {
    date: today,
    summary: {
      totalVisitors,
      totalConversions,
      totalRevenue,
      overallConversionRate: totalVisitors > 0 ? (totalConversions / totalVisitors) : 0,
      testDuration: 7, // Calculate actual duration
      confidenceLevel: confidence,
      winner,
      improvement: `+${improvement.toFixed(1)}%`
    },
    variants: {
      A: variantA,
      B: variantB
    },
    engagement: clarityData.engagement,
    heatmap: clarityData.heatmap,
    lastUpdated: new Date().toISOString()
  };
}

function calculateConfidence(variantA, variantB) {
  // Simplified confidence calculation
  // In production, implement proper statistical significance testing
  const n1 = variantA.visitors;
  const n2 = variantB.visitors;
  const x1 = variantA.conversions;
  const x2 = variantB.conversions;
  
  if (n1 < 30 || n2 < 30) return 0; // Not enough data
  
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const pooledP = (x1 + x2) / (n1 + n2);
  
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  const z = Math.abs(p1 - p2) / se;
  
  // Convert z-score to confidence percentage
  return Math.min(99.9, Math.max(0, (1 - 2 * (1 - normalCDF(z))) * 100));
}

function normalCDF(x) {
  // Approximation of normal CDF
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function erf(x) {
  // Approximation of error function
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}

async function storeFunnelData(data, env) {
  const today = data.date;
  
  // Store daily data
  await env.FUNNEL_DATA.put(
    `funnel:daily:${today}`,
    JSON.stringify(data),
    { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
  );
  
  // Update live data
  await env.FUNNEL_DATA.put(
    'funnel:live',
    JSON.stringify(data),
    { expirationTtl: 60 * 60 * 12 } // 12 hours
  );
  
  // Store historical summary
  const historicalKey = `funnel:summary:${today}`;
  const summary = {
    date: today,
    totalVisitors: data.summary.totalVisitors,
    totalConversions: data.summary.totalConversions,
    totalRevenue: data.summary.totalRevenue,
    winner: data.summary.winner,
    confidence: data.summary.confidenceLevel
  };
  
  await env.FUNNEL_DATA.put(
    historicalKey,
    JSON.stringify(summary),
    { expirationTtl: 60 * 60 * 24 * 90 } // 90 days
  );
}

// Process raw engagement events into analytics
async function processEngagementEvents(env) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Process events for both today and yesterday
    const dates = [today, yesterday];
    
    for (const date of dates) {
      await processEngagementEventsForDate(env, date);
    }
    
    console.log('Engagement events processed successfully');
  } catch (error) {
    console.error('Error processing engagement events:', error);
  }
}

async function processEngagementEventsForDate(env, date) {
  try {
    const pages = ['/funnel/a/', '/funnel/b/'];
    const variants = ['A', 'B'];
    
    for (const page of pages) {
      for (const variant of variants) {
        await processEngagementForPageVariant(env, date, page, variant);
      }
    }
  } catch (error) {
    console.error(`Error processing engagement events for ${date}:`, error);
  }
}

async function processEngagementForPageVariant(env, date, page, variant) {
  try {
    // Get raw events from Durable Object or KV
    const events = await getEngagementEvents(env, date, page, variant);
    
    if (events.length === 0) {
      console.log(`No engagement events found for ${date} ${page} ${variant}`);
      return;
    }
    
    // Process events into analytics
    const analytics = processEventsIntoAnalytics(events);
    
    // Store aggregated analytics
    const analyticsKey = `funnel:engage:${date}:${page}:${variant}`;
    await env.FUNNEL_DATA.put(
      analyticsKey,
      JSON.stringify(analytics),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
    );
    
    // Store heatmap data
    const heatmapKey = `funnel:heat:${date}:${page}:${variant}`;
    await env.FUNNEL_DATA.put(
      heatmapKey,
      JSON.stringify(analytics.heatmap),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
    );
    
    console.log(`Processed ${events.length} events for ${date} ${page} ${variant}`);
    
  } catch (error) {
    console.error(`Error processing engagement for ${date} ${page} ${variant}:`, error);
  }
}

async function getEngagementEvents(env, date, page, variant) {
  try {
    // Try to get events from Durable Object first
    const durableObjectId = env?.ENGAGE_STORE?.idFromName(`${date}:${page}:${variant}`);
    if (durableObjectId) {
      const durableObject = env?.ENGAGE_STORE?.get(durableObjectId);
      const response = await durableObject.fetch(`http://internal/get?date=${date}&page=${page}&variant=${variant}`);
      const data = await response.json();
      return data.events || [];
    }
    
    // Fallback to KV storage
    const kvKey = `engage:raw:${date}:${page}:${variant}`;
    const rawData = await env?.FUNNEL_DATA?.get(kvKey);
    
    if (rawData) {
      return rawData.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting engagement events:', error);
    return [];
  }
}

function processEventsIntoAnalytics(events) {
  const analytics = {
    visitors: new Set(),
    sessions: new Set(),
    section_reach: {},
    section_time_ms_avg: {},
    form: {
      starts: 0,
      completes: 0,
      abandons: 0,
      field_drop: {},
      avg_completion_ms: 0
    },
    rage: {},
    clicks: {},
    heatmap: [],
    scroll_milestones: { 25: 0, 50: 0, 75: 0, 100: 0 }
  };
  
  let formStartTimes = new Map();
  let formCompletionTimes = [];
  
  events.forEach(event => {
    // Track unique visitors and sessions
    analytics.visitors.add(event.sessionId);
    analytics.sessions.add(event.sessionId);
    
    switch (event.type) {
      case 'section':
        processSectionEvent(event, analytics);
        break;
      case 'form':
        processFormEvent(event, analytics, formStartTimes, formCompletionTimes);
        break;
      case 'click':
        processClickEvent(event, analytics);
        break;
      case 'rage':
        processRageEvent(event, analytics);
        break;
      case 'scroll':
        processScrollEvent(event, analytics);
        break;
    }
  });
  
  // Convert sets to counts
  analytics.visitors = analytics.visitors.size;
  analytics.sessions = analytics.sessions.size;
  
  // Calculate form completion average
  if (formCompletionTimes.length > 0) {
    analytics.form.avg_completion_ms = formCompletionTimes.reduce((a, b) => a + b, 0) / formCompletionTimes.length;
  }
  
  // Calculate section reach percentages
  Object.keys(analytics.section_reach).forEach(section => {
    analytics.section_reach[section] = (analytics.section_reach[section] / analytics.visitors) * 100;
  });
  
  return analytics;
}

function processSectionEvent(event, analytics) {
  const { section, action, timeInView } = event.data;
  
  if (action === 'enter') {
    analytics.section_reach[section] = (analytics.section_reach[section] || 0) + 1;
  }
  
  if (action === 'exit' && timeInView) {
    if (!analytics.section_time_ms_avg[section]) {
      analytics.section_time_ms_avg[section] = { total: 0, count: 0 };
    }
    analytics.section_time_ms_avg[section].total += timeInView;
    analytics.section_time_ms_avg[section].count += 1;
  }
}

function processFormEvent(event, analytics, formStartTimes, formCompletionTimes) {
  const { action, field, completionTime } = event.data;
  
  switch (action) {
    case 'focus':
      analytics.form.starts++;
      formStartTimes.set(event.sessionId, Date.now());
      break;
    case 'blur':
      if (field) {
        analytics.form.field_drop[field] = (analytics.form.field_drop[field] || 0) + 1;
      }
      break;
    case 'submit':
      analytics.form.completes++;
      if (completionTime) {
        formCompletionTimes.push(completionTime);
      }
      break;
    case 'abandon':
      analytics.form.abandons++;
      break;
  }
}

function processClickEvent(event, analytics) {
  const { element, x_norm, y_norm } = event.data;
  
  analytics.clicks[element] = (analytics.clicks[element] || 0) + 1;
  analytics.heatmap.push({ x: x_norm, y: y_norm, value: 1 });
}

function processRageEvent(event, analytics) {
  const { element } = event.data;
  analytics.rage[element] = (analytics.rage[element] || 0) + 1;
}

function processScrollEvent(event, analytics) {
  const { depth } = event.data;
  if (analytics.scroll_milestones[depth] !== undefined) {
    analytics.scroll_milestones[depth]++;
  }
}

async function processFunnelDataWithEngagement(ga4Data, clarityData, env) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get engagement analytics for both variants
  const [engageA, engageB] = await Promise.all([
    getEngagementAnalytics(env, today, '/funnel/a/', 'A'),
    getEngagementAnalytics(env, today, '/funnel/b/', 'B')
  ]);
  
  // Calculate conversion rates
  const variantA = {
    ...ga4Data.variants.A,
    conversionRate: ga4Data.variants.A.visitors > 0 ? 
      (ga4Data.variants.A.conversions / ga4Data.variants.A.visitors) : 0,
    revenue: ga4Data.variants.A.conversions * 200,
    engagement: engageA
  };
  
  const variantB = {
    ...ga4Data.variants.B,
    conversionRate: ga4Data.variants.B.visitors > 0 ? 
      (ga4Data.variants.B.conversions / ga4Data.variants.B.visitors) : 0,
    revenue: ga4Data.variants.B.conversions * 200,
    engagement: engageB
  };
  
  // Calculate total metrics
  const totalVisitors = variantA.visitors + variantB.visitors;
  const totalConversions = variantA.conversions + variantB.conversions;
  const totalRevenue = variantA.revenue + variantB.revenue;
  
  // Calculate statistical significance
  const confidence = calculateConfidence(variantA, variantB);
  
  // Determine winner
  const winner = variantB.conversionRate > variantA.conversionRate ? 'B' : 'A';
  const improvement = winner === 'B' ? 
    ((variantB.conversionRate - variantA.conversionRate) / variantA.conversionRate * 100) :
    ((variantA.conversionRate - variantB.conversionRate) / variantB.conversionRate * 100);
  
  return {
    date: today,
    summary: {
      totalVisitors,
      totalConversions,
      totalRevenue,
      overallConversionRate: totalVisitors > 0 ? (totalConversions / totalVisitors) : 0,
      testDuration: 7,
      confidenceLevel: confidence,
      winner,
      improvement: `+${improvement.toFixed(1)}%`
    },
    variants: {
      A: variantA,
      B: variantB
    },
    engagement: clarityData.engagement,
    heatmap: clarityData.heatmap,
    lastUpdated: new Date().toISOString()
  };
}

async function getEngagementAnalytics(env, date, page, variant) {
  try {
    const analyticsKey = `funnel:engage:${date}:${page}:${variant}`;
    const analytics = await env?.FUNNEL_DATA?.get(analyticsKey);
    return analytics ? JSON.parse(analytics) : getDefaultEngagementData();
  } catch (error) {
    console.error(`Error getting engagement analytics for ${date} ${page} ${variant}:`, error);
    return getDefaultEngagementData();
  }
}

function getDefaultEngagementData() {
  return {
    visitors: 0,
    sessions: 0,
    section_reach: {},
    section_time_ms_avg: {},
    form: { starts: 0, completes: 0, abandons: 0, field_drop: {}, avg_completion_ms: 0 },
    rage: {},
    clicks: {},
    heatmap: [],
    scroll_milestones: { 25: 0, 50: 0, 75: 0, 100: 0 }
  };
}

async function generateEnhancedAIRecommendations(data, env) {
  const CLAUDE_API_KEY = env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    console.log('Claude API key not configured, skipping AI recommendations');
    return;
  }
  
  try {
    const prompt = `Analyze this A/B test data for an AI Visibility Plan funnel and provide three clear, actionable CRO recommendations. Focus on copy, layout, CTA clarity, and conversion psychology. Avoid code suggestions.

Data:
- Variant A: ${data.variants.A.visitors} visitors, ${data.variants.A.conversions} conversions (${(data.variants.A.conversionRate * 100).toFixed(1)}% CR)
- Variant B: ${data.variants.B.visitors} visitors, ${data.variants.B.conversions} conversions (${(data.variants.B.conversionRate * 100).toFixed(1)}% CR)
- Winner: Variant ${data.summary.winner} (${data.summary.improvement} improvement)
- Confidence: ${data.summary.confidenceLevel.toFixed(1)}%
- Engagement: ${data.engagement?.averageSessionDuration || 0}s avg session, ${((data.engagement?.bounceRate || 0) * 100).toFixed(1)}% bounce rate

Enhanced Engagement Data:
- Variant A Section Reach: ${JSON.stringify(data.variants.A.engagement?.section_reach || {})}
- Variant B Section Reach: ${JSON.stringify(data.variants.B.engagement?.section_reach || {})}
- Variant A Rage Clicks: ${JSON.stringify(data.variants.A.engagement?.rage || {})}
- Variant B Rage Clicks: ${JSON.stringify(data.variants.B.engagement?.rage || {})}
- Variant A Form Abandonment: ${data.variants.A.engagement?.form?.abandons || 0}
- Variant B Form Abandonment: ${data.variants.B.engagement?.form?.abandons || 0}
- Variant A Scroll Milestones: ${JSON.stringify(data.variants.A.engagement?.scroll_milestones || {})}
- Variant B Scroll Milestones: ${JSON.stringify(data.variants.B.engagement?.scroll_milestones || {})}

Respond with JSON format:
{
  "recommendations": [
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps", "affected_atoms": ["headline", "cta", "form_position"]},
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps", "affected_atoms": ["headline", "cta", "form_position"]},
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps", "affected_atoms": ["headline", "cta", "form_position"]}
  ]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const result = await response.json();
    const aiAdvice = {
      timestamp: new Date().toISOString(),
      data: result.content[0].text,
      processed: true
    };

    // Store AI recommendations
    await env.FUNNEL_DATA.put(
      `funnel:ai_advice:${Date.now()}`,
      JSON.stringify(aiAdvice),
      { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
    );

    // Store latest advice
    await env.FUNNEL_DATA.put(
      'funnel:ai_advice:latest',
      JSON.stringify(aiAdvice),
      { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
    );

    console.log('Enhanced AI recommendations generated successfully');

  } catch (error) {
    console.error('Failed to generate enhanced AI recommendations:', error);
  }
}
