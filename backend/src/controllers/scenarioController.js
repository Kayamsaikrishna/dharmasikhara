const Scenario = require('../models/Scenario');

const getAllScenarios = async (req, res) => {
    // Disabled scenario fetching as per requirements
    res.json({
        success: true,
        data: []
    });
};

const getScenarioById = async (req, res) => {
    // Disabled scenario fetching as per requirements
    return res.status(404).json({
        success: false,
        message: 'Scenario not found'
    });
};

const createScenario = async (req, res) => {
    // Disabled scenario creation as per requirements
    res.status(403).json({
        success: false,
        message: 'Scenario creation is temporarily disabled'
    });
};

const updateScenario = async (req, res) => {
    // Disabled scenario updates as per requirements
    return res.status(404).json({
        success: false,
        message: 'Scenario not found'
    });
};

const deleteScenario = async (req, res) => {
    // Disabled scenario deletion as per requirements
    return res.status(404).json({
        success: false,
        message: 'Scenario not found'
    });
};

const searchScenarios = async (req, res) => {
    // Disabled scenario searching as per requirements
    res.json({
        success: true,
        data: []
    });
};

const getRecommendedScenarios = async (req, res) => {
    // Disabled scenario recommendations as per requirements
    res.json({
        success: true,
        data: []
    });
};

const startScenario = async (req, res) => {
    // Disabled scenario starting as per requirements
    res.status(404).json({
        success: false,
        message: 'Scenario not found'
    });
};

const saveScenarioProgress = async (req, res) => {
    // Disabled scenario progress saving as per requirements
    res.status(404).json({
        success: false,
        message: 'Scenario not found'
    });
};

const completeScenario = async (req, res) => {
    // Disabled scenario completion as per requirements
    res.status(404).json({
        success: false,
        message: 'Scenario not found'
    });
};

module.exports = {
    getAllScenarios,
    getScenarioById,
    createScenario,
    updateScenario,
    deleteScenario,
    searchScenarios,
    getRecommendedScenarios,
    startScenario,
    saveScenarioProgress,
    completeScenario
};