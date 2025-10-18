import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, platform }) => {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify Basic Auth (simplified - in production use proper auth middleware)
    const credentials = atob(authHeader.split(' ')[1]);
    const [username, password] = credentials.split(':');
    
    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_USER) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get latest funnel data
    const funnelData = await platform?.env?.FUNNEL_DATA?.get('funnel:live');
    if (!funnelData) {
      return new Response(
        JSON.stringify({ success: false, error: 'No funnel data available' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = JSON.parse(funnelData);
    
    // Generate new AI recommendations
    const recommendations = await generateClaudeRecommendations(data, platform?.env);
    
    if (!recommendations) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate recommendations' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('AI advice API error:', error);
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

async function generateClaudeRecommendations(data, env) {
  const CLAUDE_API_KEY = env?.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    throw new Error('Claude API key not configured');
  }

    const prompt = `Analyze this A/B test data for an AI Visibility Plan funnel and provide three clear, actionable CRO recommendations. Focus on copy, layout, CTA clarity, and conversion psychology. Avoid code suggestions.

Data:
- Variant A: ${data.variants.A.visitors} visitors, ${data.variants.A.conversions} conversions (${(data.variants.A.conversionRate * 100).toFixed(1)}% CR), £${data.variants.A.revenue} revenue
- Variant B: ${data.variants.B.visitors} visitors, ${data.variants.B.conversions} conversions (${(data.variants.B.conversionRate * 100).toFixed(1)}% CR), £${data.variants.B.revenue} revenue
- Winner: Variant ${data.summary.winner} (${data.summary.improvement} improvement)
- Confidence: ${data.summary.confidenceLevel.toFixed(1)}%
- Engagement: ${data.engagement?.averageSessionDuration || 0}s avg session, ${((data.engagement?.bounceRate || 0) * 100).toFixed(1)}% bounce rate

Enhanced Engagement Data:
- Variant A Section Reach: ${JSON.stringify(data.variants.A.engagement?.section_reach || {})}
- Variant B Section Reach: ${JSON.stringify(data.variants.B.engagement?.section_reach || {})}
- Variant A Section Time: ${JSON.stringify(data.variants.A.engagement?.section_time_ms_avg || {})}
- Variant B Section Time: ${JSON.stringify(data.variants.B.engagement?.section_time_ms_avg || {})}
- Variant A Rage Clicks: ${JSON.stringify(data.variants.A.engagement?.rage || {})}
- Variant B Rage Clicks: ${JSON.stringify(data.variants.B.engagement?.rage || {})}
- Variant A Form Stats: ${JSON.stringify(data.variants.A.engagement?.form || {})}
- Variant B Form Stats: ${JSON.stringify(data.variants.B.engagement?.form || {})}
- Variant A Scroll Milestones: ${JSON.stringify(data.variants.A.engagement?.scroll_milestones || {})}
- Variant B Scroll Milestones: ${JSON.stringify(data.variants.B.engagement?.scroll_milestones || {})}

Respond with JSON format:
{
  "recommendations": [
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps", "affected_atoms": ["headline", "cta", "form_position"]},
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps", "affected_atoms": ["headline", "cta", "form_position"]},
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps", "affected_atoms": ["headline", "cta", "form_position"]}
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const result = await response.json();
    const aiAdvice = {
      timestamp: new Date().toISOString(),
      data: result.content[0].text,
      processed: true
    };

    // Store AI recommendations in KV
    if (env?.FUNNEL_DATA) {
      await env.FUNNEL_DATA.put(
        `funnel:ai_advice:${Date.now()}`,
        JSON.stringify(aiAdvice),
        { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
      );

      await env.FUNNEL_DATA.put(
        'funnel:ai_advice:latest',
        JSON.stringify(aiAdvice),
        { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
      );
    }

    // Parse and return recommendations
    try {
      const parsed = JSON.parse(result.content[0].text);
      return parsed.recommendations || [];
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return [{
        priority: 'Medium',
        suggestion: 'AI analysis completed - check dashboard for details',
        rationale: 'Claude provided analysis but response format needs review'
      }];
    }

  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}
