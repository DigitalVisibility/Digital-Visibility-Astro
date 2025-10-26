import type { MiddlewareHandler } from 'astro';

// Funnel A/B routing is handled by src/pages/funnel/index.astro (SSR)
// This middleware is a simple pass-through.
// Add any future middleware logic here if needed.

export const onRequest: MiddlewareHandler = async (context, next) => {
  return next();
};
