import { Job, IJob, IJobNote } from '../models/Job';
import { User, IUser } from '../models/User';
import { ActivityLog, IActivityLog } from '../models/ActivityLog';
import { Notification, INotification } from '../models/Notification';
import mongoose from 'mongoose';

interface CreateJobInput {
  title: string;
  description?: string;
  clientId: mongoose.Types.ObjectId;
  scheduledDate?: Date;
  location?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  priority?: 'low' | 'medium' | 'high';
  estimatedDuration?: number;
  tags?: string[];
  createdBy: mongoose.Types.ObjectId;
}

interface GetJobsInput {
  userId: mongoose.Types.ObjectId;
  role: 'admin' | 'technician' | 'client';
  status?: string;
  clientId?: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  limit?: number;
  offset?: number;
  search?: string;
}

interface GetJobsResponse {
  jobs: IJob[];
  total: number;
  limit: number;
  offset: number;
}

interface AssignJobInput {
  jobId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
}

interface UpdateJobStatusInput {
  jobId: mongoose.Types.ObjectId;
  newStatus: 'draft' | 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'archived';
  updatedBy: mongoose.Types.ObjectId;
}

interface AddJobNoteInput {
  jobId: mongoose.Types.ObjectId;
  content: string;
  createdBy: mongoose.Types.ObjectId;
}

interface JobStats {
  total: number;
  byStatus: Record<string, number>;
}

// Create job
export const createJob = async (input: CreateJobInput): Promise<IJob> => {
  const job = await Job.create({
    title: input.title,
    description: input.description || '',
    clientId: input.clientId,
    scheduledDate: input.scheduledDate,
    location: input.location,
    priority: input.priority || 'medium',
    estimatedDuration: input.estimatedDuration || 60,
    tags: input.tags || [],
    createdBy: input.createdBy,
    status: 'draft',
  });

  // Log activity
  await ActivityLog.create({
    userId: input.createdBy,
    action: 'created',
    entityType: 'job',
    entityId: job._id,
    changes: { status: 'draft', title: input.title },
  });

  return job;
};

// Get jobs (with filtering based on role)
export const getJobs = async (input: GetJobsInput): Promise<GetJobsResponse> => {
  const { userId, role, status, clientId, technicianId, limit = 20, offset = 0, search } = input;
  
  let query: any = { deletedAt: null };

  // Role-based filtering
  if (role === 'client') {
    query.clientId = userId;
  } else if (role === 'technician') {
    query.assignedTechnicianId = userId;
  }

  // Additional filters
  if (status) query.status = status;
  if (clientId) query.clientId = clientId;
  if (technicianId) query.assignedTechnicianId = technicianId;

  // Search in title/description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('clientId', 'name email phone')
    .populate('assignedTechnicianId', 'name email phone')
    .populate('createdBy', 'name email')
    .populate('notes.createdBy', 'name email')
    .limit(limit)
    .skip(offset)
    .sort({ createdAt: -1 });

  return { jobs, total, limit, offset };
};

// Get job by ID
export const getJobById = async (jobId: mongoose.Types.ObjectId): Promise<IJob> => {
  const job = await Job.findById(jobId)
    .populate('clientId', 'name email phone')
    .populate('assignedTechnicianId', 'name email phone')
    .populate('createdBy', 'name email')
    .populate('notes.createdBy', 'name email');

  if (!job || job.deletedAt) {
    throw new Error('Job not found');
  }

  return job;
};

// Assign job to technician
export const assignJob = async (input: AssignJobInput): Promise<IJob> => {
  const { jobId, technicianId, assignedBy } = input;

  const job = await Job.findById(jobId);
  if (!job || job.deletedAt) {
    throw new Error('Job not found');
  }

  const technician = await User.findById(technicianId);
  if (!technician || technician.role !== 'technician') {
    throw new Error('Invalid technician');
  }

  const previousTechnicianId = job.assignedTechnicianId;
  job.assignedTechnicianId = technicianId;
  job.status = 'assigned';
  await job.save();

  // Log activity
  await ActivityLog.create({
    userId: assignedBy,
    action: 'assigned',
    entityType: 'job',
    entityId: job._id,
    changes: {
      previousTechnicianId: previousTechnicianId?.toString(),
      assignedTechnicianId: technicianId.toString(),
      status: 'assigned',
    },
  });

  // Notify technician
  await Notification.create({
    userId: technicianId,
    type: 'job_assigned',
    title: 'New Job Assigned',
    message: `You have been assigned: ${job.title}`,
    relatedEntityType: 'job',
    relatedEntityId: job._id,
  });

  return job.populate('assignedTechnicianId', 'name email phone') as Promise<IJob>;
};

// Update job status
export const updateJobStatus = async (input: UpdateJobStatusInput): Promise<IJob> => {
  const { jobId, newStatus, updatedBy } = input;

  const job = await Job.findById(jobId);
  if (!job || job.deletedAt) {
    throw new Error('Job not found');
  }

  const previousStatus = job.status;
  job.status = newStatus;

  if (newStatus === 'completed') {
    job.completedDate = new Date();
  }

  await job.save();

  // Log activity
  await ActivityLog.create({
    userId: updatedBy,
    action: 'status_changed',
    entityType: 'job',
    entityId: job._id,
    changes: {
      previousStatus,
      newStatus,
    },
  });

  // Notify relevant parties
  const notificationUsers = [job.clientId];
  if (job.assignedTechnicianId) {
    notificationUsers.push(job.assignedTechnicianId);
  }

  for (const userId of notificationUsers) {
    if (userId) {
      await Notification.create({
        userId,
        type: 'status_changed',
        title: `Job Status Updated: ${newStatus}`,
        message: `${job.title} status changed to ${newStatus}`,
        relatedEntityType: 'job',
        relatedEntityId: job._id,
      });
    }
  }

  return job;
};

// Add note to job
export const addJobNote = async (input: AddJobNoteInput): Promise<IJob> => {
  const { jobId, content, createdBy } = input;

  const job = await Job.findById(jobId);
  if (!job || job.deletedAt) {
    throw new Error('Job not found');
  }

  job.notes.push({
    content,
    createdBy,
  } as IJobNote);

  await job.save();

  // Notify other parties
  const notificationUsers = [job.clientId];
  if (job.assignedTechnicianId && !job.assignedTechnicianId.equals(createdBy)) {
    notificationUsers.push(job.assignedTechnicianId);
  }

  for (const userId of notificationUsers) {
    if (userId) {
      await Notification.create({
        userId,
        type: 'job_updated',
        title: 'Job Note Added',
        message: `New note added to ${job.title}`,
        relatedEntityType: 'job',
        relatedEntityId: job._id,
      });
    }
  }

  return job;
};

// Delete job (soft delete)
export const deleteJob = async (jobId: mongoose.Types.ObjectId, deletedBy: mongoose.Types.ObjectId): Promise<IJob> => {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { deletedAt: new Date() },
    { new: true }
  );

  if (!job) {
    throw new Error('Job not found');
  }

  // Log activity
  await ActivityLog.create({
    userId: deletedBy,
    action: 'deleted',
    entityType: 'job',
    entityId: job._id,
    changes: { deletedAt: job.deletedAt },
  });

  return job;
};

// Get job statistics for admin
export const getJobStats = async (): Promise<JobStats> => {
  const stats = await Job.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await Job.countDocuments({ deletedAt: null });

  return {
    total,
    byStatus: stats.reduce((acc: Record<string, number>, s: any) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
  };
};
