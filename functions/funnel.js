// Cloudflare Pages Function for A/B Marketing Funnel
// Routes users to /funnel/a/ or /funnel/b/ with dynamic traffic splitting
// Sets persistent cookie for variant consistency
// Supports AI-driven traffic allocation via KV store

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Check if user already has a variant cookie
  const existingVariant = context.cookies.get('funnel_variant')?.value;
  
  let variant;
  
  if (existingVariant && (existingVariant === 'a' || existingVariant === 'b')) {
    // User already has a variant assigned, use it
    variant = existingVariant;
  } else {
    // New user - assign variant based on traffic allocation
    variant = await getVariantAssignment(context);
    
    // Set cookie for 30 days to maintain consistency
    context.cookies.set('funnel_variant', variant, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Allow JavaScript access for analytics
      secure: true,
      sameSite: 'Lax'
    });
  }
  
  // Track variant assignment in analytics
  await trackVariantAssignment(variant, context);
  
  // Redirect to appropriate variant
  const redirectUrl = new URL(`/funnel/${variant}/`, url.origin);
  
  // Add utm parameters if present
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utmParams.forEach(param => {
    if (url.searchParams.has(param)) {
      redirectUrl.searchParams.set(param, url.searchParams.get(param));
    }
  });
  
  return Response.redirect(redirectUrl.toString(), 302);
}

async function getVariantAssignment(context) {
  try {
    // Try to get traffic allocation from KV store
    const trafficConfig = await context.env.FUNNEL_DATA?.get('funnel:traffic_config');
    
    if (trafficConfig) {
      const config = JSON.parse(trafficConfig);
      const random = Math.random();
      
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
  return Math.random() < 0.5 ? 'a' : 'b';
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
