import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import compression from 'compression';
import helmet from 'helmet';
import * as esbuild from 'esbuild';
import connectDB from './backend/config/db';
import vehicleRoutes from './backend/routes/vehicleRoutes';
import authRoutes from './backend/routes/authRoutes';
import uploadRoutes from './backend/routes/uploadRoutes';
import analyticsRoutes from './backend/routes/analyticsRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Robustly determine the project root directory. This is crucial because when
// running the compiled server.js from the 'dist' folder, __dirname will be
// inside 'dist', but our static assets and TSX files are in the parent folder.
let root: string;
if (__dirname.includes('dist')) {
  // Production environment: running from 'dist', so we go one level up.
  root = path.resolve(__dirname, '..');
} else {
  // Development environment: server.ts is at the root.
  root = path.resolve();
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(root, 'uploads');
fs.access(uploadsDir).catch(() => fs.mkdir(uploadsDir));

// Security and Performance Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5001'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. API Routes
// Handle all API calls before any file serving.
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

// 2. Development-only TSX/TS Transpilation
// Only transpile in development mode
if (!isProduction) {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
      try {
        const filePath = path.join(root, req.path);
        // Check if file exists before attempting to read
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
        // If file doesn't exist, pass to the next middleware (which will likely be the fallback).
        if ((error as { code: string }).code === 'ENOENT') {
          return next();
        }
        // For any other error during transpilation, log it and send a server error.
        console.error(`[ESBuild Middleware] Error processing ${req.path}:`, error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      // If it's not a .tsx or .ts file, move on.
      next();
    }
  });
}

// 3. Serve Static Assets with Caching
// Serve the 'uploads' directory statically with caching
app.use('/uploads', express.static(path.join(root, 'uploads'), {
  maxAge: isProduction ? '1d' : 0,
  etag: true,
  lastModified: true,
}));

// Serve built assets with aggressive caching in production
if (isProduction) {
  app.use('/assets', express.static(path.join(root, 'dist/assets'), {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    immutable: true,
  }));
}

// Serve other static assets from the root
app.use(express.static(root, {
  maxAge: isProduction ? '1h' : 0,
  etag: true,
  lastModified: true,
}));

// 4. Fallback for Single-Page Application (SPA)
// For any route that is not an API call or a static file, serve index.html.
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(root, 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});