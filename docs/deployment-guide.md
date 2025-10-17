# Digital Visibility A/B Funnel - Deployment Guide

## Overview
This guide covers deploying the complete A/B funnel with AI advisory integration to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account** with Pages and Workers enabled
2. **GitHub Repository** connected to Cloudflare Pages
3. **Required API Keys**:
   - Google Analytics 4 Measurement ID: `G-T7HFBLX1X1`
   - Microsoft Clarity Project ID: `trt5xn1qai`
   - Claude API Key (Anthropic)
   - Admin credentials (username/password)

## Step 1: Configure Cloudflare KV Store

1. Go to **Workers & Pages** → **KV**
2. Create a new KV namespace called `FUNNEL_DATA`
3. Copy the namespace ID
4. Update `wrangler.toml` with your namespace ID:
```toml
[[kv_namespaces]]
binding = "FUNNEL_DATA"
id = "your-actual-namespace-id"
```

## Step 2: Set Environment Variables

In Cloudflare Pages dashboard:

1. Go to **Pages** → **Your Project** → **Settings** → **Environment Variables**
2. Add the following variables:

```
GA4_ID = G-T7HFBLX1X1
CLARITY_ID = trt5xn1qai
CLAUDE_API_KEY = your-claude-api-key
ADMIN_USER = your-admin-username
ADMIN_PASS = your-secure-password
```

## Step 3: Configure Cron Triggers

1. Go to **Workers & Pages** → **Triggers**
2. Add a new Cron Trigger:
   - **Cron Expression**: `0 */12 * * *` (every 12 hours)
   - **Worker**: Select your Pages project
   - **Event Type**: `scheduled`

## Step 4: Deploy to Cloudflare Pages

1. **Push to GitHub**:
```bash
git add .
git commit -m "Deploy A/B funnel with AI advisory integration"
git push origin main
```

2. **Cloudflare Pages will automatically**:
   - Build the Astro project
   - Deploy all functions (`/functions/`)
   - Deploy all API routes (`/api/`)
   - Set up KV bindings
   - Configure cron triggers

## Step 5: Verify Deployment

### Test the Funnel
1. Visit `https://your-domain.com/funnel/`
2. Should redirect to either `/funnel/a/` or `/funnel/b/`
3. Test form submission
4. Verify email notifications

### Test Admin Dashboard
1. Visit `https://your-domain.com/admin/funnel-dashboard/`
2. Enter admin credentials when prompted
3. Verify data loads and AI recommendations appear
4. Test "Generate New AI Advice" button

### Test Data Aggregation
1. Wait 12 hours for first cron run
2. Check KV store for data:
   - `funnel:live`
   - `funnel:daily:YYYY-MM-DD`
   - `funnel:ai_advice:latest`

## Step 6: Monitor and Optimize

### Dashboard Features
- **Real-time metrics** from GA4 and Clarity
- **AI recommendations** from Claude
- **Statistical significance** calculations
- **Export functionality** for data analysis

### AI Advisory System
- **Claude 3.5 Sonnet** provides CRO recommendations
- **Priority levels**: High, Medium, Low
- **Actionable insights** for copy, layout, CTA optimization
- **No automatic changes** - advice only

## Troubleshooting

### Common Issues

1. **KV Store Not Found**
   - Verify namespace ID in `wrangler.toml`
   - Check KV binding in Cloudflare dashboard

2. **Cron Not Running**
   - Verify cron trigger is configured
   - Check worker logs for errors

3. **AI Recommendations Not Generating**
   - Verify Claude API key is correct
   - Check API rate limits
   - Review worker logs

4. **Authentication Issues**
   - Verify admin credentials
   - Check environment variables

### Logs and Monitoring

1. **Cloudflare Dashboard** → **Workers & Pages** → **Your Project** → **Logs**
2. **Real-time logs** for debugging
3. **Error tracking** and performance metrics

## Security Considerations

- **Basic Auth** protects all admin routes
- **No PII** stored in KV or sent to AI
- **Data aggregation** only - no raw user data
- **HTTPS only** for all endpoints
- **X-Robots-Tag: noindex** for admin pages

## Future Enhancements

- **ChatGPT integration** for additional AI insights
- **Automated optimization** based on AI recommendations
- **Advanced statistical analysis** with Bayesian methods
- **Real-time notifications** for significant changes
- **Multi-variant testing** beyond A/B

## Support

For issues or questions:
1. Check Cloudflare Pages logs
2. Review KV store data
3. Verify environment variables
4. Test API endpoints individually

## Success Confirmation

Once deployed, you should see:
- ✅ Funnel routing working (`/funnel/` → A or B)
- ✅ Form submissions creating leads
- ✅ Admin dashboard showing live data
- ✅ AI recommendations being generated
- ✅ Cron job aggregating data every 12 hours
- ✅ All analytics tracking properly

**All backend components will be live once you deploy this branch to Cloudflare — no further manual setup required beyond entering environment variables.**
