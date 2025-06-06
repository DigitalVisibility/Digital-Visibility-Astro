# Facebook Conversions API Setup - Digital Visibility

## 🎯 Overview

Your Facebook Conversions API is now fully implemented with both server-side tracking and client-side helpers. This setup provides:

- **Server-side tracking** for reliability and privacy compliance
- **Automatic event deduplication** with your existing Meta Pixel
- **Privacy-compliant data hashing** for all PII data
- **Real-time conversion tracking** from your website

## 🔧 What's Been Implemented

### 1. Server-Side API Endpoint
- **Location**: `/src/pages/api/facebook-conversions.js`
- **URL**: `https://digitalvisibility.com/api/facebook-conversions`
- **Features**: 
  - Secure data hashing (SHA-256)
  - Event deduplication
  - Error handling & logging
  - Test mode support

### 2. Client-Side JavaScript Helper
- **Location**: `/public/scripts/facebook-conversions.js`
- **Features**:
  - Automatic page view tracking
  - Form submission tracking
  - CTA click tracking
  - Manual event tracking methods

### 3. Auto-Loaded on All Pages
- Added to MainLayout.astro
- Loads on every page of your website
- Automatically tracks page views

## 🧪 Testing Your Setup

### Step 1: Enable Facebook Test Events
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2/)
2. Select your Pixel (ID: 1075086131348964)
3. Click **"Test Events"** tab
4. Copy your **Test Event Code**

### Step 2: Enable Test Mode in Browser
Open browser console and run:
```javascript
// Replace YOUR_TEST_CODE with the code from Facebook
window.FacebookConversions.enableTestMode('YOUR_TEST_CODE');
```

### Step 3: Test Events Manually
```javascript
// Test page view
window.FacebookConversions.trackPageView();

// Test lead generation
window.FacebookConversions.trackLead({
  email: 'test@example.com',
  first_name: 'John'
});

// Test contact form
window.FacebookConversions.trackContact({
  email: 'test@example.com',
  phone: '+44123456789'
});

// Test purchase (for e-commerce)
window.FacebookConversions.trackPurchase({
  email: 'test@example.com'
}, {
  value: 99.99,
  currency: 'GBP',
  order_id: 'ORDER_123'
});
```

### Step 4: Verify in Facebook
- Go back to Test Events in Facebook Events Manager
- You should see your events appearing in real-time
- Check that event data looks correct

## 📊 Available Tracking Methods

### Automatic Tracking (Already Set Up)
- ✅ **Page Views** - Tracked on every page load
- ✅ **Contact Forms** - Auto-detects form submissions
- ✅ **Newsletter Signups** - Auto-detects newsletter forms
- ✅ **CTA Clicks** - Tracks important button clicks

### Manual Tracking (Available via JavaScript)
```javascript
// Page View
window.FacebookConversions.trackPageView();

// Lead Generation
window.FacebookConversions.trackLead(userData, customData);

// Contact Form Submission
window.FacebookConversions.trackContact(userData, customData);

// Purchase
window.FacebookConversions.trackPurchase(userData, purchaseData);

// Content View
window.FacebookConversions.trackViewContent(contentData, userData);

// Search
window.FacebookConversions.trackSearch('digital marketing');

// Schedule (Appointments)
window.FacebookConversions.trackSchedule(userData, customData);

// Subscribe (Services)
window.FacebookConversions.trackSubscribe(userData, subscriptionData);

// Custom Events
window.FacebookConversions.trackCustomEvent('CustomEventName', userData, customData);
```

## 🔒 Privacy & Security Features

### Data Protection
- ✅ **PII Hashing**: All personal data automatically hashed with SHA-256
- ✅ **IP Collection**: Client IP automatically captured
- ✅ **User Agent**: Browser info automatically captured
- ✅ **Cookie Integration**: Reads `_fbp` and `_fbc` cookies for better matching

### What Gets Hashed
- Email addresses
- Phone numbers
- Names (first/last)
- Address data (city, state, zip, country)
- External IDs

### What Doesn't Get Hashed
- Facebook Browser ID (`_fbp`)
- Facebook Click ID (`_fbc`)
- Currency codes
- Purchase values
- Order IDs

## 🚀 Advanced Usage

### Custom Form Tracking
Add to specific forms:
```html
<form id="consultation-form">
  <input name="email" type="email" required>
  <input name="first_name" type="text" required>
  <input name="phone" type="tel">
  <button type="submit">Book Consultation</button>
</form>

<script>
document.getElementById('consultation-form').addEventListener('submit', function(e) {
  const formData = new FormData(this);
  window.FacebookConversions.trackLead({
    email: formData.get('email'),
    first_name: formData.get('first_name'),
    phone: formData.get('phone')
  }, {
    content_name: 'Consultation Booking',
    content_category: 'high_value_lead',
    value: 500 // Estimated lead value
  });
});
</script>
```

### Service-Specific Tracking
```javascript
// Digital Marketing Service Interest
window.FacebookConversions.trackViewContent({
  content_name: 'Digital Marketing Services',
  content_category: 'service_page',
  content_ids: ['digital-marketing'],
  value: 2995 // Service value
});

// AI Automation Interest
window.FacebookConversions.trackViewContent({
  content_name: 'AI Conversation Automation',
  content_category: 'service_page',
  content_ids: ['ai-automation'],
  value: 1597 // Service value
});
```

## 🔍 Monitoring & Debugging

### Check API Health
Visit: `https://digitalvisibility.com/api/facebook-conversions`
Should return:
```json
{
  "status": "Facebook Conversions API endpoint is running",
  "pixel_id": "1075086131348964",
  "api_version": "v21.0"
}
```

### Console Logging
- ✅ Success events show: `✅ Facebook Conversion sent: PageView`
- ❌ Failed events show: `❌ Facebook Conversion failed:`
- 🧪 Test mode shows: `🧪 Facebook Conversions Test Mode enabled`

### Facebook Events Manager
Monitor in real-time:
1. Events Manager → Your Pixel → Overview
2. Look for server events with source "website"
3. Check Event Match Quality score
4. Verify deduplication is working

## ⚠️ Important Notes

### Deduplication
- Your existing Meta Pixel and this Conversions API will automatically deduplicate
- Same events sent via both channels won't be double-counted
- Each event gets a unique `event_id` for proper deduplication

### Performance
- Events are sent asynchronously (non-blocking)
- Page load performance is not affected
- Failed events are logged but don't break the user experience

### GDPR Compliance
- Only send events with proper user consent
- All PII is automatically hashed before sending
- You maintain full control over what data is shared

## 🆘 Troubleshooting

### Events Not Showing in Facebook
1. Check browser console for errors
2. Verify test event code is set correctly
3. Check if ad blockers are interfering
4. Ensure cookies are enabled

### API Errors
1. Check server logs for detailed error messages
2. Verify access token is correct and active
3. Ensure pixel ID matches your Meta Pixel
4. Check Facebook API status

### Common Issues
- **"Access token invalid"**: Token may have expired, regenerate in Events Manager
- **"Pixel not found"**: Check pixel ID is correct
- **"No events received"**: Check test event code and API endpoint accessibility

## 📞 Support

If you need help:
1. Check browser console for error messages
2. Review Facebook Events Manager for event status
3. Test the API endpoint directly
4. Verify all configuration values are correct

## 🎉 You're All Set!

Your Facebook Conversions API is now:
- ✅ Fully configured and ready to use
- ✅ Automatically tracking important events
- ✅ Privacy compliant with data hashing
- ✅ Integrated with your existing Meta Pixel
- ✅ Providing better ad attribution and optimization

**Next Steps:**
1. Test the implementation using the steps above
2. Monitor events in Facebook Events Manager
3. Use the improved conversion data to optimize your ad campaigns
4. Consider adding custom tracking for specific business goals 