import { Request, Response, NextFunction } from 'express';
import * as jobService from '../services/jobService';
import mongoose from 'mongoose';

interface JobRequest extends Request {
  user?: {
    userId: mongoose.Types.ObjectId;
    email: string;
    role: 'admin' | 'technician' | 'client';
    name: string;
  };
}

// Create job
export const createJob = async (req: JobRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      description,
      clientId,
      scheduledDate,
      location,
      priority,
      estimatedDuration,
      tags,
    } = req.body;

    if (!title || !clientId) {
      res.status(400).json({ message: 'Title and client ID are required' });
      return;
    }

    const job = await jobService.createJob({
      title,
      description,
      clientId,
      scheduledDate,
      location,
      priority,
      estimatedDuration,
      tags,
      createdBy: req.user!.userId,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// Get jobs
export const getJobs = async (req: JobRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      status,
      clientId,
      technicianId,
      limit = '20',
      offset = '0',
      search,
    } = req.query;

    const result = await jobService.getJobs({
      userId: req.user!.userId,
      role: req.user!.role,
      status: status as string | undefined,
      clientId: clientId ? new mongoose.Types.ObjectId(clientId as string) : undefined,
      technicianId: technicianId ? new mongoose.Types.ObjectId(technicianId as string) : undefined,
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
      search: search as string | undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get job by ID
export const getJobById = async (req: JobRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await jobService.getJobById(new mongoose.Types.ObjectId(id));

    // Check access: only admin, client, or assigned technician can view
    if (
      req.user!.role !== 'admin' &&
      !job.clientId.equals(req.user!.userId) &&
      !job.assignedTechnicianId?.equals(req.user!.userId)
    ) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// Assign job
export const assignJob = async (req: JobRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    if (!technicianId) {
      res.status(400).json({ message: 'Technician ID required' });
      return;
    }

    const job = await jobService.assignJob({
      jobId: new mongoose.Types.ObjectId(id),
      technicianId: new mongoose.Types.ObjectId(technicianId),
      assignedBy: req.user!.userId,
    });

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// Update job status
export const updateJobStatus = async (req: JobRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const job = await jobService.updateJobStatus({
      jobId: new mongoose.Types.ObjectId(id),
      newStatus: status,
      updatedBy: req.user!.userId,
    });

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// Add note to job
export const addNote = async (req: JobRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Note content is required' });
      return;
    }

    const job = await jobService.addJobNote({
      jobId: new mongoose.Types.ObjectId(id),
      content,
      createdBy: req.user!.userId,
    });

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// Delete job
export const deleteJob = async (req: JobRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await jobService.deleteJob(new mongoose.Types.ObjectId(id), req.user!.userId);
    res.json({ message: 'Job deleted', job });
  } catch (error) {
    next(error);
  }
};
