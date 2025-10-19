import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const resendApiKey = import.meta.env.RESEND_API_KEY;

    // Check if API key is configured
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'RESEND_API_KEY not configured in environment variables',
          configured: false
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Try to send a test email
    const testResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Test <noreply@updates.digitalvisibility.com>',
        to: ['support@digitalvisibility.com'],
        subject: 'Test Email - Funnel Email Debugging',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Test Email</h2>
            <p>This is a test email to verify Resend API is working correctly.</p>
            <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
            <p><strong>API Key exists:</strong> Yes (first 10 chars: ${resendApiKey.substring(0, 10)}...)</p>
          </div>
        `,
      }),
    });

    const responseText = await testResponse.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }

    if (testResponse.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test email sent successfully!',
          configured: true,
          apiKeyPrefix: resendApiKey.substring(0, 10) + '...',
          emailId: responseData.id,
          response: responseData
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Resend API returned an error',
          configured: true,
          apiKeyPrefix: resendApiKey.substring(0, 10) + '...',
          statusCode: testResponse.status,
          response: responseData,
          rawResponse: responseText
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
