import express, { Router, RequestHandler } from 'express';
import * as notificationController from '../controllers/notificationController';

const router: Router = express.Router();

// Get all notifications
router.get('/', notificationController.getNotifications as RequestHandler);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount as RequestHandler);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead as RequestHandler);

// Mark all as read
router.patch('/', notificationController.markAllAsRead as RequestHandler);

export default router;
