// api/index.ts - Main API handler for Vercel
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This is just a placeholder since we're handling API routes individually
  res.status(200).json({ message: 'Habit Tracker API is running!' });
}