const Scenario = require('../models/Scenario');

// Mock scenario data
const mockScenarios = [
  {
    id: '1',
    title: "The Inventory That Changed Everything",
    description: "A comprehensive legal simulation involving client interview, digital evidence review, bail application drafting, and courtroom hearing.",
    category: "Criminal Law",
    difficulty: "Advanced",
    estimatedTime: 120,
    learningObjectives: [
      "Master client interviewing techniques",
      "Analyze digital evidence effectively",
      "Draft compelling legal documents",
      "Develop courtroom advocacy skills"
    ],
    skillsPracticed: [
      "Client Interviewing",
      "Evidence Analysis",
      "Legal Writing",
      "Courtroom Advocacy"
    ],
    price: 2000,
    tags: ["simulation", "criminal", "bail", "evidence", "courtroom"],
    status: "published",
    rating: 0,
    reviewCount: 0,
    completionRate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator: {
      username: "LegalExpert"
    }
  },
  {
    id: '2',
    title: "Cross-Examination of a Hostile Witness",
    description: "Practice techniques for handling uncooperative witnesses in a criminal trial setting.",
    category: "Criminal Law",
    difficulty: "Intermediate",
    estimatedTime: 45,
    learningObjectives: [
      "Develop strategies for questioning hostile witnesses",
      "Learn to maintain composure under pressure",
      "Master techniques for impeaching witness credibility"
    ],
    skillsPracticed: [
      "Cross-Examination",
      "Witness Handling",
      "Courtroom Presence"
    ],
    price: 0,
    tags: ["cross-examination", "criminal", "witness", "hostile"],
    status: "published",
    rating: 0,
    reviewCount: 0,
    completionRate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator: {
      username: "CourtSpecialist"
    }
  }
];

const getAllScenarios = async (req, res) => {
    // Return mock scenarios instead of disabling
    res.json({
        success: true,
        data: mockScenarios
    });
};

const getScenarioById = async (req, res) => {
    const { id } = req.params;
    const scenario = mockScenarios.find(s => s.id === id);
    
    if (scenario) {
        res.json({
            success: true,
            data: scenario
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Scenario not found'
        });
    }
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
    // Return mock scenarios for search
    res.json({
        success: true,
        data: mockScenarios
    });
};

const getRecommendedScenarios = async (req, res) => {
    // Return mock scenarios for recommendations
    res.json({
        success: true,
        data: mockScenarios
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