import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitCompletion extends Document {
  userId: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  date: Date;
  completed: boolean;
  notes?: string;
  duration?: number; // Duration in minutes
  context?: any; // Additional context for AI analysis (location, mood, etc.)
  pineconeReference?: string; // Reference to Pinecone vector record
  createdAt: Date;
  updatedAt: Date;
}

const HabitCompletionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitId: {
    type: Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  duration: {
    type: Number, // Duration in minutes
    min: 0
  },
  context: {
    type: Schema.Types.Mixed // Flexible field for additional context (location, mood, etc.)
  },
  pineconeReference: {
    type: String, // Reference to Pinecone vector record
    sparse: true // Allows for efficient querying on this field
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
HabitCompletionSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
HabitCompletionSchema.index({ userId: 1, date: -1 });
HabitCompletionSchema.index({ habitId: 1, date: -1 });

export default mongoose.model<IHabitCompletion>('HabitCompletion', HabitCompletionSchema);