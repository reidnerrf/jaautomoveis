import express from 'express';
import jwt from 'jsonwebtoken';

export const protect = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET as string);
      
      // You might want to attach the user to the request object
      // const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      // req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};