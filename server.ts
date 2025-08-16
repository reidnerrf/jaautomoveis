import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import * as esbuild from 'esbuild';
import { createServer } from 'http';
import { Server } from 'socket.io';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';
import connectDB from './backend/config/db';
import vehicleRoutes from './backend/routes/vehicleRoutes';
import authRoutes from './backend/routes/authRoutes';
import uploadRoutes from './backend/routes/uploadRoutes';
import analyticsRoutes from './backend/routes/analyticsRoutes';
import Analytics from './backend/models/Analytics';

// Load environment variables
dotenv.config();

// Define PORT variable
const PORT = parseInt(process.env.PORT || '5000', 10);

// Connect to MongoDB
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    methods: ["GET", "POST"]
  }
});

const isProduction = process.env.NODE_ENV === 'production';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.access(uploadsDir).catch(() => fs.mkdir(uploadsDir));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth routes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "'sha256-dMbGrQLBAQ3ONffPJzMmBJLw0pWCQwlWqajAXOAvv9k='"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression middleware with better options
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Apply rate limiting
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5001'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

// 2. Development-only TSX/TS Transpilation
if (!isProduction) {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
      try {
        const filePath = path.join(__dirname, req.path);
        await fs.access(filePath);

        const source = await fs.readFile(filePath, 'utf-8');
        const { code } = await esbuild.transform(source, {
          loader: 'tsx',
          format: 'esm',
        });

        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(code);
      } catch (error) {
        if ((error as { code: string }).code === 'ENOENT') {
          return next();
        }
        console.error(`[ESBuild Middleware] Error processing ${req.path}:`, error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      next();
    }
  });
}

// 3. Serve Static Assets with Caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: isProduction ? '1d' : 0,
  etag: true,
  lastModified: true,
}));

if (isProduction) {
  app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    immutable: true,
  }));
}

app.use(express.static(__dirname, {
  maxAge: isProduction ? '1h' : 0,
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
  }
}));

// 4. Fallback for Single-Page Application (SPA)
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Socket.IO real-time analytics
const activeUsers = new Map();
const pageViews = new Map();

// Helper to parse user-agent across different ua-parser-js export styles
const getUAResult = (uaInput: unknown) => {
  const uaString = Array.isArray(uaInput) ? uaInput[0] : (uaInput as string | undefined) || '';
  try {
    const ParserAny: any = UAParser as unknown as any;
    const instance = typeof ParserAny === 'function' ? ParserAny(uaString) : new ParserAny(uaString);
    if (instance && typeof instance.getResult === 'function') {
      return instance.getResult();
    }
  } catch {
    // ignore and fall through to empty result
  }
  return { device: {}, browser: {}, os: {} } as any;
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('page-view', async (data) => {
    const { page, userAgent } = data;
    const result = getUAResult(userAgent);
    const forwardedFor = socket.handshake.headers['x-forwarded-for'];
    const clientIPStr = (Array.isArray(forwardedFor) ? forwardedFor[0] : (forwardedFor as string)) || (socket.handshake.address as string);
    const geo = geoip.lookup(clientIPStr);

    if (!pageViews.has(page)) {
      pageViews.set(page, new Set());
    }
    pageViews.get(page).add(socket.id);

    activeUsers.set(socket.id, {
      page,
      joinTime: Date.now(),
      device: result.device
    });

    io.emit('page-viewers', {
      page,
      count: pageViews.get(page).size
    });

    try {
      const analytics = new Analytics({
        sessionId: socket.id,
        event: 'page_view',
        category: 'navigation',
        action: 'view',
        page,
        userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
        device: {
          type: result.device.type || 'desktop',
          browser: result.browser.name || 'unknown',
          os: result.os.name || 'unknown',
          isMobile: result.device.type === 'mobile'
        },
        location: {
          country: geo?.country || 'unknown',
          region: geo?.region || 'unknown',
          city: geo?.city || 'unknown',
          ip: clientIPStr || 'unknown'
        }
      });
      await analytics.save();
    } catch (error) {
      console.error('Analytics save error:', error);
    }
  });

  socket.on('user-action', async (data) => {
    const { action, category, label, page } = data;
    const userAgent = socket.handshake.headers['user-agent'];
    const forwardedFor = socket.handshake.headers['x-forwarded-for'];
    const clientIPStr = (Array.isArray(forwardedFor) ? forwardedFor[0] : (forwardedFor as string)) || (socket.handshake.address as string);
    const result = getUAResult(userAgent);
    const geo = geoip.lookup(clientIPStr);

    try {
      const analytics = new Analytics({
        sessionId: socket.id,
        event: 'user_action',
        category,
        action,
        label,
        page,
        userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
        device: {
          type: result.device.type || 'desktop',
          browser: result.browser.name || 'unknown',
          os: result.os.name || 'unknown',
          isMobile: result.device.type === 'mobile'
        },
        location: {
          country: geo?.country || 'unknown',
          region: geo?.region || 'unknown',
          city: geo?.city || 'unknown',
          ip: clientIPStr || 'unknown'
        }
      });
      await analytics.save();

      io.emit('user-action-live', {
        action,
        category,
        label,
        timestamp: Date.now(),
        location: geo?.city || 'Unknown'
      });
    } catch (error) {
      console.error('Analytics save error:', error);
    }
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const page = user.page;
      if (pageViews.has(page)) {
        pageViews.get(page).delete(socket.id);
        io.emit('page-viewers', {
          page,
          count: pageViews.get(page).size
        });
      }
      activeUsers.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});