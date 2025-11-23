export interface User {
  id: string;
  username: string;
  email: string;
  preferences?: UserPreference;
}

export interface UserPreference {
  _id: string;
  userId: string;
  timezone?: string;
  notificationSettings?: {
    enabled: boolean;
    dailyReminder: boolean;
    weeklySummary: boolean;
    customTimes?: string[];
  };
  aiSettings?: {
    enablePersonalization: boolean;
    enablePredictions: boolean;
    aiCommunicationStyle: 'formal' | 'casual' | 'motivational';
  };
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  completedDates: Date[];
  streak: number;
  lastCompletedDate?: Date;
  isActive: boolean;
  reminderTime?: string;
  aiMetadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletion {
  _id: string;
  userId: string;
  habitId: string;
  date: Date;
  completed: boolean;
  notes?: string;
  duration?: number;
  context?: any;
  pineconeReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIRecommendation {
  timestamp: Date;
  userId: string;
  recommendations: {
    habitImprovements: string[];
    newHabits: string[];
    timingSuggestions: string[];
    habitCombinations: string[];
    warnings: string[];
  };
}