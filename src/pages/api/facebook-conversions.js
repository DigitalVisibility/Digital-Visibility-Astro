import crypto from 'crypto';

// Facebook Conversions API Configuration
const FB_PIXEL_ID = '1075086131348964'; // Your pixel ID from the Meta Pixel Code
const FB_ACCESS_TOKEN = 'EAAOUROB6GeMBOxXJgzYPfvZCriTHKnkT6n99AbkACH2WSZAnqOGeM4xk7ZB91ChCCZB8DHLB5N7RiuiHfZAZCLZBeX2H8br1s3bhvzVtHFwMJ8eiGReS9orWf0dHgxwSl4JQIo9Ofsq6uegIJcoGDFjQ3iN76kVK8NXngXlapJAo3GBkrT74iEhtILVZBlGu2wZDZD';
const FB_API_VERSION = 'v21.0';
const FB_ENDPOINT = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events`;

// Hash function for PII data
function hashData(data) {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// Generate event ID for deduplication
function generateEventId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function POST({ request }) {
  try {
    // Parse the request body
    const body = await request.json();
    const { event_name, user_data, custom_data, event_source_url, test_event_code } = body;

    // Validate required fields
    if (!event_name) {
      return new Response(JSON.stringify({ 
        error: 'event_name is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Hash user data for privacy compliance
    const hashedUserData = {};
    if (user_data) {
      if (user_data.email) hashedUserData.em = hashData(user_data.email);
      if (user_data.phone) hashedUserData.ph = hashData(user_data.phone);
      if (user_data.first_name) hashedUserData.fn = hashData(user_data.first_name);
      if (user_data.last_name) hashedUserData.ln = hashData(user_data.last_name);
      if (user_data.city) hashedUserData.ct = hashData(user_data.city);
      if (user_data.state) hashedUserData.st = hashData(user_data.state);
      if (user_data.zip) hashedUserData.zp = hashData(user_data.zip);
      if (user_data.country) hashedUserData.country = hashData(user_data.country);
      if (user_data.external_id) hashedUserData.external_id = hashData(user_data.external_id);
      if (user_data.fbp) hashedUserData.fbp = user_data.fbp; // Don't hash fbp
      if (user_data.fbc) hashedUserData.fbc = user_data.fbc; // Don't hash fbc
    }

    // Create the event payload
    const eventData = {
      event_name: event_name,
      event_time: Math.floor(Date.now() / 1000), // Unix timestamp
      event_id: generateEventId(), // For deduplication
      action_source: 'website',
      event_source_url: event_source_url || request.headers.get('referer') || 'https://digitalvisibility.com',
      user_data: {
        client_ip_address: clientIP,
        client_user_agent: userAgent,
        ...hashedUserData
      }
    };

    // Add custom data if provided
    if (custom_data) {
      eventData.custom_data = custom_data;
    }

    // Prepare the API payload
    const payload = {
      data: [eventData],
      access_token: FB_ACCESS_TOKEN
    };

    // Add test event code if provided (for testing only)
    if (test_event_code) {
      payload.test_event_code = test_event_code;
    }

    // Send to Facebook Conversions API
    const response = await fetch(FB_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Facebook API Error:', result);
      return new Response(JSON.stringify({ 
        error: 'Failed to send event to Facebook',
        details: result
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      events_received: result.events_received,
      fbtrace_id: result.fbtrace_id,
      event_id: eventData.event_id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Conversions API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET requests (for health check)
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'Facebook Conversions API endpoint is running',
    pixel_id: FB_PIXEL_ID,
    api_version: FB_API_VERSION
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 