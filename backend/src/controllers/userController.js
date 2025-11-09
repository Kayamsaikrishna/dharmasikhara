const databaseService = require('../services/database');

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Query user from SQLite database
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove password from response
        delete user.password;
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching user'
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Query all users from SQLite database
        const users = await new Promise((resolve, reject) => {
            db.all('SELECT id, username, email, first_name, last_name, institution, year, specialization, created_at FROM users', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching users'
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        
        // Only allow updating non-sensitive fields
        if (updateData.firstName !== undefined) {
            updateFields.push('first_name = ?');
            updateValues.push(updateData.firstName);
        }
        if (updateData.lastName !== undefined) {
            updateFields.push('last_name = ?');
            updateValues.push(updateData.lastName);
        }
        if (updateData.institution !== undefined) {
            updateFields.push('institution = ?');
            updateValues.push(updateData.institution);
        }
        if (updateData.year !== undefined) {
            updateFields.push('year = ?');
            updateValues.push(updateData.year);
        }
        if (updateData.specialization !== undefined) {
            updateFields.push('specialization = ?');
            updateValues.push(updateData.specialization);
        }
        
        // Always update the updated_at field
        updateFields.push('updated_at = ?');
        updateValues.push(new Date().toISOString());
        
        // Add user ID to the values array
        updateValues.push(id);
        
        // If no fields to update, return early
        if (updateFields.length === 1) { // Only updated_at field
            const user = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Remove password from response
            delete user.password;
            
            return res.json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        }
        
        // Execute update query
        await new Promise((resolve, reject) => {
            const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            db.run(query, updateValues, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
        
        // Fetch updated user data
        const updatedUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove password from response
        delete updatedUser.password;
        
        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating user'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Check if user exists
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Delete user
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting user'
        });
    }
};

const getUserProgress = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Check if user exists
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user progress data
        const progressRecords = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM user_progress WHERE user_id = ?', [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        // Calculate summary statistics
        const completedScenarios = progressRecords.filter(p => p.status === 'completed').length;
        const totalScenarios = progressRecords.length;
        const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.time_spent || 0), 0);
        const averageScore = progressRecords.length > 0 
            ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
            : 0;
        
        const progress = {
            completedScenarios,
            totalScenarios,
            totalTimeSpent,
            averageScore: parseFloat(averageScore.toFixed(1)),
            lastActive: user.updated_at || user.created_at,
            progressRecords
        };
        
        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching user progress'
        });
    }
};

const getUserAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Check if user exists
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user progress data
        const progressRecords = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM user_progress WHERE user_id = ?', [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        // Calculate analytics
        const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.time_spent || 0), 0);
        const scenariosCompleted = progressRecords.filter(p => p.status === 'completed').length;
        const averageScore = progressRecords.length > 0 
            ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
            : 0;
        
        // For practice areas, we'll use a simple approach since we don't have scenario data in this context
        const practiceAreas = ['Criminal Law', 'Civil Law', 'Constitutional Law', 'Corporate Law', 'Family Law'];
        const preferredPracticeAreas = practiceAreas.slice(0, 3);
        
        const analytics = {
            totalTimeSpent,
            scenariosCompleted,
            averageScore: parseFloat(averageScore.toFixed(1)),
            preferredPracticeAreas,
            lastActive: user.updated_at || user.created_at
        };
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Get user analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching user analytics'
        });
    }
};

// Export all functions
module.exports = {
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserProgress,
    getUserAnalytics
};