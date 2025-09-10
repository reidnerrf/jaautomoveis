import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { federation } from "@module-federation/vite";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const shouldAnalyze = process.env.ANALYZE === "true";

  return {
    cacheDir: "node_modules/.vite-ja",
    define: {
      // Only define specific keys to avoid clobbering process.env entirely
      "process.env.NODE_ENV": JSON.stringify(mode),
      "import.meta.env.MODE": JSON.stringify(mode),
    },
    // Add base to support CDN asset prefix; allow override via VITE_CDN_BASE too
    base: process.env.CDN_BASE_URL || process.env.VITE_CDN_BASE || "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      // Ensure proper module resolution for dynamic imports
      preserveSymlinks: false,
      conditions: ['import', 'module', 'browser', 'default'],
    },
    plugins: [
      react(),
      // Temporarily disable federation to fix dynamic import issues
      // !isProduction &&
      //   federation({
      //     name: "host",
      //     remotes: {
      //       // vehicles: "vehicles@http://localhost:3001/assets/remoteEntry.js",
      //     },
      //     shared: {
      //       react: { singleton: true, eager: false, requiredVersion: false },
      //       "react-dom": { singleton: true, eager: false, requiredVersion: false },
      //       "react-router-dom": { singleton: true, eager: false, requiredVersion: false },
      //     },
      //   }),
      shouldAnalyze &&
        visualizer({
          filename: "dist/stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),
    build: {
      target: "esnext",
      outDir: "dist",
      emptyOutDir: false, // Don't clean the output directory to preserve server files
      minify: isProduction ? "esbuild" : false, // ⚡ rápido
      cssMinify: isProduction ? "esbuild" : false,
      sourcemap: !isProduction,
      reportCompressedSize: false,
      modulePreload: { polyfill: false },
      rollupOptions: {
        external: ["@sentry/tracing"],
        output: {
          manualChunks(id: string) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("react-router-dom")) {
              return "router";
            }
            if (id.includes("framer-motion")) {
              return "motion";
            }
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
              return "chartjs";
            }
            if (id.includes("recharts")) {
              return "recharts";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("@headlessui/react") || id.includes("@heroicons")) {
              return "headlessui";
            }
            if (id.includes("jspdf")) {
              return "jspdf";
            }
            if (id.includes("socket.io-client")) {
              return "socket";
            }
            // Deixe o Rollup dividir o restante automaticamente
            return undefined;
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: (assetInfo: { name?: string }) => {
            const ext = assetInfo.name?.split(".").pop() ?? "unknown";
    
            if (assetInfo.name === 'favicon.ico') return 'favicon.ico';
            if (/png|jpe?g|svg|gif|ico|webp/i.test(ext)) {
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
      cssCodeSplit: true,
      assetsInlineLimit: 1024,
      chunkSizeWarningLimit: 1000,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      terserOptions: undefined,
      // Drop consoles/debuggers in prod via esbuild
      esbuild: isProduction
        ? {
            drop: ["console", "debugger"],
            legalComments: "none",
          }
        : undefined,
    },
    optimizeDeps: {
      // Permite cache estável do prebundle para acelerar builds subsequentes
      force: false,
      esbuildOptions: {
        target: "esnext",
        treeShaking: true,
      },
      exclude: ["lucide-react"],
    },
    server: {
      port: 80,
      host: "0.0.0.0",
      hmr: true,
      headers: {
        // Ensure correct MIME for module scripts
        "Cache-Control": "no-store",
      },
      // Ensure proper module resolution for dynamic imports
      fs: {
        strict: false,
        allow: ['..', '.'],
      },
      // Force proper module resolution
      middlewareMode: false,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
        },
        "/assets": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        "/socket.io": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
        },
        // GraphQL endpoint
        "/graphql": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
        },
      },
      strictPort: true, // Força usar a porta 80
    },
    preview: {
      port: 4173,
      host: true,
    },
  };
});
