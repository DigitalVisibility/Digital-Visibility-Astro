// Cloudflare Worker for scheduled data aggregation
// Runs every 12 hours to pull GA4 & Clarity data and store in KV

export default {
  async scheduled(event, env, ctx) {
    console.log('Starting funnel data aggregation...');
    
    try {
      // Fetch data from both sources
      const [ga4Data, clarityData] = await Promise.all([
        fetchGA4Data(env),
        fetchClarityData(env)
      ]);
      
      // Process and aggregate data
      const aggregatedData = await processFunnelData(ga4Data, clarityData, env);
      
      // Store in KV
      await storeFunnelData(aggregatedData, env);
      
      // Generate AI recommendations
      await generateAIRecommendations(aggregatedData, env);
      
      console.log('Funnel data aggregation completed successfully');
      
    } catch (error) {
      console.error('Funnel data aggregation failed:', error);
      // Send alert to admin (implement notification system)
    }
  }
};

async function fetchGA4Data(env) {
  const GA4_ID = env.GA4_ID;
  if (!GA4_ID) {
    throw new Error('GA4_ID not configured');
  }
  
  // TODO: Implement real GA4 Reporting API v1 integration
  // This is a placeholder - you need to implement actual GA4 API calls
  console.log('GA4 API integration not implemented yet');
  
  return {
    date: new Date().toISOString().split('T')[0],
    variants: {
      A: {
        visitors: 0,
        conversions: 0,
        pageviews: 0
      },
      B: {
        visitors: 0,
        conversions: 0,
        pageviews: 0
      }
    },
    total: {
      visitors: 0,
      conversions: 0,
      pageviews: 0
    }
  };
}

async function fetchClarityData(env) {
  const CLARITY_ID = env.CLARITY_ID;
  if (!CLARITY_ID) {
    throw new Error('CLARITY_ID not configured');
  }
  
  // TODO: Implement real Clarity Export API integration
  // This is a placeholder - you need to implement actual Clarity API calls
  console.log('Clarity API integration not implemented yet');
  
  return {
    date: new Date().toISOString().split('T')[0],
    engagement: {
      averageSessionDuration: 0,
      bounceRate: 0,
      rageClicks: 0,
      scrollDepth: 0
    },
    heatmap: {
      ctaClicks: 0,
      formInteractions: 0
    }
  };
}

async function processFunnelData(ga4Data, clarityData, env) {
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate conversion rates
  const variantA = {
    ...ga4Data.variants.A,
    conversionRate: ga4Data.variants.A.visitors > 0 ? 
      (ga4Data.variants.A.conversions / ga4Data.variants.A.visitors) : 0,
    revenue: ga4Data.variants.A.conversions * 200 // £200 per conversion
  };
  
  const variantB = {
    ...ga4Data.variants.B,
    conversionRate: ga4Data.variants.B.visitors > 0 ? 
      (ga4Data.variants.B.conversions / ga4Data.variants.B.visitors) : 0,
    revenue: ga4Data.variants.B.conversions * 200 // £200 per conversion
  };
  
  // Calculate total metrics
  const totalVisitors = variantA.visitors + variantB.visitors;
  const totalConversions = variantA.conversions + variantB.conversions;
  const totalRevenue = variantA.revenue + variantB.revenue;
  
  // Calculate statistical significance
  const confidence = calculateConfidence(variantA, variantB);
  
  // Determine winner
  const winner = variantB.conversionRate > variantA.conversionRate ? 'B' : 'A';
  const improvement = winner === 'B' ? 
    ((variantB.conversionRate - variantA.conversionRate) / variantA.conversionRate * 100) :
    ((variantA.conversionRate - variantB.conversionRate) / variantB.conversionRate * 100);
  
  return {
    date: today,
    summary: {
      totalVisitors,
      totalConversions,
      totalRevenue,
      overallConversionRate: totalVisitors > 0 ? (totalConversions / totalVisitors) : 0,
      testDuration: 7, // Calculate actual duration
      confidenceLevel: confidence,
      winner,
      improvement: `+${improvement.toFixed(1)}%`
    },
    variants: {
      A: variantA,
      B: variantB
    },
    engagement: clarityData.engagement,
    heatmap: clarityData.heatmap,
    lastUpdated: new Date().toISOString()
  };
}

function calculateConfidence(variantA, variantB) {
  // Simplified confidence calculation
  // In production, implement proper statistical significance testing
  const n1 = variantA.visitors;
  const n2 = variantB.visitors;
  const x1 = variantA.conversions;
  const x2 = variantB.conversions;
  
  if (n1 < 30 || n2 < 30) return 0; // Not enough data
  
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const pooledP = (x1 + x2) / (n1 + n2);
  
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  const z = Math.abs(p1 - p2) / se;
  
  // Convert z-score to confidence percentage
  return Math.min(99.9, Math.max(0, (1 - 2 * (1 - normalCDF(z))) * 100));
}

function normalCDF(x) {
  // Approximation of normal CDF
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function erf(x) {
  // Approximation of error function
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}

async function storeFunnelData(data, env) {
  const today = data.date;
  
  // Store daily data
  await env.FUNNEL_DATA.put(
    `funnel:daily:${today}`,
    JSON.stringify(data),
    { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
  );
  
  // Update live data
  await env.FUNNEL_DATA.put(
    'funnel:live',
    JSON.stringify(data),
    { expirationTtl: 60 * 60 * 12 } // 12 hours
  );
  
  // Store historical summary
  const historicalKey = `funnel:summary:${today}`;
  const summary = {
    date: today,
    totalVisitors: data.summary.totalVisitors,
    totalConversions: data.summary.totalConversions,
    totalRevenue: data.summary.totalRevenue,
    winner: data.summary.winner,
    confidence: data.summary.confidenceLevel
  };
  
  await env.FUNNEL_DATA.put(
    historicalKey,
    JSON.stringify(summary),
    { expirationTtl: 60 * 60 * 24 * 90 } // 90 days
  );
}

async function generateAIRecommendations(data, env) {
  const CLAUDE_API_KEY = env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    console.log('Claude API key not configured, skipping AI recommendations');
    return;
  }
  
  try {
    const prompt = `Analyze this A/B test data for an AI Visibility Plan funnel and provide three clear, actionable CRO recommendations. Focus on copy, layout, CTA clarity, and conversion psychology. Avoid code suggestions.

Data:
- Variant A: ${data.variants.A.visitors} visitors, ${data.variants.A.conversions} conversions (${(data.variants.A.conversionRate * 100).toFixed(1)}% CR)
- Variant B: ${data.variants.B.visitors} visitors, ${data.variants.B.conversions} conversions (${(data.variants.B.conversionRate * 100).toFixed(1)}% CR)
- Winner: Variant ${data.summary.winner} (${data.summary.improvement} improvement)
- Confidence: ${data.summary.confidenceLevel.toFixed(1)}%
- Engagement: ${data.engagement.averageSessionDuration}s avg session, ${(data.engagement.bounceRate * 100).toFixed(1)}% bounce rate

Respond with JSON format:
{
  "recommendations": [
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps"},
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps"},
    {"priority": "High/Medium/Low", "suggestion": "actionable advice", "rationale": "why this helps"}
  ]
}`;

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

    // Store AI recommendations
    await env.FUNNEL_DATA.put(
      `funnel:ai_advice:${Date.now()}`,
      JSON.stringify(aiAdvice),
      { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
    );

    // Store latest advice
    await env.FUNNEL_DATA.put(
      'funnel:ai_advice:latest',
      JSON.stringify(aiAdvice),
      { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
    );

    console.log('AI recommendations generated successfully');

  } catch (error) {
    console.error('Failed to generate AI recommendations:', error);
  }
}
