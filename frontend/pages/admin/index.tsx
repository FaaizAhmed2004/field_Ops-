import React, { useState, useEffect, FC } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../lib/api';

interface JobStats {
  total: number;
  byStatus: Record<string, number>;
}

interface UserStats {
  total: number;
  technicians: number;
  clients: number;
}

interface DashboardStats {
  jobs: JobStats;
  users: UserStats;
  timestamp: string;
}

const AdminDashboard: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role !== 'admin') {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await adminAPI.getDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12">Failed to load dashboard</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={() => router.push('/admin/jobs/new')}
          className="btn btn-primary"
        >
          + New Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-gray-600">Total Jobs</p>
          <p className="text-3xl font-bold text-blue-600">{stats.jobs.total}</p>
        </div>
        <div className="card">
          <p className="text-gray-600">Assigned</p>
          <p className="text-3xl font-bold text-blue-600">{stats.jobs.byStatus.assigned || 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.jobs.byStatus.in_progress || 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.jobs.byStatus.completed || 0}</p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-gray-600">Total Users</p>
          <p className="text-3xl font-bold">{stats.users.total}</p>
        </div>
        <div className="card">
          <p className="text-gray-600">Technicians</p>
          <p className="text-3xl font-bold text-blue-600">{stats.users.technicians}</p>
        </div>
        <div className="card">
          <p className="text-gray-600">Clients</p>
          <p className="text-3xl font-bold text-green-600">{stats.users.clients}</p>
        </div>
      </div>

      {/* Job Status Breakdown */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Job Status Breakdown</h2>
        <div className="space-y-2">
          {Object.entries(stats.jobs.byStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center">
              <span className="text-gray-700">{status.replace('_', ' ')}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded h-2">
                  {/* stylelint-disable-next-line */}
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{
                      width: `${(count / stats.jobs.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-gray-800 font-semibold w-8">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
