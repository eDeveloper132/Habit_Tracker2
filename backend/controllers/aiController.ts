import { Request, Response } from 'express';
import Habit from '../models/Habit.js';
import AIService from '../services/aiService.js';

// Get AI-generated habit recommendations
export const getHabitRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
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
};

// Get AI-generated insights for a specific habit
export const getHabitInsights = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    // Validate habit belongs to user
    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    // Get AI analysis for this specific habit
    const aiService = AIService.getInstance();
    const insights = await aiService.analyzeHabitTiming(userId, id);
    
    res.status(200).json({
      message: 'Habit insights generated successfully',
      insights
    });
  } catch (error) {
    console.error('Error getting habit insights:', error);
    res.status(500).json({ message: 'Server error while generating habit insights' });
  }
};

// Get personalized AI insights for user
export const getPersonalizedInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
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
};

// Predict habit success probability
export const predictHabitSuccess = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { habitData } = req.body;
    
    // Get success probability prediction
    const aiService = AIService.getInstance();
    const successProbability = await aiService.predictHabitSuccess(userId, habitData);
    
    res.status(200).json({
      message: 'Success probability calculated',
      successProbability,
      probabilityPercentage: Math.round(successProbability * 100)
    });
  } catch (error) {
    console.error('Error predicting habit success:', error);
    res.status(500).json({ message: 'Server error while predicting habit success' });
  }
};