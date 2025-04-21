import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({
    // Enable JIT mode for faster CSS
    mode: 'jit',
    // Minimize CSS size
    minify: true
  })],
  output: 'static',
  // No adapter needed for static sites
  // This ensures URLs match your current structure
  trailingSlash: 'always',
  // Enable built-in image optimization
  image: {
    // No need to specify service for Astro 3.x which uses Sharp by default
    // when available in node_modules
  },
  build: {
    format: 'directory',
    assets: 'assets',
    // Extract inlined critical CSS
    inlineStylesheets: 'auto'
  },
  // Allow scripts to use the is:inline directive
  scripts: {
    allowInlineScripts: true
  },
  vite: {
    // Optimize CSS processing
    css: {
      devSourcemap: false,
      postcss: {
        plugins: []
      }
    },
    // Optimize JS bundling
    build: {
      // Prevent bundling these files
      assetsInlineLimit: 0,
      // Improve chunking
      cssCodeSplit: true,
      // Minimize JS
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          passes: 2
        }
      },
      rollupOptions: {
        output: {
          // Reduce chunk sizes
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        },
        external: [
          '/js/AnalyzerLead.js',
          '/js/lead-api.js'
        ]
      }
    }
  }
});
