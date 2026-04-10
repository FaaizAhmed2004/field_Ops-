import React, { FC } from 'react';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  description: string;
  jobNumber: string;
  status: 'draft' | 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  scheduledDate?: string;
  clientId?: {
    _id: string;
    name: string;
  };
  assignedTechnicianId?: {
    _id: string;
    name: string;
  };
}

interface JobCardProps {
  job: Job;
  role: string;
  onStatusClick?: (status: string) => void;
}

const JobCard: FC<JobCardProps> = ({ job, role, onStatusClick }) => {
  const statusColors: Record<string, string> = {
    draft: 'badge-info',
    scheduled: 'badge-warning',
    assigned: 'badge-info',
    in_progress: 'badge-warning',
    completed: 'badge-success',
    archived: 'badge-info',
  };

  const priorityColors: Record<string, string> = {
    low: 'text-gray-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  };

  return (
    <div className="card mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.jobNumber}</p>
        </div>
        <span className={`badge ${statusColors[job.status]}`}>
          {job.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3">{job.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Client: </span>
          <span className="text-gray-800">{job.clientId?.name || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500">Priority: </span>
          <span className={`font-semibold ${priorityColors[job.priority]}`}>
            {job.priority}
          </span>
        </div>
        {job.assignedTechnicianId && (
          <div>
            <span className="text-gray-500">Assigned To: </span>
            <span className="text-gray-800">{job.assignedTechnicianId.name}</span>
          </div>
        )}
        {job.scheduledDate && (
          <div>
            <span className="text-gray-500">Scheduled: </span>
            <span className="text-gray-800">
              {new Date(job.scheduledDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Link href={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
        {role === 'admin' && job.status === 'scheduled' && (
          <Link href={`/admin/jobs/${job._id}/assign`} className="btn btn-primary btn-sm">
            Assign
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobCard;
