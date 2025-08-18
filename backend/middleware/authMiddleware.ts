import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const getJwtSecret = (): string => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== "") {
    // Sempre trim para evitar erro de assinatura
    return process.env.JWT_SECRET.trim();
  }
  return "dev-insecure-secret-change-me";
};

interface DecodedToken extends JwtPayload {
  id: string;
}

// Middleware de proteção
export const protect = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1]?.trim();

  if (!token) {
    return res.status(401).json({ success: false, message: "Token not provided" });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as DecodedToken;

    // Verificação extra de expiração
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    (req as any).user = { id: decoded.id };
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    return res.status(401).json({ success: false, message: "Token verification failed" });
  }
};

// Middleware de admin (placeholder)
export const requireAdmin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    // Aqui você faria a checagem real de papel do usuário
    next();
  } catch {
    res.status(403).json({
      success: false,
      message: "Access denied - Admin role required",
    });
  }
};

// Middleware de validação de inputs
export const validateInput = (fields: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors: string[] = [];

    fields.forEach((field) => {
      if (!req.body[field] || req.body[field].toString().trim() === "") {
        errors.push(`${field} is required`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

// Endpoint para validar token
export const validateToken = (
  req: express.Request,
  res: express.Response
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1]?.trim();

  if (!token) {
    return res.status(401).json({ success: false, message: "Token not provided" });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as DecodedToken;

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    res.json({
      success: true,
      message: "Token is valid",
      user: { id: decoded.id },
    });
  } catch (error: any) {
    console.error("Token validation error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    return res.status(401).json({ success: false, message: "Token verification failed" });
  }
};
