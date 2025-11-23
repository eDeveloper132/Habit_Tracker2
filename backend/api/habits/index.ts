// api/habits/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import connectDB from '../../db/connection/db.ts';
import Habit from '../../models/Habit.ts';
import User from '../../models/User.ts';

interface JwtPayload {
  id: string;
}

export default async function habitsHandler(req: VercelRequest, res: VercelResponse) {
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
    // Get all habits for a user
    try {
      const habits = await Habit.find({ userId, isActive: true })
        .sort({ createdAt: -1 });

      res.status(200).json({
        habits
      });
    } catch (error) {
      console.error('Get habits error:', error);
      res.status(500).json({ message: 'Server error during fetching habits' });
    }
  } else if (req.method === 'POST') {
    // Create a new habit
    try {
      const { name, description, frequency, target, reminderTime } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({ message: 'Habit name is required' });
      }

      // Create new habit
      const newHabit = new Habit({
        userId,
        name,
        description,
        frequency: frequency || 'daily',
        target: target || 1,
        reminderTime
      });

      const savedHabit = await newHabit.save();

      // Add habit to user's habits array
      await User.findByIdAndUpdate(userId, {
        $push: { habits: savedHabit._id }
      });

      res.status(201).json({
        message: 'Habit created successfully',
        habit: savedHabit
      });
    } catch (error) {
      console.error('Create habit error:', error);
      res.status(500).json({ message: 'Server error during habit creation' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}