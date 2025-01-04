import 'module-alias/register';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { prisma } from '@/utils/db';
import { logger, morganMiddleware, logHelpers } from '@/utils/logger';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morganMiddleware); // Add HTTP request logging

// Basic route
app.get('/', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$connect();
    logHelpers.success('Database connection test successful');
    res.json({ 
      message: 'Welcome to the Express TypeScript API',
      database: 'Connected successfully'
    });
  } catch (error) {
    logHelpers.error('Database connection test failed', error);
    res.status(500).json({ 
      message: 'Welcome to the Express TypeScript API',
      database: 'Connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logHelpers.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logHelpers.error('Unhandled Rejection', reason);
  process.exit(1);
});

// Start the server
app.listen(port, () => {
  logHelpers.success(`Server is running at http://localhost:${port}`, {
    port,
    environment: process.env.NODE_ENV
  });
}); 