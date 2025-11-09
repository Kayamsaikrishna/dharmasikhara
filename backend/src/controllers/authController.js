const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const databaseService = require('../services/database');

const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, institution, year, specialization } = req.body;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Check if user already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
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
        
        // Create new user
        const newUser = await new Promise((resolve, reject) => {
            const createdAt = new Date().toISOString();
            db.run(
                'INSERT INTO users (username, email, password, first_name, last_name, institution, year, specialization, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [username, email, hashedPassword, firstName, lastName, institution, year, specialization, createdAt],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            username,
                            email,
                            password: hashedPassword,
                            first_name: firstName,
                            last_name: lastName,
                            institution,
                            year,
                            specialization,
                            created_at: createdAt
                        });
                    }
                }
            );
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: 'client' },
            process.env.JWT_SECRET || 'dharmasikhara_secret',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: 'client',
                    firstName: newUser.first_name,
                    lastName: newUser.last_name,
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
            message: 'An error occurred during registration: ' + error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Find user in database
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
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
        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET updated_at = ? WHERE id = ?', [new Date().toISOString(), user.id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: 'client' },
            process.env.JWT_SECRET || 'dharmasikhara_secret',
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: 'client',
                    firstName: user.first_name,
                    lastName: user.last_name,
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
            message: 'An error occurred during login: ' + error.message
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
        message: 'Token refreshed successfully'
    });
};

// Export all functions
module.exports = {
    register,
    login,
    logout,
    refreshToken
};