import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'import.meta.env.MODE': JSON.stringify(mode),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        splitVendorChunkPlugin(),
        // Bundle analyzer for production builds
        isProduction && visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        })
      ].filter(Boolean),
      build: {
        target: 'es2015',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: isProduction,
            drop_debugger: isProduction,
            pure_funcs: isProduction ? ['console.log', 'console.info'] : [],
            passes: 3, // Increased passes for better compression
            unsafe: true,
            unsafe_comps: true,
            unsafe_Function: true,
            unsafe_math: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
          },
          mangle: {
            safari10: true,
            toplevel: true, // Mangle top-level names
          },
          format: {
            comments: false,
          },
        },
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // React core
              if (id.includes('react') && !id.includes('react-dom')) {
                return 'react-core';
              }
              // React DOM
              if (id.includes('react-dom')) {
                return 'react-dom';
              }
              // Router
              if (id.includes('react-router')) {
                return 'router';
              }
              // UI libraries
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'ui-animations';
              }
              // Charts
              if (id.includes('recharts') || id.includes('chart.js')) {
                return 'charts';
              }
              // Icons
              if (id.includes('react-icons')) {
                return 'icons';
              }
              // PDF generation
              if (id.includes('jspdf')) {
                return 'pdf-utils';
              }
              // Socket.io
              if (id.includes('socket.io')) {
                return 'websockets';
              }
              // Forms and validation
              if (id.includes('react-helmet') || id.includes('react-tooltip')) {
                return 'forms-utils';
              }
              // Apollo GraphQL
              if (id.includes('@apollo/client') || id.includes('graphql')) {
                return 'graphql';
              }
              // Tailwind and styling
              if (id.includes('tailwind') || id.includes('postcss')) {
                return 'styling';
              }
              // Vendor chunks for other dependencies
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
            chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
              return `assets/js/[name]-[hash].js`;
            },
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
                return `assets/images/[name]-[hash].[ext]`;
              }
              if (/css/i.test(ext)) {
                return `assets/css/[name]-[hash].[ext]`;
              }
              if (/woff2?|ttf|eot/i.test(ext)) {
                return `assets/fonts/[name]-[hash].[ext]`;
              }
              return `assets/[ext]/[name]-[hash].[ext]`;
            },
          },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: !isProduction,
        // Preload critical chunks
        assetsInlineLimit: 4096, // 4kb
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Optimize dependencies
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true,
        },
      },
      optimizeDeps: {
        include: [
          'react', 
          'react-dom', 
          'react-router-dom',
          'framer-motion',
          'lucide-react',
          '@apollo/client',
          'graphql'
        ],
        exclude: ['jspdf', 'jspdf-autotable'],
        esbuildOptions: {
          target: 'es2015',
          // Enable tree shaking
          treeShaking: true,
        },
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          port: 3000,
        },
        allowedHosts: true,
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            ws: true,
          },
          '/uploads': {
            target: 'http://localhost:5000',
            changeOrigin: true,
          },
          '/socket.io': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            ws: true,
          },
        },
      },
      // Preload critical resources
      preview: {
        port: 4173,
        host: true,
      },
      // Performance optimizations
      experimental: {
        renderBuiltUrl(filename, { hostType }) {
          if (hostType === 'js') {
            return { js: `/${filename}` };
          } else {
            return { relative: true };
          }
        },
      },
    };
});
