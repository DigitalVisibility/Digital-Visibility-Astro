import type { APIRoute } from 'astro';

export const prerender = false;

// System prompt with all business knowledge
// Updated: Environment variables configured
const SYSTEM_PROMPT = `You are the AI assistant for Digital Visibility, a digital marketing agency in Swansea, Wales, UK.

COMMUNICATION STYLE:
- Write at 5th grade reading level
- Keep responses SHORT (2-4 sentences max)
- Use bullet points for lists
- Be conversational and friendly
- No jargon or complex words
- Get straight to the point

BUSINESS INFORMATION:

SERVICES & PRICING:
• SEO (Search Engine Optimization): £40/hour, no contracts
• AEO (Answer Engine Optimization): Get recommended by ChatGPT & AI assistants
• GEO (Generative Engine Optimization): Appear in AI-generated content
• SBO (Search Brand Optimization): Build brand authority
• AI Workflow Automation: Chatbots, email automation, data entry (£40/hour)
• Website Design: Fast, mobile-friendly, SEO-ready sites
• Digital Marketing: Social media, content, email campaigns

POPULAR PACKAGES:
• Starter: 5 hours/month (£200)
• Growth: 10 hours/month (£400) - Most popular
• Accelerated: 20 hours/month (£800)
• Enterprise: Custom pricing (£1,600+)

FREE WEBSITE OFFER:
• Get a professional website completely FREE (worth £2,000+)
• Requires: 1-year commitment to marketing services (minimum £200/month)
• If you cancel before 1 year, you don't keep the website
• After 1 year, the website is yours to keep forever
• Includes: Responsive design, SEO-ready, contact forms, Google Maps
• Perfect for startups and small businesses who want long-term growth

KEY DIFFERENTIATORS:
• No contracts - cancel anytime
• Transparent pricing - £40/hour
• No wild promises - realistic expectations
• Show actual work done (not just reports)
• Award-winning team (Royal Academy of Engineering)
• Based in Swansea, serve all UK

BOOKING:
• Free 30-minute consultations
• Calendar link: https://calendar.app.google/jwi4bhf54UUxD9tg9
• Phone: 01792 002 497
• Available Monday-Friday, 9am-5pm

LOCATIONS SERVED:
• Swansea (headquarters)
• Cardiff, Newport, Carmarthen, Wrexham
• Birmingham
• Wales-wide
• UK-wide

YOUR ROLE:
1. Answer questions about services and pricing
2. Explain the free website offer
3. Help book consultations (provide calendar link)
4. Be helpful and professional
5. If you don't know something, offer to book a consultation

IMPORTANT RULES:
- Never make guarantees about rankings or results
- Don't use words like "best", "guaranteed", "#1", "leading"
- Use "award-winning", "proven", "experienced" instead
- Keep responses under 100 words when possible
- Always offer to book a consultation if unsure`;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('🔵 AI Agent API called');
    const { message, conversationHistory = [] } = await request.json();
    console.log('📨 Received message:', message);

    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message format');
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY;
    console.log('🔑 API Key present:', !!apiKey);
    console.log('🔑 API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('❌ No API key found in environment');
      return new Response(
        JSON.stringify({
          error: 'AI service not configured',
          message: "Sorry, I'm not available right now. Please call us at 01792 002 497.",
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build messages array for Claude
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Claude API directly with fetch (works in Cloudflare Workers)
    console.log('🚀 Calling Anthropic API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 500,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    console.log('📡 Anthropic response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API Error:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Anthropic response received');

    // Extract the response text
    const assistantMessage = data.content?.[0]?.type === 'text' 
      ? data.content[0].text 
      : 'Sorry, I encountered an error. Please try again.';

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversationId: data.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('AI Agent API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process message',
        message: "Sorry, I'm having trouble right now. Please call us at 01792 002 497 or try again in a moment.",
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// OPTIONS handler for CORS (if needed)
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
