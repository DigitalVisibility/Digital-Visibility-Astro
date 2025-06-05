// Digital Visibility Analyzer - Lead Collection Worker
// This worker stores lead data in KV storage

// Standard headers to enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace with your specific domain in production
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, API-Key',
  'Access-Control-Max-Age': '86400',
};

// Helper function to handle OPTIONS requests (for CORS preflight)
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
}

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  // Set default response headers including CORS
  let responseHeaders = {
    'Content-Type': 'application/json',
    ...corsHeaders
  };

  // Basic endpoint for testing connectivity
  if (request.url.endsWith('/') || request.url.endsWith('/health')) {
    return new Response(JSON.stringify({ status: 'ok', message: 'Worker is operational' }), {
      headers: responseHeaders,
    });
  }

  if (request.url.includes('/store-lead')) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: responseHeaders
      });
    }

    try {
      // Get API key from header for authentication
      const apiKey = request.headers.get('API-Key');
      
      // Simple API key check
      if (apiKey !== 'dv_analyzer_key_2025') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: responseHeaders
        });
      }

      // Parse the request body
      const payload = await request.json();
      
      // Validate the payload
      if (!payload.lead || !payload.timestamp) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 400,
          headers: responseHeaders
        });
      }

      // Generate a unique ID for the lead
      const leadId = Date.now().toString() + Math.random().toString(36).substring(2, 15);
      
      // Store lead data in KV storage
      const leadData = {
        ...payload.lead,
        id: leadId,
        timestamp: payload.timestamp,
        source: payload.source || 'unknown'
      };
      
      // Save to KV namespace
      await LEAD_STORAGE.put(leadId, JSON.stringify(leadData));
      
      // Return success response
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Lead data stored successfully', 
        leadId: leadId 
      }), {
        headers: responseHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'An error occurred while processing the request',
        details: error.message
      }), {
        status: 500,
        headers: responseHeaders
      });
    }
  }

  if (request.url.includes('/get-leads')) {
    // Get API key from header for authentication
    const apiKey = request.headers.get('API-Key');
    
    // Simple API key check
    if (apiKey !== 'dv_analyzer_key_2025') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: responseHeaders
      });
    }

    try {
      // List all keys in KV storage
      const keys = await LEAD_STORAGE.list();
      
      // Get all lead data
      const leads = [];
      for (const key of keys.keys) {
        const leadData = await LEAD_STORAGE.get(key.name, 'json');
        if (leadData) {
          leads.push(leadData);
        }
      }
      
      // Sort by timestamp (newest first)
      leads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Return the leads
      return new Response(JSON.stringify({ 
        success: true, 
        leads: leads 
      }), {
        headers: responseHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'An error occurred while retrieving leads',
        details: error.message
      }), {
        status: 500,
        headers: responseHeaders
      });
    }
  }

  if (request.url.includes('/clear-leads')) {
    // Get API key from header for authentication
    const apiKey = request.headers.get('API-Key');
    
    // Simple API key check - require API key for deletion
    if (apiKey !== 'dv_analyzer_key_2025') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: responseHeaders
      });
    }

    try {
      // List all keys in KV storage
      const keys = await LEAD_STORAGE.list();
      
      // Delete all keys
      for (const key of keys.keys) {
        await LEAD_STORAGE.delete(key.name);
      }
      
      // Return success response
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'All leads cleared successfully' 
      }), {
        headers: responseHeaders
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'An error occurred while clearing leads',
        details: error.message
      }), {
        status: 500,
        headers: responseHeaders
      });
    }
  }

  // If no endpoint matched
  return new Response(JSON.stringify({ 
    error: 'Not found',
    availableEndpoints: ['/store-lead', '/get-leads', '/clear-leads', '/health']
  }), {
    status: 404,
    headers: responseHeaders
  });
}

// Main event listener for the worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
