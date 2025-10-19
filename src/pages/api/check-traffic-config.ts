import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Try to get traffic config from KV
    const trafficConfig = await locals.runtime?.env?.FUNNEL_DATA?.get('funnel:traffic_config');

    if (trafficConfig) {
      const config = JSON.parse(trafficConfig);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Traffic config found in KV',
          config: config,
          explanation: {
            variantAWeight: config.variantAWeight,
            variantBWeight: 1 - config.variantAWeight,
            percentageA: `${(config.variantAWeight * 100).toFixed(1)}%`,
            percentageB: `${((1 - config.variantAWeight) * 100).toFixed(1)}%`,
            isBalanced: config.variantAWeight === 0.5
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No traffic config found - using default 50/50 split',
          config: null,
          explanation: {
            variantAWeight: 0.5,
            variantBWeight: 0.5,
            percentageA: '50%',
            percentageB: '50%',
            isBalanced: true
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error checking traffic config'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { variantAWeight } = body;

    // Validate weight
    if (typeof variantAWeight !== 'number' || variantAWeight < 0 || variantAWeight > 1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'variantAWeight must be a number between 0 and 1'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update traffic config in KV
    const newConfig = {
      variantAWeight: variantAWeight,
      lastUpdated: new Date().toISOString()
    };

    await locals.runtime?.env?.FUNNEL_DATA?.put(
      'funnel:traffic_config',
      JSON.stringify(newConfig)
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Traffic config updated',
        config: newConfig,
        explanation: {
          variantAWeight: variantAWeight,
          variantBWeight: 1 - variantAWeight,
          percentageA: `${(variantAWeight * 100).toFixed(1)}%`,
          percentageB: `${((1 - variantAWeight) * 100).toFixed(1)}%`,
          isBalanced: variantAWeight === 0.5
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
