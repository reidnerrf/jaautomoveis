import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
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
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
          },
        },
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'router': ['react-router-dom'],
              'ui': ['framer-motion', 'lucide-react'],
              'charts': ['recharts'],
              'icons': ['react-icons'],
              'utils': ['jspdf', 'jspdf-autotable'],
            },
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          },
        },
        chunkSizeWarningLimit: 1000,
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
        exclude: ['jspdf', 'jspdf-autotable'],
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          port: 3000,
        },
        allowedHosts: true,
      },
    };
});
