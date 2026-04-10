import React, { useState, useEffect, ChangeEvent, FormEvent, FC } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { jobsAPI, adminAPI } from '../../../lib/api';

interface Client {
  _id: string;
  name: string;
  email: string;
}

interface LocationData {
  address: string;
  lat: string;
  lng: string;
}

interface FormDataType {
  title: string;
  description: string;
  clientId: string;
  scheduledDate: string;
  location: LocationData;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  tags: string;
}

const NewJob: FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    description: '',
    clientId: '',
    scheduledDate: '',
    location: {
      address: '',
      lat: '',
      lng: '',
    },
    priority: 'medium',
    estimatedDuration: 60,
    tags: '',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    fetchClients();
  }, [user, router]);

  const fetchClients = async () => {
    try {
      const response = await adminAPI.getClients();
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const key = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [key]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        estimatedDuration: parseInt(formData.estimatedDuration.toString()),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await jobsAPI.create(payload);
      router.push('/admin/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Job</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        {/* Basic Info */}
        <div className="mb-4">
          <label className="label">Job Title *</label>
          <input
            type="text"
            name="title"
            className="input"
            title="Enter the job title"
            placeholder="Enter job title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="label">Description</label>
          <textarea
            name="description"
            className="input h-24"
            title="Enter the job description"
            placeholder="Enter job description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Client *</label>
            <select
              name="clientId"
              className="input"
              title="Select a client"
              value={formData.clientId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Scheduled Date</label>
            <input
              type="datetime-local"
              name="scheduledDate"
              className="input"
              title="Select the scheduled date"
              value={formData.scheduledDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Location</h3>
          <div className="mb-3">
            <label className="label">Address</label>
            <input
              type="text"
              name="location.address"
              className="input"
              title="Enter the job address"
              placeholder="Enter address"
              value={formData.location.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude</label>
              <input
                type="number"
                step="0.0001"
                name="location.lat"
                className="input"
                title="Enter latitude"
                placeholder="e.g., 40.7128"
                value={formData.location.lat}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input
                type="number"
                step="0.0001"
                name="location.lng"
                className="input"
                title="Enter longitude"
                placeholder="e.g., -74.0060"
                value={formData.location.lng}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label">Priority</label>
            <select
              name="priority"
              className="input"
              title="Select job priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="label">Est. Duration (minutes)</label>
            <input
              type="number"
              name="estimatedDuration"
              className="input"
              title="Enter estimated duration in minutes"
              placeholder="e.g., 60"
              value={formData.estimatedDuration}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              className="input"
              title="Enter tags separated by commas"
              placeholder="repair, urgent"
              value={formData.tags}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Job'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewJob;
