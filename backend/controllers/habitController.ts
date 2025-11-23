import type { Request, Response } from 'express';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import User from '../models/User.js';
import PineconeService from '../services/pineconeService.js';

// Create a new habit
export const createHabit = async (req: Request, res: Response) => {
  try {
    const { name, description, frequency, target, reminderTime } = req.body;
    const userId = (req as any).user.id;

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
};

// Get all habits for a user
export const getHabits = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const habits = await Habit.find({ userId, isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      habits
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Server error during fetching habits' });
  }
};

// Get a specific habit by ID
export const getHabitById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    if (!id || !userId) {
      return res.status(400).json({ message: 'Habit ID and User ID are required' });
    }

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
};

// Update a habit
export const updateHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    if (!id || !userId) {
      return res.status(400).json({ message: 'Habit ID and User ID are required' });
    }
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
};

// Delete a habit
export const deleteHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    if (!id || !userId) {
      return res.status(400).json({ message: 'Habit ID and User ID are required' });
    }

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
};

// Track habit completion
export const trackHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    if (!id || !userId) {
      return res.status(400).json({ message: 'Habit ID and User ID are required' });
    }
    const { completed, notes, duration, context } = req.body;

    // Validate habit exists and belongs to user
    const habit = await Habit.findOne({ _id: id, userId: userId });
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
};

// Get habit history
export const getHabitHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    if (!id || !userId) {
      return res.status(400).json({ message: 'Habit ID and User ID are required' });
    }

    // Validate habit exists and belongs to user
    const habit = await Habit.findOne({ _id: id, userId: userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Get completions for the habit
    const completions = await HabitCompletion.find({
      habitId: id,
      userId
    }).sort({ date: -1 }).limit(30); // Last 30 days

    res.status(200).json({
      habit,
      completions
    });
  } catch (error) {
    console.error('Get habit history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};