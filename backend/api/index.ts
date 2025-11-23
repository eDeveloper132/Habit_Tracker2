// api/index.ts - Vercel API route handler
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createRequestHandler } from 'vercel-express';

// Import all the routes
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import connectDB from './db/connection/db.js';
import PineconeService from './services/pineconeService.js';

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Initialize database connections
await connectDB();
console.log('MongoDB connected successfully');

// Initialize Pinecone
try {
  const pineconeService = PineconeService.getInstance();
  await pineconeService.initializeIndex();
  console.log('Pinecone initialized successfully');
} catch (error) {
  console.error('Error initializing Pinecone:', error);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api', (_, res) => {
  res.status(200).json({ message: 'Habit Tracker API is running!' });
});

// Create the handler
const handler = createRequestHandler(app);

export default async function (req: VercelRequest, res: VercelResponse) {
  // For Vercel deployment, ensure DB connection is alive
  try {
    return handler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}