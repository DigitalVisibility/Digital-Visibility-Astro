import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📅 Booking API called');
    const bookingData = await request.json();
    console.log('📝 Booking data:', bookingData);

    const webhookUrl = import.meta.env.N8N_WEBHOOK_URL;
    console.log('🔗 Webhook URL present:', !!webhookUrl);
    
    if (!webhookUrl) {
      console.error('❌ No webhook URL configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Booking service not configured'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    const { name, email, phone, service, date, time } = bookingData;
    if (!name || !email || !phone) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required booking information'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call n8n webhook
    console.log('🚀 Calling n8n webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        company: bookingData.company || '',
        service_interest: service || 'General Consultation',
        preferred_date: date || '',
        preferred_time: time || '',
        notes: bookingData.notes || 'Booked via AI chat assistant'
      }),
    });

    console.log('📡 n8n response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ n8n webhook error:', errorText);
      throw new Error(`Webhook request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Booking successful:', result);

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: result.booking_id,
        message: result.message || 'Booking confirmed! Check your email.',
        details: result.details
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Booking error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process booking'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
