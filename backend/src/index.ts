import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './config/database';
import { seedDatabase } from './config/seed';
import { errorHandler } from './middleware/errorHandler';
import requestLogger from './middleware/logger';
import { authenticate } from './middleware/auth';

// Routes
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Connect to database
const initializeServer = async (): Promise<void> => {
  try {
    // Connect MongoDB
    await connectDB();

    // Seed database if needed
    await seedDatabase();

    // Public routes (no auth required)
    app.use('/api/auth', authRoutes);

    // Protected API routes (auth required)
    app.use('/api/jobs', authenticate, jobRoutes);
    app.use('/api/notifications', authenticate, notificationRoutes);
    app.use('/api/admin', authenticate, adminRoutes);

    // Health check
    app.get('/api/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date() });
    });

    // 404 handler
    app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Error handler
    app.use(errorHandler);

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API Documentation: http://localhost:${PORT}/api`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('✓ Press Ctrl+C to stop\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    });
  } catch (error: any) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
initializeServer();

export default app;
