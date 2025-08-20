import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";

// Função única para resolver JWT_SECRET
const getJwtSecret = (): string => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== "") {
    return process.env.JWT_SECRET.trim();
  }
  return "dev-insecure-secret-change-me";
};

interface DecodedToken extends JwtPayload {
  id: string;
}

const generateToken = (id: string) => {
  if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "")) {
    throw new Error("JWT_SECRET must be set in production");
  }
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: "30d",
  });
};

// Single-session enforcement removed to allow multiple concurrent logins

const getUserIdFromAuthHeader = (req: express.Request): string | null => {
  try {
    const header = req.headers.authorization || "";
    const [, token] = header.split(" ");
    if (!token) return null;

    const decoded = jwt.verify(token, getJwtSecret()) as DecodedToken;
    return decoded.id;
  } catch {
    return null;
  }
};

export const loginUser = async (
  req: express.Request,
  res: express.Response,
) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  console.log(`[AUTH] Login attempt for user: "${username}"`);

  try {
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      console.log(`[AUTH] Failure: User "${username}" not found in database.`);
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    console.log(`[AUTH] Success: User "${username}" found in database.`);

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      const token = generateToken(user._id.toString());
      console.log(`[AUTH] Success: Password for user "${username}" matches.`);

      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token,
      });
    } else {
      console.log(
        `[AUTH] Failure: Password for user "${username}" does not match.`,
      );
      res.status(401).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error("[AUTH] Server error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const openSession = async (
  req: express.Request,
  res: express.Response,
) => {
  const userId = getUserIdFromAuthHeader(req);
  if (!userId) return res.status(401).json({ message: "Not authorized" });

  // No-op session open: always allow and return a generated session id
  const newSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return res.status(200).json({ sessionId: newSessionId });
};

export const closeSession = async (
  req: express.Request,
  res: express.Response,
) => {
  const userId = getUserIdFromAuthHeader(req);
  if (!userId) return res.status(401).json({ message: "Not authorized" });

  // No-op: with multi-login allowed, we do not track active sessions here
  return res.status(200).json({ message: "Sessão encerrada" });
};
