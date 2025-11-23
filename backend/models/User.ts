import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  habits: mongoose.Types.ObjectId[];
  preferences: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  habits: [{
    type: Schema.Types.ObjectId,
    ref: 'Habit'
  }],
  preferences: {
    type: Schema.Types.ObjectId,
    ref: 'UserPreference'
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);