const databaseService = require('../services/database');

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Query user from SQLite database
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        
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
        const users = db.prepare('SELECT id, username, email, first_name, last_name, institution, year, specialization, created_at FROM users').all();
        
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
            const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
            
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
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        db.prepare(query).run(...updateValues);
        
        // Fetch updated user data
        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        
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
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Delete user
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        
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
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user progress
        const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').all(id);
        
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

const getUserProgressByScenario = async (req, res) => {
    try {
        const { id, scenarioId } = req.params;
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Check if user exists
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user progress for specific scenario
        const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND scenario_id = ?').get(id, scenarioId);
        
        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Get user progress by scenario error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching user progress'
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
    getUserProgressByScenario
};