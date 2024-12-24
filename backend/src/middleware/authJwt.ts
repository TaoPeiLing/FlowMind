import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const authJwt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    console.log('Verifying token...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    console.log('Token decoded successfully:', { userId: decoded.userId });

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(`User not found for userId: ${decoded.userId}`);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        message: 'Invalid token',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}; 