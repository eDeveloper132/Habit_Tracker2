// api/habits/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import connectDB from '../../db/connection/db.ts';
import Habit from '../../models/Habit.ts';
import User from '../../models/User.ts';

interface JwtPayload {
  id: string;
}

export default async function habitByIdHandler(req: VercelRequest, res: VercelResponse) {
  const {
    query: { id },
    method,
  } = req;

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

  switch (method) {
    case 'GET':
      // Get a specific habit by ID
      try {
        const habit = await Habit.findOne({ _id: id, userId });

        if (!habit) {
          return res.status(404).json({ message: 'Habit not found' });
        }

        res.status(200).json({
          habit
        });
      } catch (error) {
        console.error('Get habit by ID error:', error);
        res.status(500).json({ message: 'Server error' });
      }
      break;
    case 'PUT':
      // Update a habit
      try {
        const { name, description, frequency, target, reminderTime, isActive } = req.body;

        const habit = await Habit.findOne({ _id: id, userId });
        if (!habit) {
          return res.status(404).json({ message: 'Habit not found' });
        }

        // Update fields if provided
        if (name) habit.name = name;
        if (description !== undefined) habit.description = description;
        if (frequency) habit.frequency = frequency;
        if (target) habit.target = target;
        if (reminderTime !== undefined) habit.reminderTime = reminderTime;
        if (isActive !== undefined) habit.isActive = isActive;

        const updatedHabit = await habit.save();

        res.status(200).json({
          message: 'Habit updated successfully',
          habit: updatedHabit
        });
      } catch (error) {
        console.error('Update habit error:', error);
        res.status(500).json({ message: 'Server error' });
      }
      break;
    case 'DELETE':
      // Delete a habit
      try {
        const habit = await Habit.findOne({ _id: id, userId });
        if (!habit) {
          return res.status(404).json({ message: 'Habit not found' });
        }

        // Set habit as inactive instead of hard deleting
        habit.isActive = false;
        await habit.save();

        // Remove habit from user's habits array
        await User.findByIdAndUpdate(userId, {
          $pull: { habits: habit._id }
        });

        res.status(200).json({
          message: 'Habit deleted successfully'
        });
      } catch (error) {
        console.error('Delete habit error:', error);
        res.status(500).json({ message: 'Server error' });
      }
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}