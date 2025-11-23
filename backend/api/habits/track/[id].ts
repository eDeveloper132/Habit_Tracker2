// api/habits/track/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import connectDB from '../../../db/connection/db.ts';
import Habit from '../../../models/Habit.ts';
import HabitCompletion from '../../../models/HabitCompletion.ts';
import User from '../../../models/User.ts';
import PineconeService from '../../../services/pineconeService.ts';

interface JwtPayload {
  id: string;
}

export default async function trackHabitHandler(req: VercelRequest, res: VercelResponse) {
  const {
    query: { id },
    method,
    body
  } = req;

  if (method !== 'POST') {
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

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid habit ID' });
  }

  const { completed, notes, duration, context } = body;

  try {
    // Validate habit exists and belongs to user
    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Create or update completion record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    let completion = await HabitCompletion.findOne({
      habitId: id,
      userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of day
      }
    });

    if (completion) {
      // Update existing completion
      completion.completed = completed !== undefined ? completed : true;
      if (notes !== undefined) completion.notes = notes;
      if (duration !== undefined) completion.duration = duration;
      if (context !== undefined) completion.context = context;
    } else {
      // Create new completion
      completion = new HabitCompletion({
        userId,
        habitId: id,
        date: today,
        completed: completed !== undefined ? completed : true,
        notes,
        duration,
        context
      });
    }

    const savedCompletion = await completion.save();

    // Update habit streak if completed
    if (savedCompletion.completed) {
      // Update the habit's last completed date and streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if habit was completed yesterday to maintain streak
      const yesterdayCompletion = await HabitCompletion.findOne({
        habitId: id,
        userId,
        date: {
          $gte: yesterday,
          $lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
        },
        completed: true
      });

      if (yesterdayCompletion || habit.streak > 0) {
        habit.streak += 1;
      } else {
        habit.streak = 1; // Start new streak
      }
      
      habit.lastCompletedDate = new Date();
      await habit.save();
    }

    // Store habit completion data in Pinecone for AI analysis
    try {
      const pineconeService = PineconeService.getInstance();
      const inputData = {
        habitId: id,
        userId,
        completed: savedCompletion.completed,
        notes: savedCompletion.notes,
        duration: savedCompletion.duration,
        context: savedCompletion.context,
        date: savedCompletion.date,
        streak: habit.streak
      };
      
      const pineconeId = await pineconeService.upsertHabitData(userId, id, inputData);
      
      // Update the completion record with the Pinecone reference
      savedCompletion.pineconeReference = pineconeId;
      await savedCompletion.save();
    } catch (pineconeError) {
      console.error('Error storing habit data in Pinecone:', pineconeError);
      // Don't fail the entire operation if Pinecone fails, just log the error
    }

    res.status(200).json({
      message: 'Habit tracked successfully',
      completion: savedCompletion
    });
  } catch (error) {
    console.error('Track habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}