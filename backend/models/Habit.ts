import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number; // Target number of times per frequency period
  completedDates: Date[]; // Dates when the habit was completed
  createdAt: Date;
  updatedAt: Date;
  streak: number;
  lastCompletedDate?: Date;
  isActive: boolean;
  reminderTime?: string; // Time for habit reminder in HH:MM format
  aiMetadata?: any; // Additional metadata for AI processing
}

const HabitSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
    required: true
  },
  target: {
    type: Number,
    default: 1,
    min: 1
  },
  completedDates: [{
    type: Date,
    default: []
  }],
  streak: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reminderTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  aiMetadata: {
    type: Schema.Types.Mixed // Flexible field for AI-related metadata
  }
}, {
  timestamps: true
});

export default mongoose.model<IHabit>('Habit', HabitSchema);