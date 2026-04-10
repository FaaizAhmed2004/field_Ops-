import express, { Router, RequestHandler } from 'express';
import * as authController from '../controllers/authController';

const router: Router = express.Router();

// Public routes
router.post('/register', authController.register as RequestHandler);
router.post('/login', authController.login as RequestHandler);
router.post('/refresh', authController.refreshToken as RequestHandler);

// Protected routes (require authentication)
router.post('/logout', authController.logout as RequestHandler);
router.get('/me', authController.getCurrentUser as RequestHandler);

export default router;
