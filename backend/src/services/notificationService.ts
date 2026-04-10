import { Notification, INotification } from '../models/Notification';
import mongoose from 'mongoose';

interface GetUserNotificationsInput {
  userId: mongoose.Types.ObjectId;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

interface NotificationsResponse {
  notifications: INotification[];
  total: number;
  limit: number;
  offset: number;
}

interface UnreadCountResponse {
  unreadCount: number;
}

interface CleanupResponse {
  deletedCount: number;
}

// Get user notifications
export const getUserNotifications = async (input: GetUserNotificationsInput): Promise<NotificationsResponse> => {
  const { userId, limit = 20, offset = 0, unreadOnly = false } = input;

  let query: any = { userId };
  if (unreadOnly) {
    query.read = false;
  }

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .limit(limit)
    .skip(offset)
    .sort({ createdAt: -1 });

  return { notifications, total, limit, offset };
};

// Mark notification as read
export const markAsRead = async (notificationId: mongoose.Types.ObjectId): Promise<INotification> => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { read: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
};

// Mark all notifications as read
export const markAllAsRead = async (userId: mongoose.Types.ObjectId): Promise<{ message: string }> => {
  await Notification.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );

  return { message: 'All notifications marked as read' };
};

// Get unread notification count
export const getUnreadCount = async (userId: mongoose.Types.ObjectId): Promise<UnreadCountResponse> => {
  const count = await Notification.countDocuments({
    userId,
    read: false,
  });

  return { unreadCount: count };
};

// Delete old notifications
export const cleanupOldNotifications = async (daysOld: number = 30): Promise<CleanupResponse> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true,
  });

  return { deletedCount: result.deletedCount || 0 };
};
