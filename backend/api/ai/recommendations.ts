// api/ai/recommendations.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import connectDB from '../../db/connection/db.ts';
import Habit from '../../models/Habit.ts';
import AIService from '../../services/aiService.ts';

interface JwtPayload {
  id: string;
}

export default async function aiRecommendationsHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Connect to database
  await connectDB();
  
  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');

  let decoded: JwtPayload;
  try {
    // Verify token
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as JwtPayload;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }

  const userId = decoded.id;
  
  try {
    // Get user's current habits
    const habits = await Habit.find({ userId, isActive: true });
    
    // Get AI recommendations
    const aiService = AIService.getInstance();
    const recommendations = await aiService.generateHabitRecommendations(userId, habits);
    
    res.status(200).json({
      message: 'AI recommendations generated successfully',
      recommendations
    });
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    res.status(500).json({ message: 'Server error while generating AI recommendations' });
  }
}