
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import * as esbuild from 'esbuild';
import connectDB from './backend/config/db';
import vehicleRoutes from './backend/routes/vehicleRoutes';
import authRoutes from './backend/routes/authRoutes';
import uploadRoutes from './backend/routes/uploadRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const root = path.resolve();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(root, 'uploads');
fs.access(uploadsDir).catch(() => fs.mkdir(uploadsDir));

// Core Middleware
app.use(cors());
app.use(express.json());

// 1. API Routes
// Handle all API calls before any file serving.
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/upload', uploadRoutes);

// 2. On-the-fly TSX/TS Transpilation
// This middleware intercepts requests for .tsx/.ts files, transpiles them to
// browser-compatible JavaScript, and serves them with the correct MIME type.
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

// 3. Serve Static Assets
// Serve the 'uploads' directory statically.
app.use('/uploads', express.static(path.join(root, 'uploads')));

// Serve other static assets from the root. This allows requests for /assets/* to work.
// It will also serve index.html for the root path '/'.
app.use(express.static(root));

// 4. Fallback for Single-Page Application (SPA)
// For any route that is not an API call or a static file, serve index.html.
// This allows the client-side router to handle navigation.
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(root, 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});