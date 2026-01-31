const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2026',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { userName, email, password, bio, image } = req.body;

        // Validation
        if (!userName || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide userName, email and password' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { userName }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken' 
            });
        }

        // Get next userId (auto-increment)
        const lastUser = await User.findOne().sort({ userId: -1 });
        const nextUserId = lastUser ? lastUser.userId + 1 : 1;

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            userId: nextUserId,
            userName,
            email,
            passwordHash,
            bio: bio || '',
            image: image || '',
            status: 'offline',
            connected_to: [],
            joinedGroups: []
        });

        // Generate token
        const token = generateToken(newUser.userId);

        // Return user data (without password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: newUser.toPublicJSON()
        });

    } catch (error) {
        console.error('[Auth Controller] Signup Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during signup' 
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email and password' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Update status to online
        user.status = 'online';
        user.lastSeen = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user.userId);

        // Return user data (without password)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('[Auth Controller] Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        const userId = req.user.userId; // From JWT middleware

        // Update user status to offline
        await User.findOneAndUpdate(
            { userId },
            { 
                status: 'offline', 
                lastSeen: new Date(),
                socketId: null 
            }
        );

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('[Auth Controller] Logout Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during logout' 
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId; // From JWT middleware

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('[Auth Controller] Get Me Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching user' 
        });
    }
};

module.exports = {
    signup,
    login,
    logout,
    getMe
};
