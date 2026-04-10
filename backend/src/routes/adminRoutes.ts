import express, { Router, RequestHandler } from 'express';
import * as adminController from '../controllers/adminController';
import { authorize } from '../middleware/auth';

const router: Router = express.Router();

// All routes require admin role
router.use(authorize('admin'));

// Get dashboard stats
router.get('/dashboard', adminController.getDashboard as RequestHandler);

// Get technicians
router.get('/technicians', adminController.getTechnicians as RequestHandler);

// Get clients
router.get('/clients', adminController.getClients as RequestHandler);

export default router;
