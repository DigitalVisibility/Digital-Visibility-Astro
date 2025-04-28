// Copy this code and add it directly to your analyzer page or use it for reference
// This function handles sending lead data to the Cloudflare Worker

// The complete function to save lead data to Cloudflare
function saveToCloudflare(leadData) {
  console.log('Sending lead data to Cloudflare:', leadData);
  
  const payload = {
    lead: leadData,
    timestamp: new Date().toISOString(),
    source: window.location.hostname,
    apiKey: 'dv_analyzer_key_2025' // Include API key in body for auth
  };
  
  return fetch('https://lead-collection.darrangoulding.workers.dev/store-lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': 'dv_analyzer_key_2025'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    console.log('Cloudflare response status:', response.status);
    if (!response.ok) {
      return response.text().then(text => {
        console.error('Cloudflare error response:', text);
        throw new Error(`API error: ${response.status} - ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Cloudflare success response:', data);
    return data;
  })
  .catch(error => {
    console.error('Error sending to Cloudflare:', error);
    // Don't throw, just log the error so the form can continue
    return { success: false, error: error.message };
  });
}

// To use this in the form submission event, modify your existing form submission handler
// Look for the part that saves lead data to localStorage and add this immediately after

/*
Example:

After saving to localStorage:

const existingLeadsJson = localStorage.getItem('analyzer_leads') || '[]';
const existingLeads = JSON.parse(existingLeadsJson);
existingLeads.unshift(newLead);
localStorage.setItem('analyzer_leads', JSON.stringify(existingLeads));

// Then add this line to also save to Cloudflare:
saveToCloudflare(newLead);

// This will run independently of the Web3Forms submission
// so even if the form submission fails, the lead data will be saved
*/
