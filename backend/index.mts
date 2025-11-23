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

// Initialize database connections
await connectDB();
console.log(chalk.green('MongoDB connected successfully'));

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

const port = process.env.PORT || 2500;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(port, () => {
    console.log(chalk.green(`Server is running at http://localhost:${port}`));
  });
}

export default app;