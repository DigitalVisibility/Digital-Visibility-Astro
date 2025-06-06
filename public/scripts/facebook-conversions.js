/**
 * Facebook Conversions API Client-Side Helper
 * Digital Visibility - Professional Implementation
 */

class FacebookConversions {
  constructor() {
    this.apiEndpoint = '/api/facebook-conversions';
    this.testEventCode = null; // Set to test code when testing
  }

  /**
   * Get Facebook Browser ID (fbp) from cookie
   */
  getFacebookBrowserId() {
    const fbpCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('_fbp='));
    return fbpCookie ? fbpCookie.split('=')[1] : null;
  }

  /**
   * Get Facebook Click ID (fbc) from cookie
   */
  getFacebookClickId() {
    const fbcCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('_fbc='));
    return fbcCookie ? fbcCookie.split('=')[1] : null;
  }

  /**
   * Get user data from form or page context
   */
  getUserData(customUserData = {}) {
    return {
      fbp: this.getFacebookBrowserId(),
      fbc: this.getFacebookClickId(),
      ...customUserData
    };
  }

  /**
   * Send event to Facebook Conversions API
   */
  async sendEvent(eventName, userData = {}, customData = {}) {
    try {
      const payload = {
        event_name: eventName,
        event_source_url: window.location.href,
        user_data: this.getUserData(userData),
        custom_data: customData
      };

      // Add test event code if in testing mode
      if (this.testEventCode) {
        payload.test_event_code = this.testEventCode;
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Facebook Conversion sent:', eventName, result);
        return result;
      } else {
        console.error('❌ Facebook Conversion failed:', result);
        return null;
      }

    } catch (error) {
      console.error('❌ Facebook Conversion error:', error);
      return null;
    }
  }

  /**
   * Track Page View
   */
  async trackPageView(userData = {}) {
    return this.sendEvent('PageView', userData);
  }

  /**
   * Track Lead (Contact form submission, newsletter signup)
   */
  async trackLead(userData = {}, customData = {}) {
    return this.sendEvent('Lead', userData, customData);
  }

  /**
   * Track Purchase
   */
  async trackPurchase(userData = {}, purchaseData = {}) {
    const customData = {
      currency: purchaseData.currency || 'GBP',
      value: purchaseData.value || 0,
      order_id: purchaseData.order_id || null,
      content_type: 'product',
      ...purchaseData
    };
    return this.sendEvent('Purchase', userData, customData);
  }

  /**
   * Track Contact (Contact form submission)
   */
  async trackContact(userData = {}, customData = {}) {
    return this.sendEvent('Contact', userData, customData);
  }

  /**
   * Track Search
   */
  async trackSearch(searchTerm, userData = {}) {
    const customData = {
      search_string: searchTerm,
      content_category: 'search'
    };
    return this.sendEvent('Search', userData, customData);
  }

  /**
   * Track View Content (Service page views, blog post views)
   */
  async trackViewContent(contentData = {}, userData = {}) {
    const customData = {
      content_name: contentData.content_name || document.title,
      content_category: contentData.content_category || 'page',
      content_ids: contentData.content_ids || [window.location.pathname],
      content_type: 'product',
      ...contentData
    };
    return this.sendEvent('ViewContent', userData, customData);
  }

  /**
   * Track Schedule (Appointment booking)
   */
  async trackSchedule(userData = {}, customData = {}) {
    return this.sendEvent('Schedule', userData, customData);
  }

  /**
   * Track Subscribe (Newsletter, service subscriptions)
   */
  async trackSubscribe(userData = {}, subscriptionData = {}) {
    const customData = {
      currency: subscriptionData.currency || 'GBP',
      value: subscriptionData.value || 0,
      predicted_ltv: subscriptionData.predicted_ltv || 0,
      ...subscriptionData
    };
    return this.sendEvent('Subscribe', userData, customData);
  }

  /**
   * Track custom event
   */
  async trackCustomEvent(eventName, userData = {}, customData = {}) {
    return this.sendEvent(eventName, userData, customData);
  }

  /**
   * Enable test mode (for debugging)
   */
  enableTestMode(testEventCode) {
    this.testEventCode = testEventCode;
    console.log('🧪 Facebook Conversions Test Mode enabled:', testEventCode);
  }

  /**
   * Disable test mode
   */
  disableTestMode() {
    this.testEventCode = null;
    console.log('✅ Facebook Conversions Test Mode disabled');
  }
}

// Create global instance
window.FacebookConversions = new FacebookConversions();

// Auto-track page view on load
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure cookies are set
  setTimeout(() => {
    window.FacebookConversions.trackPageView();
  }, 500);
});

// Track common events automatically
document.addEventListener('DOMContentLoaded', function() {
  
  // Track contact form submissions
  const contactForms = document.querySelectorAll('form[action*="contact"], form.contact-form');
  contactForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const formData = new FormData(form);
      const userData = {
        email: formData.get('email'),
        first_name: formData.get('first_name') || formData.get('name'),
        phone: formData.get('phone')
      };
      
      window.FacebookConversions.trackContact(userData, {
        content_name: 'Contact Form Submission',
        content_category: 'lead_generation'
      });
    });
  });

  // Track newsletter signups
  const newsletterForms = document.querySelectorAll('form[action*="newsletter"], form.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const formData = new FormData(form);
      const userData = {
        email: formData.get('email')
      };
      
      window.FacebookConversions.trackSubscribe(userData, {
        content_name: 'Newsletter Signup',
        content_category: 'subscription'
      });
    });
  });

  // Track clicks on important CTA buttons
  const ctaButtons = document.querySelectorAll('a[href*="contact"], a[href*="pricing"], button[data-track="cta"]');
  ctaButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const buttonText = button.textContent.trim();
      
      window.FacebookConversions.trackViewContent({
        content_name: `CTA Click: ${buttonText}`,
        content_category: 'engagement',
        content_ids: [button.href || button.getAttribute('data-track')]
      });
    });
  });

});

// Console helper for manual testing
console.log('🎯 Facebook Conversions API loaded. Use window.FacebookConversions to send events manually.');
console.log('📖 Available methods: trackPageView, trackLead, trackPurchase, trackContact, trackSearch, trackViewContent, trackSchedule, trackSubscribe');
console.log('🧪 Enable test mode: window.FacebookConversions.enableTestMode("YOUR_TEST_CODE")'); 