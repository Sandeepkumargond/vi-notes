"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../utils/auth");
const models_1 = require("../models");
const auth_3 = require("../utils/auth");
const router = (0, express_1.Router)();
// User Registration (Feature #2)
router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        // Validation
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
        }
        if (!(0, auth_3.validateEmail)(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Passwords do not match',
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters',
            });
        }
        // Check if user exists
        const existingUser = await models_1.UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists',
            });
        }
        // Hash password and create user
        const passwordHash = await (0, auth_2.hashPassword)(password);
        const newUser = await models_1.UserModel.create({
            email,
            passwordHash,
        });
        const token = (0, auth_2.generateToken)(newUser._id, email);
        return res.status(201).json({
            success: true,
            data: {
                token,
                userId: newUser._id,
                email: newUser.email,
            },
            message: 'User registered successfully',
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            error: 'Registration failed',
        });
    }
});
// User Login (Feature #2)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
        }
        // Find user
        const user = await models_1.UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }
        // Verify password
        const isValid = await (0, auth_2.comparePassword)(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }
        // Generate token
        const token = (0, auth_2.generateToken)(user._id, user.email);
        return res.status(200).json({
            success: true,
            data: {
                token,
                userId: user._id,
                email: user.email,
            },
            message: 'Login successful',
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            error: 'Login failed',
        });
    }
});
// Get current user
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await models_1.UserModel.findById(req.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch user',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map