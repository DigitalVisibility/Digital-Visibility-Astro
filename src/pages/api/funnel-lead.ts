import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const resendApiKey = import.meta.env.RESEND_API_KEY;

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

    // Store lead data in KV as backup (even if email fails)
    const leadData = {
      name,
      email,
      website,
      variant,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    };

    // Try to store in Cloudflare KV (available in production)
    let kvStorageSuccess = false;
    console.log('[KV DEBUG] Starting KV storage attempt');
    console.log('[KV DEBUG] locals exists:', !!locals);
    console.log('[KV DEBUG] locals.runtime exists:', !!locals.runtime);
    console.log('[KV DEBUG] locals.runtime.env exists:', !!locals.runtime?.env);
    console.log('[KV DEBUG] FUNNEL_DATA binding exists:', !!locals.runtime?.env?.FUNNEL_DATA);

    try {
      if (locals.runtime?.env?.FUNNEL_DATA) {
        const kvKey = `funnel:lead:${Date.now()}:${email}`;
        console.log('[KV DEBUG] Attempting to write to key:', kvKey);

        await locals.runtime.env.FUNNEL_DATA.put(
          kvKey,
          JSON.stringify(leadData),
          { expirationTtl: 60 * 60 * 24 * 90 } // 90 days
        );

        kvStorageSuccess = true;
        console.log('[KV SUCCESS] Lead stored in KV successfully, key:', kvKey);

        // Verify by reading back
        const verifyRead = await locals.runtime.env.FUNNEL_DATA.get(kvKey);
        console.log('[KV DEBUG] Verification read:', verifyRead ? 'SUCCESS' : 'FAILED');
      } else {
        console.error('[KV ERROR] FUNNEL_DATA binding not available!');
        console.error('[KV ERROR] Available env keys:', locals.runtime?.env ? Object.keys(locals.runtime.env) : 'env not available');
      }
    } catch (kvError) {
      console.error('[KV ERROR] KV storage error (non-critical):', kvError);
      console.error('[KV ERROR] Error details:', JSON.stringify(kvError, Object.getOwnPropertyNames(kvError)));
    }

    // Send emails using Resend API if configured
    let emailSent = false;
    let emailId = null;

    if (resendApiKey) {
      try {
        // Send notification email to you (support@digitalvisibility.com)
        const notificationResponse = await fetch('https://api.resend.com/emails', {
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

        // Send confirmation email to the customer
        const customerResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Digital Visibility <hello@updates.digitalvisibility.com>',
            to: [email],
            reply_to: 'support@digitalvisibility.com',
            subject: '🎉 Your Free AI Optimization Audit is Being Prepared!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Thank You, ${name}!</h1>

                <p style="font-size: 16px; color: #1f2937;">
                  We've received your request for a <strong>Free AI Optimization Audit</strong> for ${website}.
                </p>

                <div style="background: #dcfce7; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #16a34a;">
                  <h2 style="margin-top: 0; color: #15803d;">📅 Book Your FREE 30-Minute Discovery Call</h2>
                  <p style="color: #1f2937; font-size: 16px; margin: 15px 0;">
                    Want to fast-track your results? Book a time that works for you and we'll walk through your audit live, answer your questions, and create a custom AI optimization roadmap.
                  </p>
                  <a href="https://calendar.app.google/jwi4bhf54UUxD9tg9"
                     style="display: inline-block; background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px 0;">
                    Book Your Discovery Call Now →
                  </a>
                  <p style="color: #6b7280; font-size: 13px; margin-top: 10px;">
                    No obligation • No pressure • Just valuable insights
                  </p>
                </div>

                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                  <h2 style="margin-top: 0; color: #1e40af;">What Happens Next?</h2>
                  <ol style="color: #1f2937; line-height: 1.8;">
                    <li><strong>Within 24 hours:</strong> We'll analyze your website and prepare your personalized AI Optimization Audit</li>
                    <li><strong>AI Discoverability Report:</strong> You'll receive a detailed report showing how your site currently performs on ChatGPT, Bing AI, and Google AI</li>
                    <li><strong>Custom Recommendations:</strong> We'll provide specific actions to get your website recommended by AI platforms</li>
                    <li><strong>Discovery Call (Optional):</strong> Book a time above or we'll follow up to schedule a call to discuss your strategy</li>
                  </ol>
                </div>

                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #059669;">🚀 What Makes AI Optimization Different?</h3>
                  <p style="color: #1f2937;">
                    Traditional SEO focuses on ranking in search results. <strong>AI Optimization</strong> ensures your business
                    is recommended when people ask ChatGPT, Bing, Claude, or Google AI for help in your industry.
                  </p>
                </div>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #78350f;">
                    <strong>💡 Quick Tip:</strong> While you wait, think about the questions your ideal customers ask.
                    We'll show you how to make sure AI recommends YOUR business when people ask those questions.
                  </p>
                </div>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                <p style="color: #6b7280; font-size: 14px;">
                  <strong>Questions?</strong> Reply to this email or call us at <a href="tel:+441792002497" style="color: #2563eb;">01792 002 497</a>
                </p>

                <p style="color: #6b7280; font-size: 14px;">
                  Best regards,<br>
                  <strong>The Digital Visibility Team</strong><br>
                  <a href="https://digitalvisibility.com" style="color: #2563eb;">digitalvisibility.com</a>
                </p>
              </div>
            `,
          }),
        });

        // Check if both emails were sent successfully
        if (notificationResponse.ok && customerResponse.ok) {
          const emailData = await notificationResponse.json();
          emailSent = true;
          emailId = emailData?.id;
          console.log('Both notification and customer emails sent successfully');
        } else {
          if (!notificationResponse.ok) {
            const errorText = await notificationResponse.text();
            console.error('Notification email error:', errorText);
          }
          if (!customerResponse.ok) {
            const errorText = await customerResponse.text();
            console.error('Customer email error:', errorText);
          }
        }
      } catch (emailError) {
        console.error('Email sending error (non-critical):', emailError);
      }
    } else {
      console.warn('RESEND_API_KEY not configured - email not sent, but lead saved to KV');
    }

    // Return success with redirect URL - success even if email fails (lead is in KV)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead captured successfully',
        redirectUrl: `/funnel/${variant}/thank-you/`,
        id: emailId,
        emailSent,
        storedInKV: kvStorageSuccess
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
