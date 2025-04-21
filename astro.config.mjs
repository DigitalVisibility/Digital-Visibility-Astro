import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({
    // Enable JIT mode for faster CSS
    mode: 'jit'
  })],
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
    assets: 'assets',
    // Inlining smaller assets reduces HTTP requests
    inlineStylesheets: 'auto'
  },
  // Script optimization to reduce render delay
  scripts: {
    allowInlineScripts: true,
    // Prevent hoisting which can cause render delays
    hoist: false
  },
  vite: {
    // Optimize build process
    build: {
      // Optimize for production
      minify: 'terser',
      // CSS code splitting can cause render delays, disable it
      cssCodeSplit: false,
      // External scripts that should not be processed
      rollupOptions: {
        external: [
          '/js/AnalyzerLead.js',
          '/js/lead-api.js'
        ],
        output: {
          // Create separate chunks for critical and non-critical JS
          manualChunks: {
            'critical': ['src/critical-path-components.js'],
            'vendor': ['lucide']
          }
        }
      }
    },
    // Optimize CSS
    css: {
      // Faster CSS processing
      postcss: {
        plugins: []
      }
    },
    // Reduce unnecessary processing
    optimizeDeps: {
      // Exclude scripts that don't need processing
      exclude: ['lucide']
    }
  }
});
