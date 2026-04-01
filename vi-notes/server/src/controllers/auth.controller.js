import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TOKEN_EXPIRY || '7d'
    });
    return token;
};

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
};

export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = await userModel.create({ email, password });

        const token = generateToken(user._id);

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user:
            {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.cookie('token', token, cookieOptions);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ error: error.message });
    }
};

export const logoutUser = (req, res) => {
    res.clearCookie('token', cookieOptions);
    res.json({ message: 'Logout successful' });
};

export const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({ error: error.message });
    }
};