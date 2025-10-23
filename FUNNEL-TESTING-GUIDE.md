# A/B Funnel Testing Guide

## Overview
This guide covers testing the complete A/B funnel flow from visitor tracking to dashboard metrics.

## Prerequisites
- Ensure environment variables are set in `.env`:
  ```
  ADMIN_USER=admin
  ADMIN_PASS=changeme123
  RESEND_API_KEY=your_api_key (optional for email)
  ```

## Test Flow

### 1. A/B Split Routing Test
- **Clear cookies** in your browser
- Visit `/funnel` or `/funnel/`
- **Expected**: Redirect to either `/funnel/a/` or `/funnel/b/`
- Check browser DevTools > Application > Cookies for `funnel_variant` cookie
- Refresh page multiple times - should stay on same variant
- Use incognito/private windows to test 50/50 split distribution

### 2. Cookie Consent Test
- On funnel page, look for cookie consent banner at bottom-left
- **Test Accept Flow**:
  - Click "Accept All"
  - Page should reload automatically
  - Check DevTools > Console for:
    - `[GTAG] Cookie consent granted, sending pageview`
    - `[CLARITY] Script loaded successfully`
- **Test Reject Flow**:
  - Click "Reject"
  - Page should reload
  - Analytics scripts should NOT load
- **Test Settings Flow**:
  - Click "Settings"
  - Toggle analytics on/off
  - Save preferences
  - Page should reload with appropriate scripts

### 3. Pageview Tracking Test
- Check browser console for:
  ```
  [PAGEVIEW] Sending tracking request...
  [PAGEVIEW] ✅ Successfully tracked: {success: true, isNewSession: true, totalVisitors: 1}
  ```
- In local development, look for:
  ```
  [PAGEVIEW] 🔧 LOCAL MODE - KV not available, using fallback response
  ```

### 4. Form Submission Test
- Fill out the form on the funnel page:
  - Name: Test User
  - Email: test@example.com
  - Website: https://example.com
- Submit form
- **Expected**:
  - Redirect to `/funnel/a/thank-you/` or `/funnel/b/thank-you/`
  - Console shows: `[LEAD] ✅ Lead stored successfully`
  - Email sent (if RESEND_API_KEY configured)

### 5. Dashboard Data Test
- Visit `/admin/funnel-dashboard`
- Login with admin credentials
- **Expected in Production**:
  - Real visitor counts
  - Real conversion data
  - Conversion rates calculated correctly
- **Expected in Local Development**:
  - Demo data displayed
  - Warning about local mode in recent activity

### 6. Dashboard Actions Test
- **Process Engagement Data Now**:
  - Click button
  - Should show processing state
  - Dashboard refreshes with latest data
- **Reset Controls**:
  - Test each reset option carefully
  - Verify data is cleared as expected

## Console Log Monitoring

### Key Logs to Watch For:

#### Successful Flow:
```
[PAGEVIEW] ====== START PAGEVIEW REQUEST ======
[PAGEVIEW] Request data: {variant: "a", page: "/funnel/a/", sessionId: "..."}
[PAGEVIEW] ✅ SUCCESS - Total unique visitors: 1
[PAGEVIEW] ====== END PAGEVIEW REQUEST ======

[LEAD] ====== START LEAD SUBMISSION ======
[LEAD] Lead data: {name: "...", email: "...", website: "...", variant: "a"}
[LEAD] ✅ Lead stored successfully
[LEAD] ====== END LEAD SUBMISSION ======

[METRICS] ====== START METRICS REQUEST ======
[METRICS] Data summary:
[METRICS] - Variant A: 1 visitors, 1 conversions
[METRICS] - Variant B: 0 visitors, 0 conversions
[METRICS] ====== END METRICS REQUEST ======
```

#### Local Development (No KV):
```
[PAGEVIEW] ⚠️ KV Storage not available - running in local environment?
[LEAD] ⚠️ FUNNEL_DATA not available - running in local environment?
[AGGREGATE] ⚠️ KV not available, returning demo data for local development
```

## Troubleshooting

### Issue: 404 on /funnel
- **Cause**: The /funnel/index.astro file exists
- **Fix**: Already deleted in implementation

### Issue: No data in dashboard
- **Check**: Console logs for KV availability
- **Local**: Demo data should display
- **Production**: Check Cloudflare KV bindings

### Issue: Analytics not tracking
- **Check**: Cookie consent accepted?
- **Verify**: Page reloaded after consent?
- **Console**: Look for GTAG/Clarity loading messages

### Issue: Form submission fails
- **Check**: All fields filled correctly?
- **Email**: RESEND_API_KEY configured?
- **Console**: Check for error messages

## Production Deployment Checklist

1. **Environment Variables**:
   - [ ] ADMIN_USER and ADMIN_PASS set
   - [ ] RESEND_API_KEY configured
   - [ ] Cloudflare KV namespace bound as FUNNEL_DATA

2. **Cloudflare Configuration**:
   - [ ] KV namespace created
   - [ ] Binding added to wrangler.toml:
     ```toml
     [[kv_namespaces]]
     binding = "FUNNEL_DATA"
     id = "your-kv-namespace-id"
     ```

3. **Analytics Setup**:
   - [ ] Google Analytics property exists (G-T7HFBLX1X1)
   - [ ] Microsoft Clarity project exists (trt5xn1qai)

4. **Testing**:
   - [ ] Test complete flow in production
   - [ ] Verify data persists in KV
   - [ ] Check email delivery
   - [ ] Confirm dashboard shows real data

## Monitoring

- Check Cloudflare dashboard for KV operations
- Monitor browser console for errors
- Use Network tab to verify API calls succeed
- Check email logs in Resend dashboard

## Performance Tips

- Dashboard caches data for 5 minutes
- Use "Process Engagement Data Now" for immediate updates
- Pageview tracking uses session-based deduplication
- Engagement events batch every 3 seconds
