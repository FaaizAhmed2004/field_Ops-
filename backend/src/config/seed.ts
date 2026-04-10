import { User } from '../models/User';
import { Job } from '../models/Job';
import { Notification } from '../models/Notification';
import { ActivityLog } from '../models/ActivityLog';
import bcrypt from 'bcryptjs';

export const seedDatabase = async (): Promise<void> => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('✓ Database already seeded, skipping');
      return;
    }

    console.log('Seeding database with sample data...');

    // Create users
    const hashedAdminPassword = await bcrypt.hash('Admin@123!', 10);
    const hashedTechPassword = await bcrypt.hash('Tech@123!', 10);
    const hashedClientPassword = await bcrypt.hash('Client@123!', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@fieldops.local',
      passwordHash: hashedAdminPassword,
      role: 'admin',
      status: 'active',
      phone: '+1-555-0100',
    });

    const tech1 = await User.create({
      name: 'John Technician',
      email: 'tech@fieldops.local',
      passwordHash: hashedTechPassword,
      role: 'technician',
      status: 'active',
      phone: '+1-555-0101',
    });

    const tech2 = await User.create({
      name: 'Jane Helper',
      email: 'jane.tech@fieldops.local',
      passwordHash: hashedTechPassword,
      role: 'technician',
      status: 'active',
      phone: '+1-555-0102',
    });

    const client1 = await User.create({
      name: 'Acme Corp',
      email: 'client@fieldops.local',
      passwordHash: hashedClientPassword,
      role: 'client',
      status: 'active',
      phone: '+1-555-0200',
    });

    const client2 = await User.create({
      name: 'Tech Solutions Inc',
      email: 'tech.solutions@fieldops.local',
      passwordHash: hashedClientPassword,
      role: 'client',
      status: 'active',
      phone: '+1-555-0201',
    });

    // Create jobs
    const job1 = await Job.create({
      jobNumber: 'JOB-001',
      title: 'HVAC System Repair',
      description: 'Fix non-responsive air conditioning unit in main office',
      status: 'assigned',
      clientId: client1._id,
      assignedTechnicianId: tech1._id,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      location: {
        address: '123 Business Ave, Tech City, TC 45678',
        lat: 40.7128,
        lng: -74.006,
      },
      priority: 'high',
      estimatedDuration: 120,
      tags: ['hvac', 'repair', 'urgent'],
      createdBy: admin._id,
    });

    const job2 = await Job.create({
      jobNumber: 'JOB-002',
      title: 'Network Installation',
      description: 'Install new ethernet cabling and network switches',
      status: 'scheduled',
      clientId: client2._id,
      assignedTechnicianId: null,
      scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // day after tomorrow
      location: {
        address: '456 Enterprise Blvd, Innovation Park, IP 12345',
        lat: 40.758,
        lng: -73.9855,
      },
      priority: 'medium',
      estimatedDuration: 240,
      tags: ['networking', 'installation'],
      createdBy: admin._id,
    });

    const job3 = await Job.create({
      jobNumber: 'JOB-003',
      title: 'Electrical Inspection',
      description: 'Annual safety inspection of electrical systems',
      status: 'in_progress',
      clientId: client1._id,
      assignedTechnicianId: tech2._id,
      scheduledDate: new Date(),
      location: {
        address: '123 Business Ave, Tech City, TC 45678',
        lat: 40.7128,
        lng: -74.006,
      },
      priority: 'low',
      estimatedDuration: 90,
      tags: ['electrical', 'inspection'],
      createdBy: admin._id,
    });

    // Add notes to job3
    job3.notes.push({
      content: 'Started inspection, main panel in good condition',
      createdBy: tech2._id,
    } as any);
    await job3.save();

    // Create notifications
    await Notification.create({
      userId: tech1._id,
      type: 'job_assigned',
      title: 'New Job Assigned',
      message: 'HVAC System Repair job assigned to you',
      relatedEntityType: 'job',
      relatedEntityId: job1._id,
      read: false,
    });

    await Notification.create({
      userId: client1._id,
      type: 'status_changed',
      title: 'Job In Progress',
      message: 'Your Electrical Inspection has started',
      relatedEntityType: 'job',
      relatedEntityId: job3._id,
      read: false,
    });

    // Create activity logs
    await ActivityLog.create({
      userId: admin._id,
      action: 'created',
      entityType: 'job',
      entityId: job1._id,
      changes: { title: 'HVAC System Repair', status: 'scheduled' },
    });

    await ActivityLog.create({
      userId: admin._id,
      action: 'assigned',
      entityType: 'job',
      entityId: job1._id,
      changes: { assignedTechnicianId: tech1._id.toString() },
    });

    console.log('✓ Seeded database with sample data');
  } catch (error: any) {
    console.error('✗ Error seeding database:', error);
  }
};
