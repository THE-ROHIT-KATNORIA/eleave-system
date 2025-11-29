import express from 'express';
import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (student or admin)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, stream, rollNumber } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, password, and role are required'
        }
      });
    }
    
    // Validate roll number for students
    if (role === 'student' && !rollNumber) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ROLLNUMBER_REQUIRED',
          message: 'Roll number is required for student registration'
        }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      });
    }
    
    // Validate role
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Role must be either "student" or "admin"'
        }
      });
    }
    
    // Validate stream for students
    if (role === 'student' && !stream) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'STREAM_REQUIRED',
          message: 'Stream is required for student registration'
        }
      });
    }
    
    // Validate stream value if provided
    const validStreams = ['BCA', 'BA', 'PGDCA', 'BSC', 'BCOM'];
    if (stream && !validStreams.includes(stream)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STREAM',
          message: `Stream must be one of: ${validStreams.join(', ')}`
        }
      });
    }
    
    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email address already registered'
        }
      });
    }
    
    // Check for duplicate roll number (for students only)
    if (role === 'student' && rollNumber) {
      const existingRollNumber = await User.findOne({ rollNumber });
      if (existingRollNumber) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ROLLNUMBER',
            message: 'Roll number already exists'
          }
        });
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      stream: role === 'student' ? stream : null,
      rollNumber: role === 'student' ? rollNumber : null
    });
    
    // Save user to database
    await newUser.save();
    
    // Return success response (don't send password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: newUser._id.toString()
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Failed to register user'
      }
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      stream: user.stream,
      rollNumber: user.rollNumber
    };
    const token = generateToken(tokenPayload);
    
    // Return success response with token and user data (without password)
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        stream: user.stream,
        rollNumber: user.rollNumber
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Failed to authenticate user'
      }
    });
  }
});

export default router;
