// Enhanced engagement tracking for A/B funnel optimization
// Captures section visibility, clicks, form interactions, and rage clicks

interface EngageConfig {
  variant: 'A' | 'B';
  page: string;
  sections: string[];
}

interface EngageEvent {
  type: 'section' | 'click' | 'form' | 'rage' | 'scroll';
  timestamp: number;
  variant: string;
  page: string;
  sessionId: string;
  data: any;
}

interface SectionEvent {
  section: string;
  action: 'enter' | 'exit' | 'milestone';
  milestone?: number; // 25, 50, 75, 100
  timeInView?: number;
  scrollDepth?: number;
}

interface ClickEvent {
  element: string;
  x: number;
  y: number;
  x_norm: number;
  y_norm: number;
  elementType: string;
  text?: string;
}

interface FormEvent {
  action: 'focus' | 'blur' | 'submit' | 'abandon' | 'error';
  field?: string;
  errorType?: string;
  completionTime?: number;
}

interface RageEvent {
  element: string;
  clickCount: number;
  x: number;
  y: number;
  x_norm: number;
  y_norm: number;
}

class EngageTracker {
  private config: EngageConfig;
  private sessionId: string;
  private eventBuffer: EngageEvent[] = [];
  private sectionTimers: Map<string, { enterTime: number; timeInView: number }> = new Map();
  private clickTimes: number[] = [];
  private rageClickCounts: Map<string, number> = new Map();
  private formStartTime: number = 0;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: EngageConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private init(): void {
    this.setupSectionTracking();
    this.setupClickTracking();
    this.setupFormTracking();
    this.setupScrollTracking();
    this.setupFlushInterval();
    this.setupVisibilityChange();
    
    // Track page load
    this.trackEvent('section', {
      section: 'page',
      action: 'enter',
      milestone: 0
    });
  }

  private setupSectionTracking(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const section = entry.target.getAttribute('data-section');
          if (!section) return;

          if (entry.isIntersecting) {
            this.sectionTimers.set(section, {
              enterTime: Date.now(),
              timeInView: 0
            });
            this.trackEvent('section', {
              section,
              action: 'enter'
            });
          } else {
            const timer = this.sectionTimers.get(section);
            if (timer) {
              const timeInView = Date.now() - timer.enterTime;
              this.trackEvent('section', {
                section,
                action: 'exit',
                timeInView
              });
              this.sectionTimers.delete(section);
            }
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '0px'
      }
    );

    // Observe all sections
    this.config.sections.forEach(sectionName => {
      const elements = document.querySelectorAll(`[data-section="${sectionName}"]`);
      elements.forEach(el => observer.observe(el));
    });
  }

  private setupClickTracking(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const element = target.getAttribute('data-el');
      
      if (element) {
        // Track element clicks
        const rect = target.getBoundingClientRect();
        const x_norm = (rect.left + rect.width / 2) / window.innerWidth;
        const y_norm = (rect.top + rect.height / 2) / window.innerHeight;
        
        this.trackEvent('click', {
          element,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          x_norm,
          y_norm,
          elementType: target.tagName.toLowerCase(),
          text: target.textContent?.trim().substring(0, 50)
        });
      }

      // Track rage clicks (3+ clicks within 600ms on non-interactive elements)
      this.trackRageClick(e);
    });
  }

  private trackRageClick(e: MouseEvent): void {
    const now = Date.now();
    this.clickTimes.push(now);
    this.clickTimes = this.clickTimes.filter(time => now - time < 600);

    if (this.clickTimes.length >= 3) {
      const target = e.target as HTMLElement;
      const isInteractive = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
                           target.getAttribute('data-el') ||
                           target.onclick ||
                           target.style.cursor === 'pointer';

      if (!isInteractive) {
        const element = target.getAttribute('data-section') || target.tagName.toLowerCase();
        const count = this.rageClickCounts.get(element) || 0;
        this.rageClickCounts.set(element, count + 1);

        this.trackEvent('rage', {
          element,
          clickCount: count + 1,
          x: e.clientX,
          y: e.clientY,
          x_norm: e.clientX / window.innerWidth,
          y_norm: e.clientY / window.innerHeight
        });
      }
    }
  }

  private setupFormTracking(): void {
    const form = document.getElementById('funnel-form') as HTMLFormElement;
    if (!form) return;

    // Track form start
    form.addEventListener('focusin', () => {
      if (this.formStartTime === 0) {
        this.formStartTime = Date.now();
        this.trackEvent('form', { action: 'focus' });
      }
    });

    // Track field interactions
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      field.addEventListener('focus', () => {
        this.trackEvent('form', {
          action: 'focus',
          field: field.getAttribute('name') || field.id
        });
      });

      field.addEventListener('blur', () => {
        this.trackEvent('form', {
          action: 'blur',
          field: field.getAttribute('name') || field.id
        });
      });
    });

    // Track form submission
    form.addEventListener('submit', (e) => {
      const completionTime = Date.now() - this.formStartTime;
      this.trackEvent('form', {
        action: 'submit',
        completionTime
      });
    });

    // Track form abandonment (user leaves page)
    window.addEventListener('beforeunload', () => {
      if (this.formStartTime > 0) {
        const formData = new FormData(form);
        const hasData = Array.from(formData.values()).some(value => value.toString().trim());
        
        if (hasData) {
          this.trackEvent('form', {
            action: 'abandon',
            completionTime: Date.now() - this.formStartTime
          });
        }
      }
    });
  }

  private setupScrollTracking(): void {
    let lastScrollDepth = 0;
    
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      // Track milestone scroll depths
      if (scrollDepth >= 25 && lastScrollDepth < 25) {
        this.trackEvent('scroll', { depth: 25 });
      } else if (scrollDepth >= 50 && lastScrollDepth < 50) {
        this.trackEvent('scroll', { depth: 50 });
      } else if (scrollDepth >= 75 && lastScrollDepth < 75) {
        this.trackEvent('scroll', { depth: 75 });
      } else if (scrollDepth >= 100 && lastScrollDepth < 100) {
        this.trackEvent('scroll', { depth: 100 });
      }
      
      lastScrollDepth = scrollDepth;
    });
  }

  private setupFlushInterval(): void {
    // Flush events every 3 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 3000);
  }

  private setupVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushEvents();
      }
    });
  }

  private trackEvent(type: EngageEvent['type'], data: any): void {
    const event: EngageEvent = {
      type,
      timestamp: Date.now(),
      variant: this.config.variant,
      page: this.config.page,
      sessionId: this.sessionId,
      data
    };

    this.eventBuffer.push(event);

    // Flush immediately for critical events
    if (['form', 'rage'].includes(type)) {
      this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Use sendBeacon for better reliability
      const success = navigator.sendBeacon('/api/engage', JSON.stringify(events));
      
      if (!success) {
        // Fallback to fetch
        await fetch('/api/engage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(events),
          keepalive: true
        });
      }
    } catch (error) {
      console.error('Failed to send engagement events:', error);
    }
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents();
  }
}

export default function initEngage(config: EngageConfig): EngageTracker {
  return new EngageTracker(config);
}
