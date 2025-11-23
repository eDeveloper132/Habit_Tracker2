// api/auth/register.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../../db/connection/db.ts';
import User from '../../models/User.ts';
import UserPreference from '../../models/UserPreference.ts';

export default async function registerHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Create default user preferences
    const userPreference = new UserPreference({
      userId: savedUser._id,
      timezone: 'UTC'
    });

    await userPreference.save();

    // Update user with preferences reference
    savedUser.preferences = userPreference._id;
    await savedUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: savedUser._id.toString() } as { id: string },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
}