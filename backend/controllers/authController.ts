import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// In-memory single-session registry (consider redis in production)
const userActiveSession = new Map<string, string>();

const getUserIdFromAuthHeader = (req: express.Request): string | null => {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token || !process.env.JWT_SECRET) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
};

export const loginUser = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  console.log(`[AUTH] Login attempt for user: "${username}"`);

  try {
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`[AUTH] Failure: User "${username}" not found in database.`);
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
    console.log(`[AUTH] Success: User "${username}" found in database.`);

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      // Enforce single active session per user
      const existingSession = userActiveSession.get(user._id.toString());
      if (existingSession) {
        return res.status(423).json({ message: 'Sessão ativa detectada em outro dispositivo. Encerre a sessão anterior.' });
      }

      const token = generateToken(user._id.toString());
      console.log(`[AUTH] Success: Password for user "${username}" matches.`);
      res.json({
        _id: user._id,
        username: user.username,
        token,
      });
    } else {
      console.log(`[AUTH] Failure: Password for user "${username}" does not match.`);
      res.status(401).json({ message: 'Invalid Credentials' });
    }
  } catch (error) {
    console.error('[AUTH] Server error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const openSession = async (req: express.Request, res: express.Response) => {
  const userId = getUserIdFromAuthHeader(req);
  if (!userId) return res.status(401).json({ message: 'Not authorized' });

  // If another session exists, block
  if (userActiveSession.has(userId)) {
    return res.status(423).json({ message: 'Já existe uma sessão ativa.' });
  }

  const newSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  userActiveSession.set(userId, newSessionId);
  return res.status(200).json({ sessionId: newSessionId });
};

export const closeSession = async (req: express.Request, res: express.Response) => {
  const userId = getUserIdFromAuthHeader(req);
  if (!userId) return res.status(401).json({ message: 'Not authorized' });

  userActiveSession.delete(userId);
  return res.status(200).json({ message: 'Sessão encerrada' });
};