import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export const loginUser = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  console.log(`[AUTH] Login attempt for user: "${username}"`);

  try {
    // 1. Find the user by username
    const user = await User.findOne({ username });

    // 2. If user does not exist, the credentials are invalid
    if (!user) {
      console.log(`[AUTH] Failure: User "${username}" not found in database.`);
      // Return 401 but use a generic message to prevent username enumeration
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
    console.log(`[AUTH] Success: User "${username}" found in database.`);

    // 3. If user exists, compare the provided password with the stored hash
    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      // 4. If passwords match, generate token and send success response
      console.log(`[AUTH] Success: Password for user "${username}" matches.`);
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id.toString()),
      });
    } else {
      // 5. If passwords do not match, the credentials are invalid
      console.log(`[AUTH] Failure: Password for user "${username}" does not match.`);
      res.status(401).json({ message: 'Invalid Credentials' });
    }
  } catch (error) {
    console.error('[AUTH] Server error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};