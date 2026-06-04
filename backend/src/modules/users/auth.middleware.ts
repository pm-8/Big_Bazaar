import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // FIXED: default import
import 'dotenv/config'; // FIXED: force env loading

export interface AuthPayload extends jwt.JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1] as string;

  if (!process.env.JWT_SECRET) {
    console.error("🚨 CRITICAL: JWT_SECRET is undefined! Check your .env file.");
    res.status(500).json({ success: false, error: 'Server configuration error.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as AuthPayload;
    req.user = decoded; 
    next(); 
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Forbidden. Admin access required.' });
    return;
  }
  next();
};