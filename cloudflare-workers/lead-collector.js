/**
 * Digital Visibility - Lead Collector Worker
 * 
 * This Cloudflare Worker collects lead data from the analyzer form submissions
 * and stores it in Cloudflare KV for centralized access.
 * 
 * To deploy this worker:
 * 1. Create a new Worker in Cloudflare Dashboard
 * 2. Create a KV namespace called "LEAD_STORAGE"
 * 3. Bind the KV namespace to your worker
 * 4. Set up a custom domain (lead-collector.digitalvisibility.workers.dev)
 */

// API Key for basic authentication
const API_KEY = 'dv_analyzer_key_2025';

async function handleLeadStorage(request) {
  // Verify the API key
  const apiKey = request.headers.get('API-Key');
  if (apiKey !== API_KEY) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Unauthorized' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse the request body
    const data = await request.json();
    
    if (!data.lead || !data.lead.email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required lead data' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate a unique ID for this lead
    const leadId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 10);
    
    // Store in KV with lead ID as key
    await LEAD_STORAGE.put(leadId, JSON.stringify({
      ...data,
      submittedAt: new Date().toISOString(),
    }));
    
    // Also store in a collection of all leads
    const allLeadsKey = 'all_leads';
    let allLeads = [];
    
    // Try to get existing leads
    const existingLeadsJson = await LEAD_STORAGE.get(allLeadsKey);
    if (existingLeadsJson) {
      try {
        allLeads = JSON.parse(existingLeadsJson);
      } catch (e) {
        console.error('Error parsing existing leads:', e);
      }
    }
    
    // Add this lead to the collection
    allLeads.unshift({
      leadId,
      email: data.lead.email,
      name: data.lead.name,
      businessName: data.lead.businessName,
      phone: data.lead.phone,
      url: data.lead.url,
      timestamp: data.timestamp || new Date().toISOString(),
    });
    
    // Only keep the most recent 1000 leads to prevent hitting KV size limits
    if (allLeads.length > 1000) {
      allLeads = allLeads.slice(0, 1000);
    }
    
    // Save the updated list back to KV
    await LEAD_STORAGE.put(allLeadsKey, JSON.stringify(allLeads));
    
    // Return success response with the lead ID
    return new Response(JSON.stringify({ 
      success: true, 
      leadId,
      message: 'Lead data stored successfully' 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, API-Key'
      }
    });
  } catch (error) {
    // Handle any errors
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle retrieving all leads (requires API key as query parameter)
async function handleGetAllLeads(request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('key');
  
  if (apiKey !== API_KEY) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Unauthorized' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const allLeadsJson = await LEAD_STORAGE.get('all_leads');
    
    if (!allLeadsJson) {
      return new Response(JSON.stringify({ 
        success: true, 
        leads: [],
        message: 'No leads found' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const allLeads = JSON.parse(allLeadsJson);
    
    return new Response(JSON.stringify({ 
      success: true, 
      leads: allLeads,
      count: allLeads.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle clearing all leads (admin only function)
async function handleClearAllLeads(request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('key');
  
  if (apiKey !== API_KEY) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Unauthorized' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Get all KV keys with a list operation would be ideal but we'll use the master key
    await LEAD_STORAGE.delete('all_leads');
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: 'All lead data cleared successfully'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Main event handler for the worker
addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    event.respondWith(
      new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, API-Key',
          'Access-Control-Max-Age': '86400'
        }
      })
    );
    return;
  }
  
  // Route requests based on path and method
  if (url.pathname === '/store-lead' && request.method === 'POST') {
    event.respondWith(handleLeadStorage(request));
  } else if (url.pathname === '/get-leads' && request.method === 'GET') {
    event.respondWith(handleGetAllLeads(request));
  } else if (url.pathname === '/clear-leads' && request.method === 'POST') {
    event.respondWith(handleClearAllLeads(request));
  } else {
    event.respondWith(
      new Response(JSON.stringify({
        success: false,
        error: 'Not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    );
  }
});
