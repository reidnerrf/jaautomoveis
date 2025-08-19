import path from "path";
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const isProduction = mode === "production";

  return {
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "import.meta.env.MODE": JSON.stringify(mode),
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },  
    },
    plugins: [
      splitVendorChunkPlugin(),
      isProduction &&
        visualizer({
          filename: "dist/stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),
    build: {
      target: "es2018",
      outDir: "/dist", // ou só "dist" se você não usa client/
      minify: isProduction ? "esbuild" : false, // ⚡ muito mais rápido que terser
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Separar apenas o que realmente pesa
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            // Todos os demais de node_modules juntos
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
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
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1000,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      force: true, // build incremental mais confiável
      esbuildOptions: {
        target: "es2018",
        treeShaking: true,
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      hmr: true,
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
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
  };
});
