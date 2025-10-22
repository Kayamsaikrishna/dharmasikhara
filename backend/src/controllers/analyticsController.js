const User = require('../models/User');
const Scenario = require('../models/Scenario');
const UserProgress = require('../models/UserProgress');
const Skill = require('../models/Skill');

const getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user progress data
        const progressRecords = await UserProgress.find({ user: userId })
            .populate('scenario', 'title practiceArea');
        
        // Get user skills
        const skills = await Skill.find({ user: userId });
        
        // Calculate analytics
        const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        const scenariosCompleted = progressRecords.filter(p => p.status === 'completed').length;
        const averageScore = progressRecords.length > 0 
            ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
            : 0;
        
        // Calculate skill improvement
        const skillImprovement = {};
        skills.forEach(skill => {
            // In a real implementation, this would compare with previous measurements
            skillImprovement[skill.skillName] = Math.max(0, skill.level - 50);
        });
        
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
            userId,
            totalTimeSpent,
            scenariosCompleted,
            averageScore: parseFloat(averageScore.toFixed(1)),
            skillLevels: skills.reduce((acc, skill) => {
                acc[skill.skillName] = skill.level;
                return acc;
            }, {}),
            skillImprovement,
            preferredPracticeAreas,
            lastActive: user.lastLogin || user.createdAt
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

const getScenarioAnalytics = async (req, res) => {
    try {
        const { scenarioId } = req.params;
        
        // Check if scenario exists
        const scenario = await Scenario.findById(scenarioId);
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }
        
        // Get progress records for this scenario
        const progressRecords = await UserProgress.find({ scenario: scenarioId });
        
        // Calculate analytics
        const timesCompleted = progressRecords.filter(p => p.status === 'completed').length;
        const averageCompletionTime = progressRecords.length > 0 
            ? progressRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / progressRecords.length
            : 0;
        const averageScore = progressRecords.length > 0 
            ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
            : 0;
        
        const analytics = {
            scenarioId,
            timesCompleted,
            averageCompletionTime: parseFloat(averageCompletionTime.toFixed(1)),
            averageScore: parseFloat(averageScore.toFixed(1)),
            difficultyRating: scenario.rating,
            reviewCount: scenario.reviewCount
        };
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Get scenario analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching scenario analytics'
        });
    }
};

const getInstitutionAnalytics = async (req, res) => {
    try {
        const { institutionId } = req.params;
        
        // In a real implementation, this would fetch from a database
        // For now, we'll return mock data
        const analytics = {
            institutionId,
            totalUsers: 245,
            activeUsers: 178,
            scenariosCompleted: 892,
            averageUserScore: 79.2,
            topPracticeAreas: [
                'Corporate Law',
                'Criminal Law',
                'Family Law'
            ]
        };
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Get institution analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching institution analytics'
        });
    }
};

const getUserSkills = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user skills
        const skills = await Skill.find({ user: userId });
        
        // Calculate weak and strong areas
        const weakAreas = skills
            .filter(skill => skill.level < 70)
            .sort((a, b) => a.level - b.level)
            .slice(0, 3)
            .map(skill => skill.skillName);
            
        const strongAreas = skills
            .filter(skill => skill.level >= 70)
            .sort((a, b) => b.level - a.level)
            .slice(0, 3)
            .map(skill => skill.skillName);
        
        const skillsData = {
            userId,
            skillLevels: skills.reduce((acc, skill) => {
                acc[skill.skillName] = skill.level;
                return acc;
            }, {}),
            weakAreas,
            strongAreas
        };
        
        res.json({
            success: true,
            data: skillsData
        });
    } catch (error) {
        console.error('Get user skills error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching user skills'
        });
    }
};

const updateUserSkills = async (req, res) => {
    try {
        const { userId } = req.params;
        const skillData = req.body;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update or create skills
        const updatedSkills = [];
        for (const [skillName, level] of Object.entries(skillData)) {
            const skill = await Skill.findOneAndUpdate(
                { user: userId, skillName },
                { level, lastUpdated: new Date() },
                { upsert: true, new: true, runValidators: true }
            );
            updatedSkills.push(skill);
        }
        
        res.json({
            success: true,
            message: 'User skills updated successfully',
            data: {
                userId,
                skills: updatedSkills
            }
        });
    } catch (error) {
        console.error('Update user skills error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating user skills'
        });
    }
};

const generateUserReport = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user progress data
        const progressRecords = await UserProgress.find({ user: userId })
            .populate('scenario', 'title practiceArea');
        
        // Get user skills
        const skills = await Skill.find({ user: userId });
        
        // Calculate report data
        const scenariosCompleted = progressRecords.filter(p => p.status === 'completed').length;
        const averageScore = progressRecords.length > 0 
            ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
            : 0;
        
        // Calculate skill improvement
        const totalSkillImprovement = skills.reduce((sum, skill) => sum + Math.max(0, skill.level - 50), 0);
        
        // Generate recommendations
        const recommendations = [];
        if (scenariosCompleted < 5) {
            recommendations.push('Complete more scenarios to improve your skills');
        }
        
        if (averageScore < 80) {
            recommendations.push('Focus on areas where you scored lower');
        }
        
        // Add skill-specific recommendations
        const weakSkills = skills.filter(skill => skill.level < 70);
        if (weakSkills.length > 0) {
            recommendations.push(`Work on improving your ${weakSkills[0].skillName} skills`);
        }
        
        const report = {
            userId,
            reportType: 'User Performance',
            generatedAt: new Date().toISOString(),
            data: {
                summary: 'Your legal practice performance report',
                keyMetrics: {
                    scenariosCompleted,
                    averageScore: parseFloat(averageScore.toFixed(1)),
                    skillImprovement: parseFloat(totalSkillImprovement.toFixed(1))
                },
                recommendations
            }
        };
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Generate user report error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating user report'
        });
    }
};

const generateInstitutionReport = async (req, res) => {
    try {
        const { institutionId } = req.params;
        
        // In a real implementation, this would generate a detailed report
        // For now, we'll return mock data
        const report = {
            institutionId,
            reportType: 'Institution Performance',
            generatedAt: new Date().toISOString(),
            data: {
                summary: 'The institution has shown strong engagement with the platform, with above-average performance metrics.',
                keyMetrics: {
                    activeUsers: 178,
                    scenariosCompleted: 892,
                    averageScore: 79.2
                },
                recommendations: [
                    'Encourage more participation in multiplayer scenarios',
                    'Focus on areas where skill levels are below average',
                    'Implement peer mentoring programs for skill development'
                ]
            }
        };
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Generate institution report error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating institution report'
        });
    }
};

module.exports = {
    getUserAnalytics,
    getScenarioAnalytics,
    getInstitutionAnalytics,
    getUserSkills,
    updateUserSkills,
    generateUserReport,
    generateInstitutionReport
};