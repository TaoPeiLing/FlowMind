import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}; 