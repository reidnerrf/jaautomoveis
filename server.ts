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
import cron from "node-cron";
import connectDB from "./backend/config/db";
import vehicleRoutes from "./backend/routes/vehicleRoutes";
import authRoutes from "./backend/routes/authRoutes";
import uploadRoutes from "./backend/routes/uploadRoutes";
import analyticsRoutes from "./backend/routes/analyticsRoutes";
import pushRoutes from "./backend/routes/pushRoutes";
import Analytics from "./backend/models/Analytics";
import Vehicle from "./backend/models/Vehicle";
import ViewLog from "./backend/models/ViewLog";
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

dotenv.config();

const getAvailablePort = (preferredPort: number): number => {
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : preferredPort;
  if (envPort === 3000) return 5000;
  return envPort;
};

const PORT = getAvailablePort(5000);

const app = express();
app.disable("x-powered-by");
const server = createServer(app);
// Centralized CORS allow-list
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5001",
  "http://127.0.0.1:5001",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];
const envAllowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowed]);

const isOriginAllowed = (origin?: string | null) => {
  if (!origin) return true; // same-origin or non-CORS requests
  try {
    const url = new URL(origin);
    // Allow any of the explicit origins
    if (allowedOrigins.has(origin)) return true;
    // Also allow same host:port as server
    // Note: when behind a proxy, this should be set via ALLOWED_ORIGINS
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      return callback(null, isOriginAllowed(origin));
    },
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});
setSocketServer(io);
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
scriptSrcDirectives.push("https://www.googletagmanager.com", "https://www.google-analytics.com");

const uploadsDirBuild = path.join(__dirname, "uploads");
const uploadsDirRoot = path.join(process.cwd(), "uploads");
fs.access(uploadsDirBuild).catch(() => fs.mkdir(uploadsDirBuild));
fs.access(uploadsDirRoot).catch(() => fs.mkdir(uploadsDirRoot));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
});

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
          "https://maps.gstatic.com",
          "https://maps.googleapis.com",
          "https://maps.google.com",
        ],
        scriptSrc: scriptSrcDirectives,
        connectSrc: [
          "'self'",
          "ws:",
          "wss:",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
          "https://cdn.tailwindcss.com",
          "https://lh3.googleusercontent.com",
          "https://maps.googleapis.com",
          "https://www.google-analytics.com",
        ],
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
  })
);

app.get("/socket.io/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(mongoSanitize());
app.use(hpp());

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
  })
);

app.use("/api", limiter);

app.use(
  cors({
    origin: (origin, callback) => {
      return callback(null, isOriginAllowed(origin));
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(performanceMiddleware);
app.use(memoryMetricsMiddleware);

app.use("/uploads", vehicleImageOptimization);
app.use("/assets", vehicleImageOptimization);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/vehicles", vehicleListCacheMiddleware, vehicleRoutes);
app.use("/api/upload", autoImageOptimization, uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/push", pushRoutes);

app.get("/api/place-details", async (req: Request, res: Response) => {
  try {
    const placeId = (req.query.place_id as string) || "";
    if (!placeId) {
      return res.status(400).json({ error: "place_id é obrigatório" });
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ result: { reviews: [] } });
    }
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url as any);
    if (!(response as any).ok) {
      return res.status(200).json({ result: { reviews: [] } });
    }
    const data = await (response as any).json();
    res.json(data);
  } catch (error) {
    res.status(200).json({ result: { reviews: [] } });
  }
});

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

app.get("/api/images/stats", async (req: Request, res: Response) => {
  const stats = await getImageOptimizationStats();
  res.json(stats);
});
app.post("/api/images/clear-cache", async (req: Request, res: Response) => {
  await clearImageCache();
  res.json({ message: "Image cache cleared" });
});

app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    maxAge: isProduction ? "1h" : 0,
  })
);
app.use(
  "/public",
  express.static(path.join(process.cwd(), "public"), {
    maxAge: isProduction ? "1h" : 0,
  })
);

const clientDistPath = path.join(process.cwd(), "dist");
app.use(express.static(clientDistPath));

app.get("/manifest.json", (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "public", "manifest.json"));
});
app.get("/sw.js", (req: Request, res: Response) => {
  res.setHeader("Service-Worker-Allowed", "/");
  res.sendFile(path.join(process.cwd(), "public", "sw.js"));
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).select("id updatedAt").lean();
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

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

    vehicles.forEach((vehicle: any) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/vehicle/${vehicle._id}</loc>\n`;
      sitemap += `    <lastmod>${(vehicle as any).updatedAt?.toISOString() || new Date().toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += "</urlset>";

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

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
      } catch (error: any) {
        if ((error as { code: string }).code === "ENOENT") {
          return next();
        }
        console.error(`[ESBuild Middleware] Error processing ${req.path}:`, error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      next();
    }
  });
}

app.all(["/api/*"], (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: isProduction ? "1d" : 0,
    etag: true,
    lastModified: true,
  })
);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    maxAge: isProduction ? "1d" : 0,
    etag: true,
    lastModified: true,
  })
);

app.use(
  "/assets",
  express.static(path.join(__dirname, "assets"), {
    maxAge: isProduction ? "1y" : 0,
    etag: true,
    lastModified: true,
    immutable: isProduction,
  })
);
app.use(
  "/assets",
  express.static(path.join(process.cwd(), "assets"), {
    maxAge: isProduction ? "1y" : 0,
    etag: true,
    lastModified: true,
    immutable: isProduction,
  })
);

app.use(
  "/dist/assets",
  express.static(path.join(process.cwd(), "dist", "assets"), {
    maxAge: isProduction ? "1y" : 0,
    etag: true,
    lastModified: true,
    immutable: isProduction,
  })
);

app.use(
  express.static(__dirname, {
    maxAge: isProduction ? "1h" : 0,
    etag: true,
    lastModified: true,
    setHeaders: (res, p) => {
      if (p.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (p.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
        res.setHeader("Cache-Control", "public, max-age=31536000");
      }
    },
  })
);

if (isProduction) {
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const activeUsers = new Map<string, { page: string; joinTime: number }>();
const pageViews = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  if (!isProduction) {
    console.log("User connected:", socket.id);
  }

  socket.on("page-view", async (data) => {
    const { page } = data || {};
    const pagePath = String(page || "");

    const previous = activeUsers.get(socket.id)?.page;
    if (previous && previous !== pagePath && pageViews.has(previous)) {
      pageViews.get(previous)!.delete(socket.id);
      io.emit("page-viewers", {
        page: previous,
        count: pageViews.get(previous)!.size,
      });
    }

    if (!pageViews.has(pagePath)) {
      pageViews.set(pagePath, new Set());
    }
    pageViews.get(pagePath)!.add(socket.id);

    activeUsers.set(socket.id, {
      page: pagePath,
      joinTime: Date.now(),
    });

    io.emit("page-viewers", {
      page: pagePath,
      count: pageViews.get(pagePath)!.size,
    });

    // Persist view logs only for home and vehicle detail, and dedupe by minute
    if (pagePath === "/" || pagePath.startsWith("/vehicle/")) {
      try {
        // Extract vehicle id if present
        const match = pagePath.match(/^\/vehicle\/(.+)$/);
        if (match && match[1]) {
          // Throttle inserts: only insert a view per vehicle per minute
          const now = new Date();
          const minuteWindow = new Date(now);
          minuteWindow.setSeconds(0, 0);
          const exists = await ViewLog.findOne({
            vehicle: match[1],
            createdAt: { $gte: minuteWindow },
          }).lean();
          if (!exists) {
            await ViewLog.create({ vehicle: match[1] });
          }
        }
      } catch (e) {
        // swallow logging errors
      }
    }
  });

  socket.on("user-action", async (data) => {
    const { action, category, label, page } = data || {};

    const essentialActions = new Set([
      "like_vehicle",
      "whatsapp_click",
      "instagram_click",
      "vehicle_view",
    ]);

    if (!essentialActions.has(action)) {
      io.emit("user-action-live", {
        action,
        category,
        label,
        timestamp: Date.now(),
      });
      return;
    }

    // Only persist vehicle_view for allowed pages
    if (action === "vehicle_view") {
      const pagePath = String(page || "");
      if (!(pagePath === "/" || pagePath.startsWith("/vehicle/"))) {
        return;
      }
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

      if (action === "like_vehicle") {
        try {
          const parsed = label ? JSON.parse(label) : {};
          const vehicleId = parsed?.vehicleId || null;
          const name = parsed?.name || null;
          if (vehicleId) {
            io.emit("like-updated", { vehicleId, name });
          }
        } catch (e) {}
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
        pageViews.get(page)!.delete(socket.id);
        io.emit("page-viewers", {
          page,
          count: pageViews.get(page)!.size,
        });
      }
      activeUsers.delete(socket.id);
    }
    if (!isProduction) {
      console.log("User disconnected:", socket.id);
    }
  });

  socket.on("join-admin", () => {
    socket.join("admin-room");
  });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error("Unhandled error:", err.message);
  if (!isProduction) {
    console.error(err.stack);
  }
  res.status(statusCode).json({ message: "Internal Server Error" });
});

if (process.env.NODE_ENV !== "test") {
  const startServer = () =>
    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
      );
      // Monthly purges at 03:00 on day 1 (GMT-3)
      try {
        cron.schedule(
          "0 3 1 * *",
          async () => {
            try {
              const cutoff = new Date();
              cutoff.setMonth(cutoff.getMonth() - 3);
              const a = await Analytics.deleteMany({ timestamp: { $lt: cutoff } });
              const v = await ViewLog.deleteMany({ createdAt: { $lt: cutoff } });
              console.log(
                `[CRON] Purged analytics older than ${cutoff.toISOString()}: analytics=${a?.deletedCount || 0}, viewlogs=${v?.deletedCount || 0}`
              );
            } catch (err) {
              console.error("[CRON] Failed to purge analytics:", err);
            }
          },
          { timezone: "Etc/GMT+3" }
        );
      } catch (err) {
        console.error("Failed to schedule cron job:", err);
      }
    });

  if (process.env.SKIP_DB === "true") {
    if (
      process.env.NODE_ENV === "production" &&
      (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "")
    ) {
      console.error("JWT_SECRET must be set in production");
      process.exit(1);
    }
    startServer();
  } else {
    connectDB()
      .then(startServer)
      .catch((err) => {
        console.error("Failed to connect to MongoDB. Server not started.", err);
        process.exit(1);
      });
  }
}

export { app, server };
