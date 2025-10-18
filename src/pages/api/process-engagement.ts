import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, platform }) => {
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

    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Import and run the engagement processing logic from cron
    const result = await processEngagementData(platform?.env);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Engagement data processed successfully',
        ...result
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Process engagement API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

async function processEngagementData(env: any) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const dates = [today, yesterday];
  const pages = ['/funnel/a/', '/funnel/b/'];
  const variants = ['A', 'B'];

  let totalProcessed = 0;
  const processedItems: string[] = [];

  for (const date of dates) {
    for (const page of pages) {
      for (const variant of variants) {
        const count = await processEngagementForPageVariant(env, date, page, variant);
        if (count > 0) {
          totalProcessed += count;
          processedItems.push(`${date} ${page} ${variant}: ${count} events`);
        }
      }
    }
  }

  return {
    totalEvents: totalProcessed,
    processed: processedItems,
    dates: dates
  };
}

async function processEngagementForPageVariant(env: any, date: string, page: string, variant: string): Promise<number> {
  try {
    // Get raw events from Durable Object or KV
    const events = await getEngagementEvents(env, date, page, variant);

    if (events.length === 0) {
      return 0;
    }

    // Process events into analytics
    const analytics = processEventsIntoAnalytics(events);

    // Store aggregated analytics
    const analyticsKey = `funnel:engage:${date}:${page}:${variant}`;
    await env?.FUNNEL_DATA?.put(
      analyticsKey,
      JSON.stringify(analytics),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
    );

    // Store heatmap data
    const heatmapKey = `funnel:heat:${date}:${page}:${variant}`;
    await env?.FUNNEL_DATA?.put(
      heatmapKey,
      JSON.stringify(analytics.heatmap),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
    );

    return events.length;

  } catch (error) {
    console.error(`Error processing engagement for ${date} ${page} ${variant}:`, error);
    return 0;
  }
}

async function getEngagementEvents(env: any, date: string, page: string, variant: string) {
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

function processEventsIntoAnalytics(events: any[]) {
  const analytics = {
    visitors: new Set(),
    sessions: new Set(),
    section_reach: {} as Record<string, number>,
    section_time_ms_avg: {} as Record<string, { total: number; count: number }>,
    form: {
      starts: 0,
      completes: 0,
      abandons: 0,
      field_drop: {} as Record<string, number>,
      avg_completion_ms: 0
    },
    rage: {} as Record<string, number>,
    clicks: {} as Record<string, number>,
    heatmap: [] as Array<{ x: number; y: number; value: number }>,
    scroll_milestones: { 25: 0, 50: 0, 75: 0, 100: 0 }
  };

  let formStartTimes = new Map();
  let formCompletionTimes: number[] = [];

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
  const visitorsCount = analytics.visitors.size;
  const sessionsCount = analytics.sessions.size;

  // Calculate form completion average
  if (formCompletionTimes.length > 0) {
    analytics.form.avg_completion_ms = formCompletionTimes.reduce((a, b) => a + b, 0) / formCompletionTimes.length;
  }

  // Calculate section reach percentages
  Object.keys(analytics.section_reach).forEach(section => {
    analytics.section_reach[section] = (analytics.section_reach[section] / visitorsCount) * 100;
  });

  return {
    ...analytics,
    visitors: visitorsCount,
    sessions: sessionsCount
  };
}

function processSectionEvent(event: any, analytics: any) {
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

function processFormEvent(event: any, analytics: any, formStartTimes: Map<any, any>, formCompletionTimes: number[]) {
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

function processClickEvent(event: any, analytics: any) {
  const { element, x_norm, y_norm } = event.data;

  analytics.clicks[element] = (analytics.clicks[element] || 0) + 1;
  analytics.heatmap.push({ x: x_norm, y: y_norm, value: 1 });
}

function processRageEvent(event: any, analytics: any) {
  const { element } = event.data;
  analytics.rage[element] = (analytics.rage[element] || 0) + 1;
}

function processScrollEvent(event: any, analytics: any) {
  const { depth } = event.data;
  if (analytics.scroll_milestones[depth] !== undefined) {
    analytics.scroll_milestones[depth]++;
  }
}
