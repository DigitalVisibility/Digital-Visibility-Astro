import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // Test the funnel routing by making multiple requests
  const testResults = [];

  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch('https://digitalvisibility.com/funnel/', {
        redirect: 'manual', // Don't follow redirects
        headers: {
          'User-Agent': `Test-${i}`,
          // Don't send cookies to force new assignment
        }
      });

      const location = response.headers.get('Location');
      const setCookie = response.headers.get('Set-Cookie');

      testResults.push({
        test: i + 1,
        status: response.status,
        redirectTo: location,
        variant: location?.includes('/funnel/a/') ? 'A' :
                  location?.includes('/funnel/b/') ? 'B' :
                  'Unknown',
        cookieSet: !!setCookie
      });
    } catch (error) {
      testResults.push({
        test: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Count variants
  const variantCounts = testResults.reduce((acc, result) => {
    if (result.variant) {
      acc[result.variant] = (acc[result.variant] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Funnel routing test completed',
      timestamp: new Date().toISOString(),
      results: testResults,
      summary: {
        totalTests: testResults.length,
        variantCounts,
        distribution: {
          A: `${((variantCounts['A'] || 0) / testResults.length * 100).toFixed(1)}%`,
          B: `${((variantCounts['B'] || 0) / testResults.length * 100).toFixed(1)}%`
        }
      },
      diagnosis: variantCounts['B'] === 0 || variantCounts['B'] === undefined
        ? 'PROBLEM: All requests go to Variant A - function may be broken or falling back to error handler'
        : 'SUCCESS: Random distribution working correctly'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
