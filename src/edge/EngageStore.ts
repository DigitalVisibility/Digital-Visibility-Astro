// Durable Object for storing engagement events
// Provides real-time event storage and retrieval for heatmap generation

interface EngageEvent {
  type: 'section' | 'click' | 'form' | 'rage' | 'scroll';
  timestamp: number;
  variant: string;
  page: string;
  sessionId: string;
  data: any;
}

interface StoredEvent extends EngageEvent {
  id: string;
}

export class EngageStore {
  private state: DurableObjectState;
  private events: StoredEvent[] = [];

  constructor(state: DurableObjectState) {
    this.state = state;
    this.initializeState();
  }

  private async initializeState(): Promise<void> {
    // Load existing events from storage
    const stored = await this.state.storage.get<StoredEvent[]>('events');
    if (stored) {
      this.events = stored;
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/append':
          return await this.appendEvents(request);
        case '/flush':
          return await this.flush();
        case '/get':
          return await this.getEvents(request);
        case '/stats':
          return await this.getStats();
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('EngageStore error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  private async appendEvents(request: Request): Promise<Response> {
    const events: EngageEvent[] = await request.json();
    
    if (!Array.isArray(events)) {
      return new Response('Invalid events array', { status: 400 });
    }

    // Add unique IDs and store events
    const now = Date.now();
    const newEvents: StoredEvent[] = events.map(event => ({
      ...event,
      id: `${now}-${Math.random().toString(36).substr(2, 9)}`
    }));

    this.events.push(...newEvents);

    // Persist to storage
    await this.state.storage.put('events', this.events);

    // Clean up old events (keep last 24 hours)
    const cutoff = now - (24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > cutoff);
    
    if (this.events.length !== newEvents.length) {
      await this.state.storage.put('events', this.events);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      stored: newEvents.length,
      total: this.events.length 
    }));
  }

  private async flush(): Promise<Response> {
    // Return all events and clear storage
    const events = [...this.events];
    this.events = [];
    await this.state.storage.delete('events');
    
    return new Response(JSON.stringify({ 
      success: true, 
      flushed: events.length,
      events 
    }));
  }

  private async getEvents(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const page = url.searchParams.get('page');
    const variant = url.searchParams.get('variant');
    const type = url.searchParams.get('type');

    let filteredEvents = this.events;

    // Filter by date
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= startOfDay.getTime() && event.timestamp < endOfDay.getTime()
      );
    }

    // Filter by page
    if (page) {
      filteredEvents = filteredEvents.filter(event => event.page === page);
    }

    // Filter by variant
    if (variant) {
      filteredEvents = filteredEvents.filter(event => event.variant === variant);
    }

    // Filter by type
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      events: filteredEvents,
      count: filteredEvents.length 
    }));
  }

  private async getStats(): Promise<Response> {
    const stats = {
      totalEvents: this.events.length,
      eventsByType: this.getEventsByType(),
      eventsByVariant: this.getEventsByVariant(),
      eventsByPage: this.getEventsByPage(),
      recentActivity: this.getRecentActivity()
    };

    return new Response(JSON.stringify({ success: true, stats }));
  }

  private getEventsByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.events.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1;
    });
    return counts;
  }

  private getEventsByVariant(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.events.forEach(event => {
      counts[event.variant] = (counts[event.variant] || 0) + 1;
    });
    return counts;
  }

  private getEventsByPage(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.events.forEach(event => {
      counts[event.page] = (counts[event.page] || 0) + 1;
    });
    return counts;
  }

  private getRecentActivity(): Array<{ type: string; count: number; time: string }> {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const recentEvents = this.events.filter(event => event.timestamp > lastHour);
    
    const hourlyCounts: Record<string, number> = {};
    recentEvents.forEach(event => {
      const hour = new Date(event.timestamp).toISOString().substring(0, 13) + ':00:00Z';
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    return Object.entries(hourlyCounts)
      .map(([time, count]) => ({ type: 'events', count, time }))
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 24); // Last 24 hours
  }
}
