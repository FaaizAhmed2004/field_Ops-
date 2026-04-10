import React, { useState, useEffect, FC } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI } from '../../lib/api';
import JobCard from '../../components/common/JobCard';

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

const AdminJobs: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    fetchJobs();
  }, [user, router, status, search]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getAll({
        status: status || undefined,
        search: search || undefined,
        limit: 50,
      });
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Jobs Management</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              className="input"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              title="Filter jobs by status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => router.push('/admin/jobs/new')}
              className="btn btn-primary w-full"
            >
              + New Job
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No jobs found</div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">{jobs.length} job(s) found</p>
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              role="admin"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
