const Scenario = require('../models/Scenario');
const PortfolioItem = require('../models/PortfolioItem');
const ClientProject = require('../models/ClientProject');

const getCreatorScenarios = async (req, res) => {
    try {
        const { creatorId } = req.params;
        
        const scenarios = await Scenario.find({ creator: creatorId })
            .populate('creator', 'username');
        
        res.json({
            success: true,
            data: scenarios
        });
    } catch (error) {
        console.error('Get creator scenarios error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching creator scenarios'
        });
    }
};

const getFeaturedScenarios = async (req, res) => {
    try {
        // Get top rated published scenarios
        const scenarios = await Scenario.find({ status: 'published' })
            .sort({ rating: -1 })
            .limit(10)
            .populate('creator', 'username');
        
        res.json({
            success: true,
            data: scenarios
        });
    } catch (error) {
        console.error('Get featured scenarios error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching featured scenarios'
        });
    }
};

const searchMarketplace = async (req, res) => {
    try {
        const { query, practiceArea, difficulty, minRating } = req.query;
        
        // Build search filter
        const filter = { status: 'published' };
        
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        if (practiceArea) {
            filter.practiceArea = practiceArea;
        }
        
        if (difficulty) {
            filter.difficulty = difficulty;
        }
        
        if (minRating) {
            filter.rating = { $gte: parseFloat(minRating) };
        }
        
        const scenarios = await Scenario.find(filter)
            .populate('creator', 'username');
        
        res.json({
            success: true,
            data: scenarios
        });
    } catch (error) {
        console.error('Search marketplace error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while searching marketplace'
        });
    }
};

const rateScenario = async (req, res) => {
    try {
        const { scenarioId } = req.params;
        const { rating, review } = req.body;
        
        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        
        // Find scenario
        const scenario = await Scenario.findById(scenarioId);
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }
        
        // Update rating calculation
        const newReviewCount = scenario.reviewCount + 1;
        const newRating = ((scenario.rating * scenario.reviewCount) + rating) / newReviewCount;
        
        scenario.rating = parseFloat(newRating.toFixed(1));
        scenario.reviewCount = newReviewCount;
        await scenario.save();
        
        res.json({
            success: true,
            message: 'Rating submitted successfully',
            data: {
                scenarioId,
                rating: scenario.rating,
                reviewCount: scenario.reviewCount
            }
        });
    } catch (error) {
        console.error('Rate scenario error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while submitting rating'
        });
    }
};

module.exports = {
    getCreatorScenarios,
    getFeaturedScenarios,
    searchMarketplace,
    rateScenario
};