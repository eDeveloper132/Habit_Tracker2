// api/ai/insights.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import connectDB from '../../db/connection/db.ts';
import Habit from '../../models/Habit.ts';
import AIService from '../../services/aiService.ts';

interface JwtPayload {
  id: string;
}

export default async function aiInsightsHandler(req: VercelRequest, res: VercelResponse) {
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

  if (req.method === 'GET') {
    // Get personalized AI insights for user
    try {
      // Get personalized AI insights
      const aiService = AIService.getInstance();
      const insights = await aiService.generatePersonalizedInsights(userId);
      
      res.status(200).json({
        message: 'Personalized insights generated successfully',
        insights
      });
    } catch (error) {
      console.error('Error getting personalized insights:', error);
      res.status(500).json({ message: 'Server error while generating personalized insights' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}