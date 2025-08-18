
import express from 'express';
import jwt from 'jsonwebtoken';

const getJwtSecret = (): string => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== '') {
    // Always trim to avoid signature mismatches when env has trailing spaces/newlines
    return process.env.JWT_SECRET.trim();
  }
  return 'dev-insecure-secret-change-me';
};

// Enhanced JWT validation with more security checks
export const protect = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header' });
  }

  const [, token] = authHeader.split(' ');

  if (token) {
    try {
      
      // Verify token exists and is not empty
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, no valid token provided' 
        });
      }

      // Resolve JWT secret (fallback in dev)
      const secret = getJwtSecret();

      // Verify and decode token
      const decoded = jwt.verify(token, secret) as { 
        id: string; 
        iat: number; 
        exp: number; 
      };

      // Check if token is expired (additional check)
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired' 
        });
      }

      // Attach user info to request
      (req as any).user = { id: decoded.id };
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      } else if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired' 
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, token verification failed' 
        });
      }
    }
  } else {
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided' 
    });
  }
};

// Admin role verification middleware
export const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // This would typically check user role from database
    // For now, we'll assume all authenticated users can access admin
    // In production, add proper role checking
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false,
      message: 'Access denied - Admin role required' 
    });
  }
};

// Input validation middleware
export const validateInput = (fields: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors: string[] = [];
    
    fields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors 
      });
    }
    
    next();
  };
};
