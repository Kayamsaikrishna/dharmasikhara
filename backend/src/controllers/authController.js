const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const databaseService = require('../services/database');

const register = async (req, res) => {
    try {
        // Check if MongoDB is available
        const mongoDB = databaseService.getMongoDB();
        if (!mongoDB) {
            return res.status(503).json({
                success: false,
                message: 'Registration temporarily unavailable due to database connectivity issues. Please try again later or use demo login (demo@example.com / demo123).' 
            });
        }
        
        const { username, email, password, firstName, lastName, institution, year, specialization } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            // Provide more specific error message
            if (existingUser.email === email && existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    message: 'Both username and email are already taken. Please choose different credentials.'
                });
            } else if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email address is already registered. Please use a different email or try logging in.'
                });
            } else if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken. Please choose a different username.'
                });
            }
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user (always as client)
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'client',
            firstName,
            lastName,
            institution,
            year,
            specialization,
            createdAt: new Date()
        });
        
        await newUser.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'dharmasikhara_secret',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    institution: newUser.institution,
                    year: newUser.year,
                    specialization: newUser.specialization
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration'
        });
    }
};

const login = async (req, res) => {
    try {
        // Always allow login with default credentials for demo purposes
        // This allows the application to function without database connections
        const { email, password } = req.body;
        
        // For demo purposes, allow login with default credentials
        if (email === 'demo@example.com' && password === 'demo123') {
            const token = jwt.sign(
                { userId: 'demo', email: 'demo@example.com', role: 'client' },
                process.env.JWT_SECRET || 'dharmasikhara_secret',
                { expiresIn: '24h' }
            );
            
            return res.json({
                success: true,
                message: 'Demo login successful',
                data: {
                    user: {
                        id: 'demo',
                        username: 'demo_user',
                        email: 'demo@example.com',
                        role: 'client',
                        firstName: 'Demo',
                        lastName: 'User',
                        institution: 'Demo Institution',
                        year: '2023',
                        specialization: 'General Law'
                    },
                    token
                }
            });
        }
        
        // Check if MongoDB is available
        const mongoDB = databaseService.getMongoDB();
        if (!mongoDB) {
            return res.status(503).json({
                success: false,
                message: 'Login temporarily unavailable due to database connectivity issues. Please use demo credentials (demo@example.com / demo123) or try again later.'
            });
        }
        
        // Find user in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No account found with this email. Please check your email or sign up for a new account.'
            });
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password. Please try again.'
            });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'dharmasikhara_secret',
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    institution: user.institution,
                    year: user.year,
                    specialization: user.specialization
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
};

const logout = (req, res) => {
    // In a real implementation, you would invalidate the token
    res.json({
        success: true,
        message: 'Logout successful'
    });
};

const refreshToken = (req, res) => {
    // In a real implementation, you would validate and refresh the token
    res.json({
        success: true,
        message: 'Token refreshed'
    });
};

module.exports = {
    register,
    login,
    logout,
    refreshToken
};