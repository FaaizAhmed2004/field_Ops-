import mongoose, { Document, Schema } from 'mongoose';

export interface IJobNote {
  _id?: mongoose.Types.ObjectId;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IJobLocation {
  address: string;
  lat?: number | null;
  lng?: number | null;
}

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  jobNumber: string;
  title: string;
  description: string;
  status: 'draft' | 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'archived';
  clientId: mongoose.Types.ObjectId;
  assignedTechnicianId?: mongoose.Types.ObjectId | null;
  scheduledDate?: Date | null;
  completedDate?: Date | null;
  location: IJobLocation;
  notes: IJobNote[];
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    jobNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'assigned', 'in_progress', 'completed', 'archived'],
      default: 'draft',
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTechnicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    scheduledDate: {
      type: Date,
      default: null,
      index: true,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    location: {
      address: {
        type: String,
        default: '',
      },
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    notes: [
      {
        _id: Schema.Types.ObjectId,
        content: String,
        createdBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 60,
    },
    tags: [String],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
jobSchema.index({ clientId: 1 });
jobSchema.index({ assignedTechnicianId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ scheduledDate: 1 });
jobSchema.index({ createdAt: -1 });

// Pre-save hook to auto-generate jobNumber
jobSchema.pre('save', async function (next) {
  if (this.isNew && !this.jobNumber) {
    const count = await mongoose.model('Job').countDocuments();
    this.jobNumber = `JOB-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Job = mongoose.model<IJob>('Job', jobSchema);
