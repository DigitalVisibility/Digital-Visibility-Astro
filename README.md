# Digital Visibility A/B Marketing Funnel

A high-performance A/B testing funnel for Digital Visibility's AI Visibility Plan with real-time analytics, AI-powered recommendations, and automated optimization.

## 🚀 Features

### A/B Testing
- **50/50 traffic splitting** with cookie persistence
- **Dynamic traffic allocation** based on AI recommendations
- **Variant-specific landing pages** with different headlines and CTAs
- **Conversion tracking** with statistical significance testing

### Analytics Integration
- **Google Analytics 4** (`G-T7HFBLX1X1`) - Page views, conversions, revenue
- **Microsoft Clarity** (`trt5xn1qai`) - User behavior, heatmaps, engagement
- **Real-time data aggregation** every 12 hours
- **Historical data storage** for trend analysis

### AI Advisory System
- **Claude 3.5 Sonnet** integration for CRO recommendations
- **Priority-based suggestions** (High, Medium, Low)
- **Actionable insights** for copy, layout, and CTA optimization
- **Read-only mode** - no automatic changes

### Admin Dashboard
- **Live metrics** and performance data
- **AI recommendations** with rationale
- **Statistical analysis** and confidence levels
- **Data export** functionality
- **Secure authentication** with Basic Auth

## 📁 Project Structure

```
├── functions/
│   ├── funnel.js                    # A/B routing function
│   └── cron-funnel-aggregate.js     # Data aggregation worker
├── src/
│   ├── pages/
│   │   ├── funnel/
│   │   │   ├── a/index.astro        # Variant A landing page
│   │   │   ├── b/index.astro        # Variant B landing page
│   │   │   ├── a/thank-you.astro    # Variant A thank you
│   │   │   └── b/thank-you.astro    # Variant B thank you
│   │   ├── admin/
│   │   │   └── funnel-dashboard.astro # Admin dashboard
│   │   └── api/
│   │       ├── funnel-lead.ts       # Lead submission handler
│   │       ├── funnel-metrics.ts    # Metrics API
│   │       └── ai-advice.ts         # AI recommendations API
│   ├── components/
│   │   ├── Navigation.astro
│   │   ├── AdminNavigation.astro
│   │   └── Footer.astro
│   └── middleware.ts                # Auth middleware
├── docs/
│   ├── deployment-guide.md
│   └── kv-schema.md
├── wrangler.toml                    # Cloudflare configuration
└── README.md
```

## 🛠️ Technology Stack

- **Framework**: Astro 3.6.4
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages
- **Database**: Cloudflare KV Store
- **Analytics**: Google Analytics 4, Microsoft Clarity
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **Email**: Resend API

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.1+
- Cloudflare account
- API keys for GA4, Clarity, and Claude

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test funnel
open http://localhost:4321/funnel/

# Test admin dashboard
open http://localhost:4321/admin/funnel-dashboard/
```

### Production Deployment
1. **Configure Cloudflare KV Store**
2. **Set environment variables** in Cloudflare Pages
3. **Deploy to Cloudflare Pages** via GitHub
4. **Verify all components** are working

See [deployment guide](docs/deployment-guide.md) for detailed instructions.

## 📊 Analytics & AI

### Data Flow
1. **Visitors** hit `/funnel/` → routed to A or B
2. **Analytics** track page views, conversions, behavior
3. **Cron worker** aggregates data every 12 hours
4. **Claude AI** generates recommendations
5. **Dashboard** displays insights and suggestions

### AI Recommendations
The system provides actionable CRO advice:
- **High Priority**: Critical optimizations (e.g., "Variant B's CTA is clearer—apply to A")
- **Medium Priority**: Important improvements (e.g., "Reduce hero text length")
- **Low Priority**: Nice-to-have suggestions (e.g., "Test trust badges near CTA")

## 🔒 Security

- **Basic Auth** protects admin routes
- **No PII** stored in KV or sent to AI
- **Data aggregation** only - no raw user data
- **HTTPS only** for all endpoints
- **X-Robots-Tag: noindex** for admin pages

## 📈 Performance

- **Core Web Vitals** optimized (CLS < 0.1, LCP < 1.8s, TBT < 200ms)
- **Mobile-first** responsive design
- **Lazy loading** for images
- **Critical CSS** inlined
- **System fonts** for performance

## 🔧 Configuration

### Environment Variables
```bash
GA4_ID=G-T7HFBLX1X1
CLARITY_ID=trt5xn1qai
CLAUDE_API_KEY=your-claude-api-key
ADMIN_USER=your-admin-username
ADMIN_PASS=your-secure-password
```

### KV Store Schema
See [KV schema documentation](docs/kv-schema.md) for data structure details.

## 🚀 Future Enhancements

- **ChatGPT integration** for additional AI insights
- **Automated optimization** based on AI recommendations
- **Multi-variant testing** beyond A/B
- **Real-time notifications** for significant changes
- **Advanced statistical analysis** with Bayesian methods

## 📞 Support

For issues or questions:
1. Check Cloudflare Pages logs
2. Review KV store data
3. Verify environment variables
4. Test API endpoints individually

## 📄 License

Private project for Digital Visibility Ltd.

---

**All backend components will be live once you deploy this branch to Cloudflare — no further manual setup required beyond entering environment variables.**
