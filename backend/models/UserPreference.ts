import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreference extends Document {
  userId: mongoose.Types.ObjectId;
  timezone: string;
  notificationSettings: {
    enabled: boolean;
    dailyReminder: boolean;
    weeklySummary: boolean;
    customTimes: string[]; // Custom notification times
  };
  aiSettings: {
    enablePersonalization: boolean;
    enablePredictions: boolean;
    aiCommunicationStyle: 'formal' | 'casual' | 'motivational';
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferenceSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  notificationSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    dailyReminder: {
      type: Boolean,
      default: true
    },
    weeklySummary: {
      type: Boolean,
      default: true
    },
    customTimes: [{
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
    }]
  },
  aiSettings: {
    enablePersonalization: {
      type: Boolean,
      default: true
    },
    enablePredictions: {
      type: Boolean,
      default: true
    },
    aiCommunicationStyle: {
      type: String,
      enum: ['formal', 'casual', 'motivational'],
      default: 'motivational'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<IUserPreference>('UserPreference', UserPreferenceSchema);