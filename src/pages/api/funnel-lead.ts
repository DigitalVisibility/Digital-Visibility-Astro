import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const resendApiKey = import.meta.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const data = await request.formData();
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const website = data.get('website') as string;
    const variant = data.get('variant') as string;

    // Validate required fields
    if (!name || !email || !website || !variant) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email format' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate website URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(website)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Please enter a valid website URL (starting with http:// or https://)' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate variant
    if (!['a', 'b'].includes(variant)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid variant' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'AI Visibility Funnel <noreply@updates.digitalvisibility.com>',
        to: ['support@digitalvisibility.com'],
        reply_to: email,
        subject: `🎯 AI Visibility Funnel Lead - Variant ${variant.toUpperCase()} - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎯 New AI Visibility Funnel Lead</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Lead Details</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Website:</strong> <a href="${website}" target="_blank">${website}</a></p>
              <p><strong>Funnel Variant:</strong> <span style="background: #dbeafe; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${variant.toUpperCase()}</span></p>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #059669;">Next Steps</h3>
              <ul>
                <li>Send AI Optimization Audit within 24 hours</li>
                <li>Schedule discovery call to discuss AI Visibility Plan</li>
                <li>Add to CRM with variant tracking</li>
                <li>Follow up with personalized AI optimization recommendations</li>
              </ul>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #d97706;">Variant Performance</h3>
              <p><strong>Variant ${variant.toUpperCase()}</strong> - Track conversion rate and optimize accordingly</p>
              <p><em>This lead came from the AI Visibility Plan funnel targeting £200/month recurring revenue.</em></p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              <strong>AI Visibility Plan Funnel Lead</strong><br>
              Generated: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}<br>
              Source: Digital Visibility A/B Marketing Funnel
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send email' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const emailData = await response.json();

    // Return success with redirect URL for the appropriate variant thank you page
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead captured successfully',
        redirectUrl: `/funnel/${variant}/thank-you/`,
        id: emailData?.id 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Funnel lead capture error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
