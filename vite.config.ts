import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { splitVendorChunkPlugin } from 'vite';

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
      plugins: [splitVendorChunkPlugin()],
      build: {
        target: 'es2015',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: isProduction,
            drop_debugger: isProduction,
            pure_funcs: isProduction ? ['console.log', 'console.info'] : [],
            passes: 2,
          },
          mangle: {
            safari10: true,
          },
        },
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'router': ['react-router-dom'],
              'ui': ['framer-motion', 'lucide-react'],
              'charts': ['recharts', 'chart.js', 'react-chartjs-2'],
              'icons': ['react-icons'],
              'utils': ['jspdf', 'jspdf-autotable'],
              'socket': ['socket.io-client'],
              'forms': ['react-helmet', 'react-tooltip'],
            },
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                return `assets/images/[name]-[hash].[ext]`;
              }
              if (/css/i.test(ext)) {
                return `assets/css/[name]-[hash].[ext]`;
              }
              return `assets/[ext]/[name]-[hash].[ext]`;
            },
          },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: !isProduction,
        // Preload critical chunks
        assetsInlineLimit: 4096, // 4kb
      },
      optimizeDeps: {
        include: [
          'react', 
          'react-dom', 
          'react-router-dom',
          'framer-motion',
          'lucide-react'
        ],
        exclude: ['jspdf', 'jspdf-autotable'],
        esbuildOptions: {
          target: 'es2015',
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
    };
});
