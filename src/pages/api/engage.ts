import type { APIRoute } from 'astro';

export const prerender = false;

interface EngageEvent {
  type: 'section' | 'click' | 'form' | 'rage' | 'scroll';
  timestamp: number;
  variant: string;
  page: string;
  sessionId: string;
  data: any;
}

export const POST: APIRoute = async ({ request, platform }) => {
  try {
    const events: EngageEvent[] = await request.json();
    
    if (!Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid events array' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate events
    for (const event of events) {
      if (!event.type || !event.timestamp || !event.variant || !event.sessionId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid event format' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Get client IP for throttling
    const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
    
    // Throttle by IP (max 100 events per minute)
    const throttleKey = `engage:throttle:${clientIP}`;
    const throttleData = await platform?.env?.FUNNEL_DATA?.get(throttleKey);
    
    if (throttleData) {
      const { count, resetTime } = JSON.parse(throttleData);
      if (Date.now() < resetTime && count > 100) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Update throttle counter
    const now = Date.now();
    const resetTime = now + 60000; // 1 minute
    const newCount = throttleData ? JSON.parse(throttleData).count + events.length : events.length;
    
    await platform?.env?.FUNNEL_DATA?.put(
      throttleKey,
      JSON.stringify({ count: newCount, resetTime }),
      { expirationTtl: 60 }
    );

    // Store events in Durable Object if available, otherwise KV
    const success = await storeEvents(platform?.env, events);
    
    if (!success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store events' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, stored: events.length }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Engagement tracking error:', error);
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

async function storeEvents(env: any, events: EngageEvent[]): Promise<boolean> {
  try {
    // Group events by date, page, variant for efficient storage
    const groupedEvents = new Map<string, EngageEvent[]>();
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      const key = `${date}:${event.page}:${event.variant}`;
      
      if (!groupedEvents.has(key)) {
        groupedEvents.set(key, []);
      }
      groupedEvents.get(key)!.push(event);
    });

    // Store each group
    const promises: Promise<any>[] = [];
    
    for (const [key, eventGroup] of groupedEvents) {
      // Try Durable Object first
      const durableObjectId = env?.ENGAGE_STORE?.idFromName(key);
      if (durableObjectId) {
        const durableObject = env?.ENGAGE_STORE?.get(durableObjectId);
        promises.push(
          durableObject.fetch('http://internal/append', {
            method: 'POST',
            body: JSON.stringify(eventGroup)
          }).catch(() => {
            // Fallback to KV if DO fails
            return storeEventsInKV(env, key, eventGroup);
          })
        );
      } else {
        // Fallback to KV storage
        promises.push(storeEventsInKV(env, key, eventGroup));
      }
    }

    await Promise.all(promises);
    return true;
    
  } catch (error) {
    console.error('Error storing engagement events:', error);
    return false;
  }
}

async function storeEventsInKV(env: any, key: string, events: EngageEvent[]): Promise<void> {
  try {
    const kvKey = `engage:raw:${key}`;
    const existingData = await env?.FUNNEL_DATA?.get(kvKey);
    
    let eventList = existingData ? existingData.split('\n').filter(line => line.trim()) : [];
    
    // Append new events as JSON lines
    const newEvents = events.map(event => JSON.stringify(event));
    eventList.push(...newEvents);
    
    // Store with 7-day TTL
    await env?.FUNNEL_DATA?.put(
      kvKey,
      eventList.join('\n'),
      { expirationTtl: 60 * 60 * 24 * 7 }
    );
    
  } catch (error) {
    console.error('Error storing events in KV:', error);
    throw error;
  }
}
