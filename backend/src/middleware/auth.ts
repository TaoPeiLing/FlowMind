import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

// 管理员认证中间件
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', {
      header: authHeader,
      path: req.path,
      method: req.method
    });

    if (!authHeader) {
      console.log('No Authorization Header');
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No Token in Authorization Header');
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      console.log('Token Decoded:', decoded);

      if (decoded.role !== 'admin') {
        console.log('Not Admin Role:', decoded.role);
        return res.status(403).json({ error: 'Admin access required' });
      }

      req.user = decoded;
      console.log('Auth Success:', req.user);
      next();
    } catch (jwtError) {
      console.log('JWT Verify Error:', jwtError);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 授权中间件
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRole = req.user.role === roles[0];
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};