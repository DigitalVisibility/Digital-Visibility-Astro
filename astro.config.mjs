import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import cssnano from 'cssnano';

// https://astro.build/config
export default defineConfig({
  site: 'https://digitalvisibility.com',
  integrations: [
    tailwind({
      // Enable JIT mode for faster CSS
      mode: 'jit',
      // Optimize for production builds
      config: {
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
        // Remove unused CSS
        purge: {
          enabled: true,
          content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}']
        }
      }
    }),
    react(),
    sitemap({
      filter: (page) => !page.includes('/draft/'), // Exclude drafts
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  output: 'hybrid',
  adapter: cloudflare({
    mode: 'directory'
  }),
  trailingSlash: 'always',
  // Enable built-in image optimization for static sites
  image: {
    // Default service works with static sites
    service: {
      entrypoint: 'astro/assets/services/sharp',
    }
  },
  build: {
    // Optimize build settings for performance
    assets: 'assets',
    // Inline small assets to reduce HTTP requests
    assetsInlineLimit: 4096,
    // Split CSS for better caching
    cssCodeSplit: true
  },
  // Allow scripts to use the is:inline directive
  scripts: {
    allowInlineScripts: true
  },
  vite: {
    build: {
      // Optimize bundle splitting
      rollupOptions: {
        external: [
          '/js/AnalyzerLead.js',
          '/js/lead-api.js'
        ],
        output: {
          // Split chunks for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['lucide-react']
          }
        }
      },
      // Optimize for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
         // CSS optimization
     css: {
       // Minimize CSS
       postcss: {
         plugins: [
           cssnano({
             preset: 'default'
           })
         ]
       }
     }
  }
});
