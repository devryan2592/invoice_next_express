import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { prisma } from '@/utils/db';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Basic route
app.get('/', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$connect();
    res.json({ 
      message: 'Welcome to the Express TypeScript API',
      database: 'Connected successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Welcome to the Express TypeScript API',
      database: 'Connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 