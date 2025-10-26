const User = require('../models/User');
const Skill = require('../models/Skill');
const UserProgress = require('../models/UserProgress');

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
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
        const users = await User.find().select('-password');
        
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
        
        // Remove sensitive fields from update
        delete updateData.password;
        delete updateData.email;
        
        const user = await User.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
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
        
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
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
        
        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user progress data
        const progressRecords = await UserProgress.find({ user: id })
            .populate('scenario', 'title practiceArea');
        
        // Calculate summary statistics
        const completedScenarios = progressRecords.filter(p => p.status === 'completed').length;
        const totalScenarios = progressRecords.length;
        const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        const averageScore = progressRecords.length > 0 
            ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
            : 0;
        
        const progress = {
            completedScenarios,
            totalScenarios,
            totalTimeSpent,
            averageScore: parseFloat(averageScore.toFixed(1)),
            lastActive: user.lastLogin || user.createdAt,
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
        
        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user skills
        const skills = await Skill.find({ user: id });
        
        // Get user progress data
        const progressRecords = await UserProgress.find({ user: id });
        
        // Calculate analytics
        const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        const scenariosCompleted = progressRecords.filter(p => p.status === 'completed').length;
        const averageScore = progressRecords.length > 0 
            ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
            : 0;
        
        // Group by practice area for preferred areas
        const practiceAreaCount = {};
        progressRecords.forEach(record => {
            if (record.scenario && record.scenario.practiceArea) {
                practiceAreaCount[record.scenario.practiceArea] = 
                    (practiceAreaCount[record.scenario.practiceArea] || 0) + 1;
            }
        });
        
        const preferredPracticeAreas = Object.entries(practiceAreaCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([area]) => area);
        
        const analytics = {
            totalTimeSpent,
            scenariosCompleted,
            averageScore: parseFloat(averageScore.toFixed(1)),
            skillLevels: skills.reduce((acc, skill) => {
                acc[skill.skillName] = skill.level;
                return acc;
            }, {}),
            preferredPracticeAreas
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

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        // Validate role
        if (!['client', 'contractor'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be either "client" or "contractor"'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            id,
            { role, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: `User role updated to ${role}`,
            data: user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating user role'
        });
    }
};

module.exports = {
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserProgress,
    getUserAnalytics,
    updateUserRole
};