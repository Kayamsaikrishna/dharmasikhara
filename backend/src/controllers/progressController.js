const UserProgress = require('../models/UserProgress');
const Scenario = require('../models/Scenario');

const saveUserProgress = async (req, res) => {
    try {
        const { scenarioId, progressData } = req.body;
        const userId = req.user.userId;

        // Validate input
        if (!scenarioId || !progressData) {
            return res.status(400).json({
                success: false,
                message: 'Scenario ID and progress data are required'
            });
        }

        // Find scenario by title (since frontend uses title as ID)
        // If not found by title, try to find by ObjectId
        let scenario = await Scenario.findOne({ title: new RegExp(scenarioId, 'i') });
        if (!scenario) {
            scenario = await Scenario.findById(scenarioId);
        }
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Check if progress record already exists
        let userProgress = await UserProgress.findOne({ user: userId, scenario: scenario._id });

        if (userProgress) {
            // Update existing progress
            userProgress = await UserProgress.findByIdAndUpdate(
                userProgress._id,
                {
                    ...progressData,
                    updatedAt: new Date()
                },
                { new: true }
            );
        } else {
            // Create new progress record
            userProgress = new UserProgress({
                user: userId,
                scenario: scenario._id,
                ...progressData
            });
            await userProgress.save();
        }

        res.json({
            success: true,
            message: 'Progress saved successfully',
            data: userProgress
        });
    } catch (error) {
        console.error('Save user progress error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while saving progress'
        });
    }
};

const getUserProgress = async (req, res) => {
    try {
        const { scenarioId } = req.params;
        const userId = req.user.userId;

        // Validate input
        if (!scenarioId) {
            return res.status(400).json({
                success: false,
                message: 'Scenario ID is required'
            });
        }

        // Find scenario by title (since frontend uses title as ID)
        // If not found by title, try to find by ObjectId
        let scenario = await Scenario.findOne({ 
            $or: [
                { title: new RegExp(scenarioId.replace(/-/g, ' '), 'i') }, // Convert kebab-case to spaces
                { title: new RegExp(scenarioId, 'i') } // Try as-is
            ]
        });
        
        if (!scenario) {
            // Try to find by ObjectId if it looks like one
            if (scenarioId.match(/^[0-9a-fA-F]{24}$/)) {
                scenario = await Scenario.findById(scenarioId);
            }
        }
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Get user progress data
        const userProgress = await UserProgress.findOne({ user: userId, scenario: scenario._id });

        res.json({
            success: true,
            data: userProgress || null
        });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching progress'
        });
    }
};

const getAllUserProgress = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get all user progress data
        const userProgressRecords = await UserProgress.find({ user: userId })
            .populate('scenario', 'title practiceArea');

        res.json({
            success: true,
            data: userProgressRecords
        });
    } catch (error) {
        console.error('Get all user progress error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching progress records'
        });
    }
};

module.exports = {
    saveUserProgress,
    getUserProgress,
    getAllUserProgress
};