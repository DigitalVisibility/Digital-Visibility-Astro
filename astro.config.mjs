import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      // Enable JIT mode for faster CSS
      mode: 'jit'
    }),
    react()
  ],
  output: 'static',
  trailingSlash: 'always',
  // Enable built-in image optimization for static sites
  image: {
    // Default service works with static sites
    service: {
      entrypoint: 'astro/assets/services/sharp',
    }
  },
  build: {
    // Basic build settings
    assets: 'assets'
  },
  // Allow scripts to use the is:inline directive
  scripts: {
    allowInlineScripts: true
  },
  vite: {
    // External scripts that should not be processed
    build: {
      rollupOptions: {
        external: [
          '/js/AnalyzerLead.js',
          '/js/lead-api.js'
        ]
      }
    }
  }
});
