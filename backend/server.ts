import express from 'express';
import type { Request, Response } from 'express';
import chalk from 'chalk';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db/connection/db.js';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import PineconeService from './services/pineconeService.js';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connections when the server starts
try {
  await connectDB();
  console.log(chalk.green('MongoDB connected successfully'));
} catch (error) {
  console.error(chalk.red('MongoDB connection error:'), error);
  process.exit(1);
}

// Initialize Pinecone
try {
  const pineconeService = PineconeService.getInstance();
  await pineconeService.initializeIndex();
  console.log(chalk.blue('Pinecone initialized successfully'));
} catch (error) {
  console.error(chalk.red('Error initializing Pinecone:'), error);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Habit Tracker API is running!');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;