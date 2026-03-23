import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import {
  hashPassword,
  comparePassword,
  generateToken,
  validateEmail,
} from '../utils/auth';
import { UserModel } from '../models';
import { validateEmail as validateEmailUtil } from '../utils/auth';
import { ApiResponse, UserLogin, UserRegistration } from '../types/definitions';

const router = Router();

// User Registration (Feature #2)
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, confirmPassword }: UserRegistration = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      } as ApiResponse<null>);
    }

    if (!validateEmailUtil(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      } as ApiResponse<null>);
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match',
      } as ApiResponse<null>);
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      } as ApiResponse<null>);
    }

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      } as ApiResponse<null>);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const newUser = await UserModel.create({
      email,
      passwordHash,
    });

    const token = generateToken(newUser._id as string, email);

    return res.status(201).json({
      success: true,
      data: {
        token,
        userId: newUser._id,
        email: newUser.email,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
    } as ApiResponse<null>);
  }
});

// User Login (Feature #2)
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password }: UserLogin = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      } as ApiResponse<null>);
    }

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      } as ApiResponse<null>);
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      } as ApiResponse<null>);
    }

    // Generate token
    const token = generateToken(user._id as string, user.email);

    return res.status(200).json({
      success: true,
      data: {
        token,
        userId: user._id,
        email: user.email,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
    } as ApiResponse<null>);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      } as ApiResponse<null>);
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    } as ApiResponse<null>);
  }
});

export default router;
