// Cloudflare Pages Function for A/B Marketing Funnel
// Routes users to /funnel/a/ or /funnel/b/ with dynamic traffic splitting
// Sets persistent cookie for variant consistency
// Supports AI-driven traffic allocation via KV store

export async function onRequest(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);

    // Get existing variant from cookie header
    const cookieHeader = request.headers.get('Cookie') || '';
    const existingVariant = getCookieValue(cookieHeader, 'funnel_variant');

    let variant;

    if (existingVariant && (existingVariant === 'a' || existingVariant === 'b')) {
      // User already has a variant assigned, use it
      variant = existingVariant;
    } else {
      // New user - assign variant based on traffic allocation
      variant = await getVariantAssignment(context);
    }

    // Track variant assignment in analytics (non-blocking)
    trackVariantAssignment(variant, context).catch(err =>
      console.error('Error tracking variant:', err)
    );

    // Redirect to appropriate variant
    const redirectUrl = new URL(`/funnel/${variant}/`, url.origin);

    // Add utm parameters if present
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmParams.forEach(param => {
      if (url.searchParams.has(param)) {
        redirectUrl.searchParams.set(param, url.searchParams.get(param));
      }
    });

    // Create redirect response with cookie
    const response = Response.redirect(redirectUrl.toString(), 302);

    // Set cookie if new variant was assigned
    if (!existingVariant) {
      const cookieValue = `funnel_variant=${variant}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      response.headers.set('Set-Cookie', cookieValue);
    }

    return response;
  } catch (error) {
    console.error('ERROR in funnel function - falling back to A:', error);
    console.error('Error stack:', error.stack);
    // Fallback: redirect to variant A on error
    const fallbackUrl = new URL('/funnel/a/', new URL(context.request.url).origin);
    return Response.redirect(fallbackUrl.toString(), 302);
  }
}

// Helper function to parse cookie value from header
function getCookieValue(cookieHeader, name) {
  const match = cookieHeader.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

async function getVariantAssignment(context) {
  try {
    // Try to get traffic allocation from KV store
    const trafficConfig = await context.env.FUNNEL_DATA?.get('funnel:traffic_config');

    if (trafficConfig) {
      const config = JSON.parse(trafficConfig);
      const random = Math.random();

      console.log('Using KV traffic config:', config, 'random:', random);

      // Use AI-optimized traffic allocation
      if (random < config.variantAWeight) {
        return 'a';
      } else {
        return 'b';
      }
    }
  } catch (error) {
    console.error('Error getting traffic config:', error);
  }

  // Fallback to 50/50 split
  const random = Math.random();
  const variant = random < 0.5 ? 'a' : 'b';
  console.log('Using fallback 50/50 split - random:', random, 'variant:', variant);
  return variant;
}

async function trackVariantAssignment(variant, context) {
  try {
    // Store assignment data for analytics
    const assignment = {
      variant,
      timestamp: new Date().toISOString(),
      userAgent: context.request.headers.get('user-agent'),
      referer: context.request.headers.get('referer')
    };
    
    // Store in KV for analysis (optional)
    await context.env.FUNNEL_DATA?.put(
      `funnel:assignment:${Date.now()}`,
      JSON.stringify(assignment),
      { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
    );
  } catch (error) {
    console.error('Error tracking variant assignment:', error);
  }
}

// Future AI Agent Hooks:
// 1. Replace Math.random() with weighted distribution from KV store
// 2. Add conversion tracking to KV store for automatic weight adjustment
// 3. Implement dynamic CTA/copy updates based on performance data
// 4. Add Clarity API integration for real-time optimization
// 
// Example KV integration:
// const weights = await context.env.FUNNEL_KV.get('variant_weights');
// const parsedWeights = weights ? JSON.parse(weights) : { a: 0.5, b: 0.5 };
// variant = Math.random() < parsedWeights.a ? 'a' : 'b';
