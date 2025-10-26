import type { MiddlewareHandler } from 'astro';

// Note: Funnel A/B routing and admin authentication are now handled by
// Cloudflare Pages Functions middleware at /functions/_middleware.js
// This runs at runtime on the edge, not at build time.

export const onRequest: MiddlewareHandler = async (context, next) => {
  // All middleware logic has been moved to /functions/_middleware.js
  // to run at runtime on Cloudflare Pages edge
  return next();
};
