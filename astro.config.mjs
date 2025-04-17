import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: cloudflare(),
  // This ensures URLs match your current structure
  trailingSlash: 'always',
  build: {
    format: 'directory',
    assets: 'assets'
  },
  // Allow scripts to use the is:inline directive
  scripts: {
    allowInlineScripts: true
  },
  vite: {
    build: {
      // Prevent bundling these files
      assetsInlineLimit: 0,
      rollupOptions: {
        external: [
          '/js/AnalyzerLead.js',
          '/js/lead-api.js'
        ]
      }
    }
  }
});
