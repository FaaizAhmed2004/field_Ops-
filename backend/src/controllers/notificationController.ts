import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notificationService';
import mongoose from 'mongoose';

interface NotificationRequest extends Request {
  user?: {
    userId: mongoose.Types.ObjectId;
    email: string;
    role: string;
    name: string;
  };
}

// Get notifications
export const getNotifications = async (req: NotificationRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      limit = '20',
      offset = '0',
      unreadOnly = 'false',
    } = req.query;

    const result = await notificationService.getUserNotifications({
      userId: req.user!.userId,
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
      unreadOnly: (unreadOnly as string) === 'true',
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req: NotificationRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(new mongoose.Types.ObjectId(id));
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// Mark all as read
export const markAllAsRead = async (req: NotificationRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get unread count
export const getUnreadCount = async (req: NotificationRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await notificationService.getUnreadCount(req.user!.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
