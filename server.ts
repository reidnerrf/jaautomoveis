import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import compression from "compression";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import * as esbuild from "esbuild";
import { createServer } from "http";
import { Server } from "socket.io";
import { setSocketServer } from "./backend/socket";
import UAParser from "ua-parser-js";
// geoip removed as it's unused
import connectDB from "./backend/config/db";
import vehicleRoutes from "./backend/routes/vehicleRoutes";
import authRoutes from "./backend/routes/authRoutes";
import uploadRoutes from "./backend/routes/uploadRoutes";
import analyticsRoutes from "./backend/routes/analyticsRoutes";
import Analytics from "./backend/models/Analytics";
import Vehicle from "./backend/models/Vehicle";

// Performance and optimization middlewares
import performanceMiddleware, {
  memoryMetricsMiddleware,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  getSystemHealth,
  getRouteStats,
  getActiveAlerts,
} from "./backend/middleware/performanceMiddleware";
import {
  vehicleListCacheMiddleware,
  getCacheMetrics,
  resetCacheMetrics,
  warmupCache,
} from "./backend/middleware/cacheMiddleware";
import {
  vehicleImageOptimization,
  autoImageOptimization,
  getImageOptimizationStats,
  clearImageCache,
} from "./backend/middleware/imageOptimization";

// Load environment variables
dotenv.config();

// Define PORT variable - handle port conflicts
const getAvailablePort = (preferredPort: number): number => {
  const envPort = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : preferredPort;
  // se for 3000 (porta do frontend), troca para 5000
  if (envPort === 3000) return 5000;
  return envPort;
};

const PORT = getAvailablePort(5000);

// Connect to MongoDB (skip during tests)
if (process.env.SKIP_DB !== "true") {
  connectDB();
}

const app = express();
// Hide framework signature
app.disable("x-powered-by");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
          ],
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});
// make io accessible to controllers
setSocketServer(io);

// trust proxy for correct client IP and ws upgrades via reverse proxy
app.set("trust proxy", 1);

const isProduction = process.env.NODE_ENV === "production";

const scriptSrcDirectives = [
  "'self'",
  "https://cdn.tailwindcss.com",
  "'sha256-yMpSFLHnSZit6gvx0eHX89rw90Bv+QXITwFYyPzBrjc='",
  "'sha256-NltRhJacRNw4BdgPSP+P8/KP9MS0BrJzNEpd27YU/YY='",
];
if (!isProduction) {
  scriptSrcDirectives.push("data:");
}

// Create uploads directories if they don't exist (both runtime and project root)
const uploadsDirBuild = path.join(__dirname, "uploads");
const uploadsDirRoot = path.join(process.cwd(), "uploads");
fs.access(uploadsDirBuild).catch(() => fs.mkdir(uploadsDirBuild));
fs.access(uploadsDirRoot).catch(() => fs.mkdir(uploadsDirRoot));

// Rate limiting - Fixed IPv6 handling
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"), // ✅ corrige undefined
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"), // ✅ idem
});
// Middleware to handle cache invalidation for vehicle detail pages
// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "https://lh3.googleusercontent.com",
          // Google Maps images
          "https://maps.gstatic.com",
          "https://maps.googleapis.com",
          "https://maps.google.com",
        ],
        scriptSrc: scriptSrcDirectives,
        // Allow external connections for fonts, Tailwind CDN, and Google avatars/images
        connectSrc: [
          "'self'",
          "ws:",
          "wss:",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
          "https://cdn.tailwindcss.com",
          "https://lh3.googleusercontent.com",
          // Google Maps APIs
          "https://maps.googleapis.com",
        ],
        // Allow Google Maps embeds
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.google.com.br",
          "https://maps.google.com",
        ],
        manifestSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// health check endpoints
app.get("/socket.io/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Health check endpoint (must come before SPA fallback)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression middleware with better options
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Apply rate limiting only to API routes to avoid throttling static assets and websockets
app.use("/api", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5001",
    ],
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Performance monitoring middleware
app.use(performanceMiddleware);
app.use(memoryMetricsMiddleware);

// Image optimization middleware
app.use("/uploads", vehicleImageOptimization);
app.use("/assets", vehicleImageOptimization);

// 1. API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/vehicles", vehicleListCacheMiddleware, vehicleRoutes);
app.use("/api/upload", autoImageOptimization, uploadRoutes);
app.use("/api/analytics", analyticsRoutes);

// Proxy para Google Places para evitar CORS no frontend
app.get("/api/place-details", async (req: Request, res: Response) => {
  try {
    const placeId = (req.query.place_id as string) || "";
    if (!placeId) {
      return res.status(400).json({ error: "place_id é obrigatório" });
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // Fail gracefully so frontend can continue rendering
      return res.status(200).json({ result: { reviews: [] } });
    }
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(200).json({ result: { reviews: [] } });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    // Do not break page if Google service fails
    res.status(200).json({ result: { reviews: [] } });
  }
});

// Performance metrics endpoints
app.get("/api/performance/metrics", getPerformanceMetrics);
app.get("/api/performance/health", (req: Request, res: Response) => {
  res.json(getSystemHealth());
});
app.get("/api/performance/routes", (req: Request, res: Response) => {
  res.json(Array.from(getRouteStats().entries()));
});
app.get("/api/performance/alerts", (req: Request, res: Response) => {
  res.json(getActiveAlerts());
});
app.delete("/api/performance/metrics", clearPerformanceMetrics);

// Cache management endpoints
app.get("/api/cache/metrics", (req: Request, res: Response) => {
  res.json(getCacheMetrics());
});
app.post("/api/cache/reset", (req: Request, res: Response) => {
  resetCacheMetrics();
  res.json({ message: "Cache metrics reset" });
});
app.post("/api/cache/warmup", async (req: Request, res: Response) => {
  await warmupCache();
  res.json({ message: "Cache warm-up completed" });
});

// Image optimization endpoints
app.get("/api/images/stats", async (req: Request, res: Response) => {
  const stats = await getImageOptimizationStats();
  res.json(stats);
});
app.post("/api/images/clear-cache", async (req: Request, res: Response) => {
  await clearImageCache();
  res.json({ message: "Image cache cleared" });
});

// serve public folder at /public for manifest/sw/favicon
app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    maxAge: isProduction ? "1h" : 0,
  }),
);
// Also serve from project root in case __dirname points to dist without a copied public folder
app.use(
  "/public",
  express.static(path.join(process.cwd(), "public"), {
    maxAge: isProduction ? "1h" : 0,
  }),
);

// servir build do React (ajuste o caminho conforme sua estrutura)
const clientDistPath = path.join(process.cwd(), "dist");
app.use(express.static(clientDistPath));

// fallback para React Router SPA (apenas em produção)
if (isProduction) {
  app.get("*", (_, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Expose PWA files at root for proper scope
app.get("/manifest.json", (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "public", "manifest.json"));
});
app.get("/sw.js", (req: Request, res: Response) => {
  res.setHeader("Service-Worker-Allowed", "/");
  res.sendFile(path.join(process.cwd(), "public", "sw.js"));
});

// (moved earlier)

// Sitemap generation
app.get("/sitemap.xml", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).select("id updatedAt").lean();
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/inventory", priority: "0.9", changefreq: "daily" },
      { url: "/about", priority: "0.7", changefreq: "monthly" },
      { url: "/contact", priority: "0.7", changefreq: "monthly" },
      { url: "/financing", priority: "0.8", changefreq: "monthly" },
      { url: "/consortium", priority: "0.8", changefreq: "monthly" },
    ];

    staticPages.forEach((page) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Vehicle pages
    vehicles.forEach((vehicle) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/vehicle/${vehicle._id}</loc>\n`;
      sitemap += `    <lastmod>${(vehicle as any).updatedAt?.toISOString() || new Date().toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += "</urlset>";

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// 2. Development-only TSX/TS Transpilation
if (!isProduction) {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.path.endsWith(".tsx") || req.path.endsWith(".ts")) {
      try {
        const filePath = path.join(__dirname, req.path);
        await fs.access(filePath);

        const source = await fs.readFile(filePath, "utf-8");
        const { code } = await esbuild.transform(source, {
          loader: "tsx",
          format: "esm",
        });

        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.send(code);
      } catch (error) {
        if ((error as { code: string }).code === "ENOENT") {
          return next();
        }
        console.error(
          `[ESBuild Middleware] Error processing ${req.path}:`,
          error,
        );
        res.status(500).send("Internal Server Error");
      }
    } else {
      next();
    }
  });
}

// API 404 fallback to avoid serving index.html for unknown API routes
app.all(["/api/*"], (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// 3. Serve Static Assets with Caching
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: isProduction ? "1d" : 0,
    etag: true,
    lastModified: true,
  }),
);

// Also serve uploads from project root (when images are saved outside dist in production)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    maxAge: isProduction ? "1d" : 0,
    etag: true,
    lastModified: true,
  }),
);

app.use(
  "/assets",
  express.static(path.join(__dirname, "assets"), {
    maxAge: isProduction ? "1y" : 0,
    etag: true,
    lastModified: true,
    immutable: isProduction,
  }),
);
app.use(
  "/assets",
  express.static(path.join(process.cwd(), "assets"), {
    maxAge: isProduction ? "1y" : 0,
    etag: true,
    lastModified: true,
    immutable: isProduction,
  }),
);

app.use(
  express.static(__dirname, {
    maxAge: isProduction ? "1h" : 0,
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (
        path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)
      ) {
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
      }
    },
  }),
);

// 4. Fallback for Single-Page Application (SPA) - only in production (dist)
if (isProduction) {
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
  });
}

// Socket.IO real-time analytics
const activeUsers = new Map();
const pageViews = new Map();

// Helper to parse user-agent across different ua-parser-js export styles
const getUAResult = (uaInput: unknown) => {
  const uaString = Array.isArray(uaInput)
    ? uaInput[0]
    : (uaInput as string | undefined) || "";
  try {
    const ParserAny: any = UAParser as unknown as any;
    const instance =
      typeof ParserAny === "function"
        ? ParserAny(uaString)
        : new ParserAny(uaString);
    if (instance && typeof instance.getResult === "function") {
      return instance.getResult();
    }
  } catch {
    // ignore and fall through to empty result
  }
  return { device: {}, browser: {}, os: {} } as any;
};

io.on("connection", (socket) => {
  if (!isProduction) {
    // Useful during development; avoid noisy logs in production
    console.log("User connected:", socket.id);
  }

  socket.on("page-view", async (data) => {
    const { page } = data;

    // If socket was previously on another page, remove it from that set
    const previous = activeUsers.get(socket.id)?.page;
    if (previous && previous !== page && pageViews.has(previous)) {
      pageViews.get(previous).delete(socket.id);
      io.emit("page-viewers", {
        page: previous,
        count: pageViews.get(previous).size,
      });
    }

    if (!pageViews.has(page)) {
      pageViews.set(page, new Set());
    }
    pageViews.get(page).add(socket.id);

    activeUsers.set(socket.id, {
      page,
      joinTime: Date.now(),
    });

    io.emit("page-viewers", {
      page,
      count: pageViews.get(page).size,
    });

    // Do NOT persist generic page views to the database to reduce data volume
  });

  socket.on("user-action", async (data) => {
    const { action, category, label, page } = data;

    // Only persist essential business events
    const essentialActions = new Set([
      "like_vehicle",
      "whatsapp_click",
      "instagram_click",
      "vehicle_view",
    ]);

    if (!essentialActions.has(action)) {
      // Still broadcast live for dashboard UX, but skip DB write
      io.emit("user-action-live", {
        action,
        category,
        label,
        timestamp: Date.now(),
      });
      return;
    }

    try {
      const analytics = new Analytics({
        sessionId: socket.id,
        event: "user_action",
        category,
        action,
        label,
        page,
        timestamp: new Date(),
      });
      await analytics.save();

      io.emit("user-action-live", {
        action,
        category,
        label,
        timestamp: Date.now(),
      });

      // Broadcast a dedicated event for likes with parsed payload
      if (action === "like_vehicle") {
        try {
          const parsed = label ? JSON.parse(label) : {};
          const vehicleId = parsed?.vehicleId || null;
          const name = parsed?.name || null;
          if (vehicleId) {
            io.emit("like-updated", { vehicleId, name });
          }
        } catch (e) {
          // ignore JSON parse errors in like payloads
        }
      }
    } catch (error) {
      console.error("Analytics save error:", error);
    }
  });

  socket.on("disconnect", () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const { page } = user;
      if (pageViews.has(page)) {
        pageViews.get(page).delete(socket.id);
        io.emit("page-viewers", {
          page,
          count: pageViews.get(page).size,
        });
      }
      activeUsers.delete(socket.id);
    }
    if (!isProduction) {
      console.log("User disconnected:", socket.id);
    }
  });

  // allow admin dashboard to join a room for concise broadcasts
  socket.on("join-admin", () => {
    socket.join("admin-room");
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start Server
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
    );
  });
}

export { app, server };
