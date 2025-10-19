import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  // Test Math.random() directly in the Cloudflare environment
  const results = [];

  for (let i = 0; i < 100; i++) {
    const random = Math.random();
    const variant = random < 0.5 ? 'a' : 'b';
    results.push({ random: random.toFixed(4), variant });
  }

  const counts = results.reduce((acc, r) => {
    acc[r.variant] = (acc[r.variant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Direct Math.random() test in Cloudflare environment',
      totalTests: 100,
      variantA: counts.a || 0,
      variantB: counts.b || 0,
      percentageA: `${((counts.a || 0) / 100 * 100).toFixed(1)}%`,
      percentageB: `${((counts.b || 0) / 100 * 100).toFixed(1)}%`,
      firstTen: results.slice(0, 10),
      diagnosis: (counts.b || 0) === 0
        ? 'ERROR: Math.random() broken in Cloudflare environment'
        : 'SUCCESS: Math.random() working correctly'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
