import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  };

  // Test 1: Check if locals exists
  diagnostics.tests.push({
    test: 'locals exists',
    result: !!locals,
    value: typeof locals
  });

  // Test 2: Check if runtime exists
  diagnostics.tests.push({
    test: 'locals.runtime exists',
    result: !!locals.runtime,
    value: typeof locals.runtime
  });

  // Test 3: Check if env exists
  diagnostics.tests.push({
    test: 'locals.runtime.env exists',
    result: !!locals.runtime?.env,
    value: typeof locals.runtime?.env
  });

  // Test 4: Check if FUNNEL_DATA exists
  diagnostics.tests.push({
    test: 'locals.runtime.env.FUNNEL_DATA exists',
    result: !!locals.runtime?.env?.FUNNEL_DATA,
    value: typeof locals.runtime?.env?.FUNNEL_DATA
  });

  // Test 5: List all available env keys
  if (locals.runtime?.env) {
    diagnostics.tests.push({
      test: 'Available env keys',
      result: true,
      value: Object.keys(locals.runtime.env)
    });
  }

  // Test 6: Try to write a test entry to KV
  let writeSuccess = false;
  let writeError = null;

  try {
    if (locals.runtime?.env?.FUNNEL_DATA) {
      const testKey = `test:${Date.now()}`;
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'This is a test entry'
      };

      await locals.runtime.env.FUNNEL_DATA.put(
        testKey,
        JSON.stringify(testData),
        { expirationTtl: 60 * 5 } // 5 minutes
      );

      writeSuccess = true;

      // Test 7: Try to read it back
      const readBack = await locals.runtime.env.FUNNEL_DATA.get(testKey);
      diagnostics.tests.push({
        test: 'Write to KV',
        result: true,
        key: testKey,
        written: testData,
        readBack: readBack ? JSON.parse(readBack) : null
      });

    } else {
      diagnostics.tests.push({
        test: 'Write to KV',
        result: false,
        error: 'FUNNEL_DATA binding not available'
      });
    }
  } catch (error: any) {
    writeError = error.message;
    diagnostics.tests.push({
      test: 'Write to KV',
      result: false,
      error: error.message,
      stack: error.stack
    });
  }

  // Test 8: List existing funnel:lead: keys
  try {
    if (locals.runtime?.env?.FUNNEL_DATA) {
      const leadList = await locals.runtime.env.FUNNEL_DATA.list({
        prefix: 'funnel:lead:',
        limit: 10
      });

      diagnostics.tests.push({
        test: 'List funnel:lead: keys',
        result: true,
        count: leadList.keys.length,
        keys: leadList.keys.map((k: any) => k.name)
      });
    }
  } catch (error: any) {
    diagnostics.tests.push({
      test: 'List funnel:lead: keys',
      result: false,
      error: error.message
    });
  }

  // Test 9: Check environment variables
  diagnostics.tests.push({
    test: 'Environment variables',
    result: true,
    RESEND_API_KEY: !!import.meta.env.RESEND_API_KEY ? 'SET' : 'NOT SET',
    ADMIN_USER: !!import.meta.env.ADMIN_USER ? 'SET' : 'NOT SET',
    ADMIN_PASS: !!import.meta.env.ADMIN_PASS ? 'SET' : 'NOT SET'
  });

  return new Response(
    JSON.stringify(diagnostics, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.formData();
    const testName = data.get('name') || 'Test User';
    const testEmail = data.get('email') || 'test@example.com';

    const result = {
      timestamp: new Date().toISOString(),
      input: { testName, testEmail },
      kvAvailable: !!locals.runtime?.env?.FUNNEL_DATA,
      writeAttempted: false,
      writeSuccess: false,
      error: null as any
    };

    if (locals.runtime?.env?.FUNNEL_DATA) {
      result.writeAttempted = true;

      const leadData = {
        name: testName,
        email: testEmail,
        variant: 'test',
        timestamp: new Date().toISOString(),
        testEntry: true
      };

      const key = `funnel:lead:${Date.now()}:${testEmail}`;

      await locals.runtime.env.FUNNEL_DATA.put(
        key,
        JSON.stringify(leadData),
        { expirationTtl: 60 * 60 * 24 * 90 }
      );

      result.writeSuccess = true;

      // Verify by reading back
      const readBack = await locals.runtime.env.FUNNEL_DATA.get(key);

      return new Response(
        JSON.stringify({
          ...result,
          key,
          written: leadData,
          readBack: readBack ? JSON.parse(readBack) : null
        }, null, 2),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      result.error = 'FUNNEL_DATA binding not available';
      return new Response(
        JSON.stringify(result, null, 2),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
