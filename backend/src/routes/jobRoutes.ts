import express, { Router, RequestHandler } from 'express';
import * as jobController from '../controllers/jobController';
import { authorize } from '../middleware/auth';

const router: Router = express.Router();

// Admin and Technician can create jobs
router.post('/', authorize('admin'), jobController.createJob as RequestHandler);

// Everyone can view jobs (filtered by role)
router.get('/', jobController.getJobs as RequestHandler);

// Get job by ID
router.get('/:id', jobController.getJobById as RequestHandler);

// Assign job to technician (admin only)
router.patch('/:id/assign', authorize('admin'), jobController.assignJob as RequestHandler);

// Update job status
router.patch('/:id/status', jobController.updateJobStatus as RequestHandler);

// Add note
router.post('/:id/notes', jobController.addNote as RequestHandler);

// Delete job (admin only)
router.delete('/:id', authorize('admin'), jobController.deleteJob as RequestHandler);

export default router;
