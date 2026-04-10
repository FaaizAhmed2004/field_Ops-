import React, { useState, useEffect, FC, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI } from '../../lib/api';

interface JobNote {
  _id: string;
  content: string;
  createdBy?: { name: string };
  createdAt: string;
}

interface JobDetail {
  _id: string;
  title: string;
  jobNumber: string;
  status: string;
  description: string;
  priority: string;
  estimatedDuration: number;
  location?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  tags?: string[];
  clientId?: { _id: string; name: string };
  assignedTechnicianId?: { _id: string; name: string };
  createdBy?: { _id: string; name: string };
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  notes?: JobNote[];
}

const JobDetail: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (id && typeof id === 'string') {
      fetchJob();
    }
  }, [id, user, router]);

  const fetchJob = async () => {
    try {
      const response = await jobsAPI.getById(id as string);
      setJob(response.data);
    } catch (error: any) {
      setError('Failed to load job');
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await jobsAPI.updateStatus(id as string, newStatus);
      setJob(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const response = await jobsAPI.addNote(id as string, newNote);
      setJob(response.data);
      setNewNote('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add note');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading job...</div>;
  }

  if (!job) {
    return <div className="text-center py-12 text-red-600">Job not found</div>;
  }

  const canUpdateStatus = user?.role === 'admin' || user?.role === 'technician';

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 text-blue-600 hover:underline">
        &larr; Back
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Details */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
                <p className="text-gray-500">{job.jobNumber}</p>
              </div>
              <span className={`badge badge-${job.status === 'completed' ? 'success' : job.status === 'in_progress' ? 'warning' : 'info'}`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{job.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-sm">Client</p>
                <p className="font-semibold">{job.clientId?.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Priority</p>
                <p className={`font-semibold ${job.priority === 'high' ? 'text-red-600' : job.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {job.priority}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Assigned To</p>
                <p className="font-semibold">{job.assignedTechnicianId?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Est. Duration</p>
                <p className="font-semibold">{job.estimatedDuration} min</p>
              </div>
            </div>

            {job.location?.address && (
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Location</p>
                <p className="font-semibold">{job.location.address}</p>
              </div>
            )}

            {job.tags && job.tags.length > 0 && (
              <div>
                <p className="text-gray-500 text-sm mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="badge badge-info">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Updates */}
          {canUpdateStatus && (
            <div className="card mb-6">
              <h3 className="font-semibold mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {['assigned', 'in_progress', 'completed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating || job.status === s}
                    className={`btn ${job.status === s ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card">
            <h3 className="font-semibold mb-4">Notes & Updates</h3>

            <form onSubmit={handleAddNote} className="mb-4 pb-4 border-b">
              <textarea
                className="input h-20"
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button
                type="submit"
                disabled={updating || !newNote.trim()}
                className="btn btn-primary btn-sm mt-2"
              >
                {updating ? 'Adding...' : 'Add Note'}
              </button>
            </form>

            <div className="space-y-3">
              {job.notes && job.notes.length > 0 ? (
                job.notes.map((note) => (
                  <div key={note._id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm">{note.createdBy?.name}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}{' '}
                        {new Date(note.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No notes yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card">
            <h3 className="font-semibold mb-4">Job Info</h3>
            <div className="space-y-3 text-sm">
              {job.scheduledDate && (
                <div>
                  <p className="text-gray-500">Scheduled Date</p>
                  <p className="font-semibold">
                    {new Date(job.scheduledDate).toLocaleDateString()} at{' '}
                    {new Date(job.scheduledDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              {job.completedDate && (
                <div>
                  <p className="text-gray-500">Completed</p>
                  <p className="font-semibold">
                    {new Date(job.completedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Created By</p>
                <p className="font-semibold">{job.createdBy?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-semibold">
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
