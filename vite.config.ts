import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { federation } from "@module-federation/vite";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    define: {
      "process.env": {}, // evita undefined
      "import.meta.env.MODE": JSON.stringify(mode),
    },
    // Add base to support CDN asset prefix
    base: process.env.CDN_BASE_URL || "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      react(),
      federation({
        name: "host",
        remotes: {
          // vehicles: "vehicles@http://localhost:3001/assets/remoteEntry.js",
        },
        shared: {
          react: { singleton: true, eager: false, requiredVersion: false },
          "react-dom": { singleton: true, eager: false, requiredVersion: false },
          "react-router-dom": { singleton: true, eager: false, requiredVersion: false },
        },
      }),
      isProduction &&
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
      minify: isProduction ? "esbuild" : false, // ⚡ muito mais rápido que terser
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
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
            if (id.includes("jspdf")) {
              return "jspdf";
            }
            if (id.includes("socket.io-client")) {
              return "socket";
            }
            if (id.includes("@apollo/client")) {
              return "apollo";
            }
            // Deixe o Rollup dividir o restante automaticamente
            return undefined;
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: (assetInfo: { name?: string }) => {
            const ext = assetInfo.name?.split(".").pop() ?? "unknown";
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
    },
    optimizeDeps: {
      force: true, // build incremental mais confiável
      esbuildOptions: {
        target: "esnext",
        treeShaking: true,
      },
      exclude: ["lucide-react"],
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      hmr: true,
      headers: {
        // Ensure correct MIME for module scripts
        "Cache-Control": "no-store",
      },
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
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
      strictPort: false,
    },
    preview: {
      port: 4173,
      host: true,
    },
  };
});
