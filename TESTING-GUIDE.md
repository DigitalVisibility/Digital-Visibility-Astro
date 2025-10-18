# A/B Funnel Testing Guide

## 🧪 Quick Test Instructions (With Manual Processing)

### Step 1: Visit Funnel & Interact
1. Go to `/funnel/` in your browser
2. You'll be redirected to `/funnel/a/` or `/funnel/b/`
3. **Accept cookie consent** when banner appears (required for tracking)
4. Interact with the page:
   - ✅ Scroll down (tracks at 25%, 50%, 75%, 100%)
   - ✅ Click the main CTA button (`data-el="cta-primary"`)
   - ✅ Click into form fields (`data-el="form-main"`)
   - ✅ Fill out and submit the form

### Step 2: Wait for Event Flush
**Wait 5 seconds** - Events are sent to `/api/engage` every 3 seconds

### Step 3: Check Dashboard (Instant Data)
1. Go to `/admin/funnel-dashboard/`
2. Login with your admin credentials
3. Click **"Refresh Data"** button (top right)
4. **You'll see immediately:**
   - ✅ 1 conversion
   - ✅ £200 revenue
   - ✅ Recent activity showing your form submission
   - ❌ Heatmap still empty
   - ❌ Section reach still empty
   - ❌ Form metrics still empty

### Step 4: Process Engagement Data (INSTANT)
1. In Quick Actions section, click **"⚡ Process Engagement Data Now"**
2. Wait 2-5 seconds for processing
3. You'll see alert: "✅ Success! Processed X events"
4. Dashboard auto-refreshes after 1 second
5. **Now everything shows:**
   - ✅ Heatmap with click points
   - ✅ Section reach percentages
   - ✅ Form abandonment metrics
   - ✅ Scroll depth data
   - ✅ Rage click counts (if any)

---

## ⏱️ Data Update Timing

### Without Manual Processing
| Time | What Happens | What Shows |
|------|-------------|------------|
| **0:00** | Submit form | Nothing |
| **0:05** | Events flushed to API | Nothing visible yet |
| **0:10** | Refresh dashboard | ✅ Conversion shows<br>❌ No heatmap/engagement |
| **0:15** | Cron runs automatically | ✅ All data processed |
| **0:16** | Refresh dashboard | ✅ Everything visible |

### With Manual Processing ⚡
| Time | What Happens | What Shows |
|------|-------------|------------|
| **0:00** | Submit form | Nothing |
| **0:05** | Events flushed to API | Nothing visible yet |
| **0:10** | Refresh dashboard | ✅ Conversion shows<br>❌ No heatmap/engagement |
| **0:11** | Click "Process Engagement Data Now" | ✅ **Everything processes instantly** |
| **0:12** | Auto-refresh after processing | ✅ **All data visible** |

---

## 📊 What Gets Tracked

### Client-Side Events (engage.ts)
- **Section Visibility**: Entry/exit times for hero, benefits, proof, form sections
- **Clicks**: All elements with `data-el` attribute + heatmap coordinates
- **Form Interactions**: Focus/blur on each field, submission time, abandonment
- **Rage Clicks**: 3+ rapid clicks on non-interactive elements
- **Scroll Depth**: Milestones at 25%, 50%, 75%, 100%

### Server-Side Aggregation
- **Section Reach %**: What % of visitors reached each section
- **Average Time in Section**: How long users spent in each section
- **Form Metrics**: Start rate, completion rate, abandonment rate, field drop-off
- **Heatmap Data**: Click density visualization
- **Scroll Milestones**: Distribution of how far users scrolled

---

## 🔄 Auto-Refresh Settings

- **Dashboard**: Auto-refreshes every **5 minutes**
- **Cron Aggregation**: Runs every **15 minutes** (can bypass with manual button)
- **Metrics Cache**: `/api/funnel-metrics` caches for **5 minutes**

---

## 🎯 Testing Multiple Variants

### Test Variant A
1. Clear cookies or use incognito
2. Visit `/funnel/`
3. Get redirected to `/funnel/a/`
4. Submit form → Process data → See results

### Test Variant B
1. Clear cookies or use new incognito window
2. Visit `/funnel/`
3. Get redirected to `/funnel/b/` (50% chance)
4. If you got A again, clear cookies and retry
5. Submit form → Process data → See results

### Force Specific Variant
- Direct visit: `/funnel/a/` or `/funnel/b/`
- Cookie will lock you to that variant for 30 days

---

## 🛠️ API Endpoints

### For Manual Testing
- **POST** `/api/process-engagement` - Process engagement data now (requires admin auth)
- **GET** `/api/funnel-metrics` - Get aggregated funnel metrics
- **POST** `/api/ai-advice` - Generate AI recommendations
- **GET** `/api/heatmap?page=/funnel/a/&variant=A&period=24h` - Get heatmap data

### Automatic Background
- **POST** `/api/engage` - Receives engagement events from client
- **POST** `/api/funnel-lead` - Receives form submissions

---

## ✅ Verification Checklist

After testing, verify:

- [ ] Cookie consent banner appeared
- [ ] Analytics consent was granted
- [ ] Form submitted successfully
- [ ] Redirected to thank-you page
- [ ] Conversion shows in dashboard immediately
- [ ] "Process Engagement Data Now" button works
- [ ] Heatmap shows click points after processing
- [ ] Section reach percentages show
- [ ] Form metrics show (starts, completions, avg time)
- [ ] Recent activity lists your form submission
- [ ] Email received (if RESEND_API_KEY configured)
- [ ] Customer confirmation email received

---

## 🔧 Troubleshooting

### No data showing after form submission
1. Check browser console for errors
2. Verify analytics consent was granted (check localStorage: `digitalvisibility_cookie_consent`)
3. Click "Refresh Data" button
4. Check Network tab - should see POST to `/api/funnel-lead`

### Heatmap empty after manual processing
1. Verify you clicked elements with `data-el` attributes
2. Check console for engage.ts errors
3. Verify events were sent (Network tab → `/api/engage`)
4. Try processing again - might have been no raw events to process

### "Process Engagement Data Now" shows 0 events
- This means no engagement events were stored yet
- Make sure you accepted cookie consent
- Interact more with the page (scroll, click CTAs)
- Wait 5 seconds for events to flush
- Try processing again

### 401 Unauthorized on manual processing
- Re-authenticate on the dashboard
- Ensure ADMIN_USER and ADMIN_PASS are set in Cloudflare environment variables

---

## 📝 Notes

- **Consent is Required**: No tracking happens until analytics consent is granted
- **Data Retention**: Engagement events kept for 7 days, aggregated data for 30 days
- **Rate Limiting**: 100 events per minute per IP address
- **Cron Schedule**: Production cron runs every 15 minutes (defined in `wrangler.toml`)
- **Manual Processing**: Bypasses cron schedule, processes immediately on-demand

---

## 🚀 Production Deployment

When deployed to Cloudflare Pages:

1. Ensure environment variables are set:
   - `ADMIN_USER` - Dashboard login username
   - `ADMIN_PASS` - Dashboard login password
   - `RESEND_API_KEY` - For sending emails (optional)
   - `CLAUDE_API_KEY` - For AI recommendations (optional)

2. KV namespace `FUNNEL_DATA` must be bound

3. Durable Object `ENGAGE_STORE` must be bound

4. Cron triggers will run automatically every 15 minutes

5. Manual processing button will work immediately for instant results during testing
