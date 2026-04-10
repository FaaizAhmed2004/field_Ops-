import React, { useState, useEffect, FC } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI } from '../../lib/api';
import JobCard from '../../components/common/JobCard';

interface Job {
  _id: string;
  title: string;
  status: 'draft' | 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'archived';
  jobNumber: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  clientId?: { _id: string; name: string };
  assignedTechnicianId?: { _id: string; name: string };
  scheduledDate?: string;
}

const ClientPortal: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'client') {
      router.push('/auth/login');
      return;
    }

    fetchJobs();
  }, [user, router, status]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getAll({
        status: status || undefined,
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Service Requests</h1>

      {/* Status Filter */}
      <div className="card mb-6">
        <div className="space-x-2">
          {['scheduled', 'assigned', 'in_progress', 'completed', ''].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`btn ${status === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">Loading your jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No {status} jobs found</p>
          <p className="text-sm text-gray-400">
            Contact us to request a new service
          </p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">{jobs.length} job(s)</p>
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              role="client"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
