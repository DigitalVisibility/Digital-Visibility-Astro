import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const results = {
    testRuns: 100,
    variantA: 0,
    variantB: 0,
    randomSamples: [] as number[],
    assignments: [] as string[],
    cookieCheck: null as string | null,
    kvConfigCheck: null as any
  };

  // Check for existing cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const existingVariant = cookieHeader
    .split('; ')
    .find(row => row.startsWith('funnel_variant='))
    ?.split('=')[1];

  results.cookieCheck = existingVariant || 'No cookie found';

  // Check KV config
  try {
    const trafficConfig = await locals.runtime?.env?.FUNNEL_DATA?.get('funnel:traffic_config');
    if (trafficConfig) {
      results.kvConfigCheck = JSON.parse(trafficConfig);
    } else {
      results.kvConfigCheck = 'No KV config - using default 50/50';
    }
  } catch (error) {
    results.kvConfigCheck = `Error reading KV: ${error instanceof Error ? error.message : 'Unknown'}`;
  }

  // Simulate 100 random assignments
  for (let i = 0; i < results.testRuns; i++) {
    const random = Math.random();
    const variant = random < 0.5 ? 'a' : 'b';

    if (i < 10) {
      results.randomSamples.push(parseFloat(random.toFixed(4)));
      results.assignments.push(variant);
    }

    if (variant === 'a') {
      results.variantA++;
    } else {
      results.variantB++;
    }
  }

  const percentageA = (results.variantA / results.testRuns * 100).toFixed(1);
  const percentageB = (results.variantB / results.testRuns * 100).toFixed(1);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Funnel split test completed',
      results: {
        totalTests: results.testRuns,
        variantACount: results.variantA,
        variantBCount: results.variantB,
        percentageA: `${percentageA}%`,
        percentageB: `${percentageB}%`,
        isBalanced: Math.abs(results.variantA - results.variantB) <= 10,
        firstTenSamples: results.randomSamples.map((rand, idx) => ({
          random: rand,
          assigned: results.assignments[idx]
        })),
        yourCurrentCookie: results.cookieCheck,
        kvTrafficConfig: results.kvConfigCheck
      },
      diagnosis: {
        mathRandomWorking: results.variantA > 0 && results.variantB > 0,
        suggestedIssue: results.variantB === 0
          ? 'Math.random() always returns < 0.5 OR function has error'
          : results.cookieCheck !== 'No cookie found'
          ? `You have a cookie locking you to variant ${existingVariant}`
          : 'Split appears to be working - issue may be elsewhere'
      }
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
