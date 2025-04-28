// Function to save lead data to both localStorage and Cloudflare Worker
function saveLeadData(lead) {
  console.log('Saving lead data to localStorage and Cloudflare:', lead);
  
  try {
    // 1. First save to local storage for backward compatibility
    const existingLeadsJson = localStorage.getItem('analyzer_leads') || '[]';
    const existingLeads = JSON.parse(existingLeadsJson);
    existingLeads.unshift(lead);
    localStorage.setItem('analyzer_leads', JSON.stringify(existingLeads));
    
    // 2. Then save to centralized storage using Cloudflare Workers
    // This uses a Cloudflare Worker endpoint that saves data to KV storage
    console.log('Sending data to Cloudflare Worker:', lead);
    
    // Create payload for Cloudflare Worker
    const payload = {
      lead: lead,
      timestamp: new Date().toISOString(),
      source: window.location.hostname,
      apiKey: 'dv_analyzer_key_2025' // Include API key in body
    };
    
    // Log the URL and payload for debugging
    console.log('Cloudflare Worker URL:', 'https://lead-collection.darrangoulding.workers.dev/store-lead');
    console.log('Payload:', payload);
    
    fetch('https://lead-collection.darrangoulding.workers.dev/store-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': 'dv_analyzer_key_2025' // Simple API key for basic security
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      console.log('Cloudflare Worker response status:', response.status);
      console.log('Cloudflare Worker response headers:', [...response.headers.entries()]);
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Cloudflare Worker error response:', text);
          throw new Error(`API error: ${response.status} - ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Lead data sent to Cloudflare storage successfully', data);
      // Generate a shared storage key for other browsers to access
      try {
        // Create a master leads key that we'll check in the admin page
        const masterKey = 'analyzer_master_' + lead.email.replace(/[^a-zA-Z0-9]/g, '');
        localStorage.setItem(masterKey, JSON.stringify({ 
          timestamp: new Date().toISOString(),
          leadId: data.leadId || 'unknown'
        }));
      } catch (e) {
        console.error('Error storing master key:', e);
      }
    })
    .catch(error => {
      console.error('Error sending lead data to Cloudflare storage:', error);
    });
    
    console.log('Lead data saved successfully to localStorage:', lead);
    return true;
  } catch (error) {
    console.error('Error saving lead data:', error);
    return false;
  }
}

// Find your contact form submission event listener and replace it with this:
// contactForm.addEventListener('submit', function(e) {
//   e.preventDefault();
//   
//   // Show spinner
//   const contactButtonText = document.getElementById('leadContactButtonText');
//   const contactButtonSpinner = document.getElementById('leadContactButtonSpinner');
//   const submitButton = document.getElementById('leadSubmitContactButton');
//   
//   if (contactButtonText && contactButtonSpinner && submitButton) {
//     contactButtonText.textContent = 'Sending...';
//     contactButtonSpinner.classList.remove('hidden');
//     submitButton.disabled = true;
//   }
//   
//   // Collect form data
//   const formData = new FormData(contactForm);
//   
//   // Get form data for debugging
//   const formEntries = {};
//   for (let [key, value] of formData.entries()) {
//     formEntries[key] = value.toString();
//   }
//   console.log('Submitting form data:', formEntries);
//   
//   // Prepare lead data (do this BEFORE form submission)
//   let urlValue = '';
//   const initialUrlInput = document.getElementById('leadUrlInput');
//   if (initialUrlInput && initialUrlInput.value) {
//     urlValue = initialUrlInput.value;
//   }
//   
//   const newLead = {
//     name: formEntries['name'] || '',
//     email: formEntries['email'] || '',
//     businessName: formEntries['business_name'] || '',
//     phone: formEntries['phone'] || '',
//     url: formEntries['analyzed_url'] || urlValue || '',
//     timestamp: new Date().toISOString(),
//     consent: formEntries['consent'] ? true : false
//   };
//   
//   // Save lead data to localStorage and Cloudflare (do this BEFORE form submission)
//   saveLeadData(newLead);
//   
//   // Submit form to Web3Forms (this is separate from lead data storage)
//   fetch('https://api.web3forms.com/submit', {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json'
//     },
//     body: formData
//   })
//   .then(async (response) => {
//     // Reset form UI
//     if (contactButtonText && contactButtonSpinner && submitButton) {
//       contactButtonText.textContent = 'Submit';
//       contactButtonSpinner.classList.add('hidden');
//       submitButton.disabled = false;
//     }
//     
//     const resultContainer = document.getElementById('leadFormResult');
//     const leadFormContainer = document.getElementById('leadFormContainer');
//     
//     if (response.status === 200) {
//       resultContainer.innerHTML = `<div class="text-center text-green-600 rounded p-6 mt-4">Thank you for your message. We'll be in touch soon!</div>`;
//       leadFormContainer.classList.add('hidden');
//     } else {
//       resultContainer.innerHTML = `<div class="text-center text-red-600 rounded p-6 mt-4">Sorry, there was an error. Please try again.</div>`;
//     }
//   })
//   .catch(error => {
//     console.error('Error submitting form:', error);
//     
//     // Reset form UI on error
//     if (contactButtonText && contactButtonSpinner && submitButton) {
//       contactButtonText.textContent = 'Submit';
//       contactButtonSpinner.classList.add('hidden');
//       submitButton.disabled = false;
//     }
//     
//     const resultContainer = document.getElementById('leadFormResult');
//     resultContainer.innerHTML = `<div class="text-center text-red-600 rounded p-6 mt-4">Sorry, there was an error. Please try again.</div>`;
//   });
// });
