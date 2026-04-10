import { Request, Response, NextFunction } from 'express';
import * as jobService from '../services/jobService';
import { User } from '../models/User';
import mongoose from 'mongoose';

interface AdminRequest extends Request {
  user?: {
    userId: mongoose.Types.ObjectId;
    email: string;
    role: string;
    name: string;
  };
}

// Get dashboard stats
export const getDashboard = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await jobService.getJobStats();

    // Get user stats
    const totalUsers = await User.countDocuments({ status: 'active' });
    const technicians = await User.countDocuments({ status: 'active', role: 'technician' });
    const clients = await User.countDocuments({ status: 'active', role: 'client' });

    res.json({
      jobs: stats,
      users: {
        total: totalUsers,
        technicians,
        clients,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

// Get technicians
export const getTechnicians = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const technicians = await User.find({
      role: 'technician',
      status: 'active',
    }).select('_id name email phone lastLogin');

    res.json(technicians);
  } catch (error) {
    next(error);
  }
};

// Get clients
export const getClients = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clients = await User.find({
      role: 'client',
      status: 'active',
    }).select('_id name email phone');

    res.json(clients);
  } catch (error) {
    next(error);
  }
};
