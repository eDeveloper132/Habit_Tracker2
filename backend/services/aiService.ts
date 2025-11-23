import OpenAI from 'openai';
import PineconeService from './pineconeService.js';
import type { IHabit } from '../models/Habit.js';
import type { IHabitCompletion } from '../models/HabitCompletion.js';

class AIService {
  private static instance: AIService;
  private openai: OpenAI;
  private pineconeService: PineconeService;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.pineconeService = PineconeService.getInstance();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Generate personalized habit recommendations based on user's history
  public async generateHabitRecommendations(userId: string, currentHabits: IHabit[]): Promise<any> {
    try {
      // Get similar user patterns from Pinecone
      const similarHabits = await this.pineconeService.querySimilarHabits(userId, '', 10);
      
      // Prepare data for AI analysis
      const userHabitData = currentHabits.map(habit => ({
        name: habit.name,
        frequency: habit.frequency,
        target: habit.target,
        streak: habit.streak,
        completionRate: this.calculateCompletionRate(habit)
      }));
      
      // Get historical data from Pinecone
      const historicalData = similarHabits.map(match => match.metadata);
      
      // Generate recommendations using OpenAI
      const prompt = `
        As a habit formation expert, analyze the following data about a user's habits and recommend improvements.
        
        Current user habits: ${JSON.stringify(userHabitData)}
        Historical patterns from similar users: ${JSON.stringify(historicalData)}
        
        Please provide:
        1. Recommendations for current habits
        2. Suggestions for new habits based on the user's pattern
        3. Optimal timing suggestions for existing habits
        4. Potential habit combinations that work well together
        5. Warnings about potential habit pitfalls
        
        Format your response as a JSON object with these categories.
      `;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{}';
      const recommendations = JSON.parse(content);
      
      return {
        timestamp: new Date(),
        userId,
        recommendations
      };
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      // Return a default recommendation in case of API error
      return {
        timestamp: new Date(),
        userId,
        recommendations: {
          message: 'AI recommendations temporarily unavailable, but your habits are on track!',
          generalTips: [
            'Try pairing new habits with existing ones',
            'Start small and gradually increase difficulty',
            'Track your progress consistently'
          ]
        }
      };
    }
  }

  // Calculate completion rate for a habit
  private calculateCompletionRate(habit: IHabit): number {
    if (!habit.completedDates || habit.completedDates.length === 0) {
      return 0;
    }

    // Calculate completion rate based on target frequency
    const now = new Date();
    const timeRange = this.getTimeRangeForFrequency(habit.frequency);
    const targetDate = new Date(now.getTime() - timeRange);
    
    const relevantCompletions = habit.completedDates.filter(date => date >= targetDate);
    const expectedCompletions = this.getExpectedCompletions(habit, timeRange);
    
    return expectedCompletions > 0 ? (relevantCompletions.length / expectedCompletions) : 0;
  }

  private getTimeRangeForFrequency(frequency: string): number {
    switch (frequency) {
      case 'daily':
        return 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      case 'weekly':
        return 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
      case 'monthly':
        return 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds
      default:
        return 30 * 24 * 60 * 60 * 1000; // Default to 30 days
    }
  }

  private getExpectedCompletions(habit: IHabit, timeRange: number): number {
    const days = timeRange / (24 * 60 * 60 * 1000);
    
    switch (habit.frequency) {
      case 'daily':
        return days * habit.target;
      case 'weekly':
        return (days / 7) * habit.target;
      case 'monthly':
        return (days / 30) * habit.target;
      default:
        return days; // Default to daily
    }
  }

  // Analyze user's habit consistency and suggest optimal timing
  public async analyzeHabitTiming(userId: string, habitId: string): Promise<any> {
    try {
      // Get habit completion history
      const completions = await this.pineconeService.searchHabitHistory(userId, `habitId:${habitId}`, 30);
      
      // Analyze the best time for this habit based on successful completions
      const successfulCompletions = completions.filter(completion => 
        completion.metadata && completion.metadata.completed === true
      );
      
      if (successfulCompletions.length === 0) {
        return {
          habitId,
          bestTime: 'any time - start tracking to get personalized timing suggestions',
          confidence: 'low'
        };
      }

      // Determine the most common time of day for successful completions
      const timeDistribution: { [key: string]: number } = {};

      successfulCompletions.forEach(completion => {
        if (completion.metadata && completion.metadata.timestamp) {
          const dateString = completion.metadata.timestamp;
          const date = typeof dateString === 'string' ? new Date(dateString) : new Date();
          const hour = date.getHours();
          const timeSlot = this.getTimeSlot(hour);

          timeDistribution[timeSlot] = (timeDistribution[timeSlot] || 0) + 1;
        }
      });
      
      // Find the time slot with most successful completions
      let bestTime = 'any time';
      let maxCount = 0;
      
      Object.entries(timeDistribution).forEach(([time, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestTime = time;
        }
      });
      
      return {
        habitId,
        bestTime,
        confidence: maxCount > 0 ? 'high' : 'low',
        timeDistribution
      };
    } catch (error) {
      console.error('Error analyzing habit timing:', error);
      return {
        habitId,
        bestTime: 'any time - timing analysis temporarily unavailable',
        confidence: 'low'
      };
    }
  }
  
  private getTimeSlot(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning (5AM-12PM)';
    if (hour >= 12 && hour < 17) return 'afternoon (12PM-5PM)';
    if (hour >= 17 && hour < 21) return 'evening (5PM-9PM)';
    return 'night (9PM-5AM)';
  }

  // Predict habit success probability based on historical data
  public async predictHabitSuccess(userId: string, habitData: any): Promise<number> {
    try {
      // In a real implementation, this would use actual ML models
      // For now, we'll simulate with a basic algorithm based on Pinecone data
      
      const similarHabits = await this.pineconeService.querySimilarHabits(userId, habitData.id || '', 5);
      
      if (similarHabits.length === 0) {
        // If no similar habits found, return a baseline success probability
        return 0.65; // 65% baseline
      }
      
      // Calculate average success rate from similar habits
      let totalSuccess = 0;
      similarHabits.forEach(habit => {
        // Assuming metadata contains success information
        const successRate = habit.metadata?.completionRate || 0.5;
        totalSuccess += Number(successRate);
      });
      
      const avgSuccessRate = totalSuccess / similarHabits.length;
      
      // Adjust based on habit-specific factors
      let successProbability = avgSuccessRate;
      
      // If target is very high, decrease probability
      if (habitData.target && habitData.target > 5) {
        successProbability *= 0.8;
      }
      
      // If frequency is daily, adjust based on difficulty
      if (habitData.frequency === 'daily') {
        // Daily habits are harder to maintain long-term
        successProbability *= 0.9;
      }
      
      // Ensure the probability is between 0 and 1
      return Math.max(0, Math.min(1, successProbability));
    } catch (error) {
      console.error('Error predicting habit success:', error);
      return 0.5; // Return 50% as default if prediction fails
    }
  }
  
  // Generate personalized insights based on user's habit patterns
  public async generatePersonalizedInsights(userId: string): Promise<any> {
    try {
      // Get user's habit data from Pinecone
      const userHabits = await this.pineconeService.searchHabitHistory(userId, '', 50);
      
      // Analyze patterns in the data
      const insights = {
        consistencyPattern: this.analyzeConsistency(userHabits),
        improvementAreas: this.identifyImprovementAreas(userHabits),
        successFactors: this.identifySuccessFactors(userHabits),
        personalizedTips: this.generateTips(userHabits)
      };
      
      return {
        userId,
        insights,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating personalized insights:', error);
      return {
        userId,
        insights: {
          message: 'Insights temporarily unavailable, but keep up the good work!',
          generalAdvice: 'Consistency is key to forming lasting habits.'
        },
        generatedAt: new Date()
      };
    }
  }
  
  private analyzeConsistency(habits: any[]): string {
    // Simplified consistency analysis
    if (habits.length === 0) {
      return 'Just getting started! Consistency will come with time.';
    }
    
    let completedCount = 0;
    let totalCount = habits.length;
    
    habits.forEach(habit => {
      if (habit.metadata && habit.metadata.completed) {
        completedCount++;
      }
    });
    
    const completionRate = totalCount > 0 ? completedCount / totalCount : 0;
    
    if (completionRate >= 0.8) {
      return 'Excellent consistency! You\'re maintaining great habits.';
    } else if (completionRate >= 0.6) {
      return 'Good consistency! A few more efforts will make your habits solid.';
    } else {
      return 'There\'s room for improvement in consistency. Try starting with smaller goals.';
    }
  }
  
  private identifyImprovementAreas(habits: any[]): string[] {
    // Identify areas for improvement based on pattern analysis
    const areas: string[] = [];
    
    // Check for patterns like frequent misses or short streaks
    if (habits.length > 0) {
      areas.push('Focus on one or two key habits before adding more');
      areas.push('Try linking new habits to existing routines');
      areas.push('Set specific times for your habits to increase consistency');
    }
    
    return areas.length > 0 ? areas : ['Keep building your routine - it takes time!'];
  }
  
  private identifySuccessFactors(habits: any[]): string[] {
    // Identify what's working well
    const factors: string[] = [];
    
    // Example factors based on completion patterns
    factors.push('Regular tracking is helping you stay accountable');
    factors.push('Starting with achievable targets is setting you up for success');
    
    return factors.length > 0 ? factors : ['Every journey starts with a single step!'];
  }
  
  private generateTips(habits: any[]): string[] {
    // Generate personalized tips
    const tips: string[] = [
      'Celebrate small wins - every completion matters!',
      'Don\'t worry about occasional misses - what matters is getting back on track'
    ];
    
    if (habits.length < 5) {
      tips.push('Start with 1-3 habits to avoid feeling overwhelmed');
    }
    
    return tips;
  }
}

export default AIService;