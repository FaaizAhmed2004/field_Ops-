import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: mongoose.Types.ObjectId;
    email: string;
    role: string;
    name: string;
  };
}

// Register controller
export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const result = await authService.register({
      email,
      password,
      name,
      role: req.body.role || 'client',
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Login controller
export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Missing email or password' });
      return;
    }

    const result = await authService.login({ email, password });

    // Set refresh token as httpOnly cookie (optional)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Refresh token controller
export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }

    const tokens = await authService.refreshAccessToken(token);

    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

// Logout controller
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// Get current user
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(req.user);
};
