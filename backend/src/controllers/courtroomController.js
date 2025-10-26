const path = require('path');

class CourtroomController {
    constructor() {
        // In a production environment, this would connect to a database
        // For now, we'll use sample data
    }

    /**
     * Get courtroom documents
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getCourtroomDocuments(req, res) {
        try {
            // Sample documents data
            const documents = [
                {
                    _id: '1',
                    name: 'Case File: The Inventory That Changed Everything',
                    type: 'case_file',
                    pages: 15,
                    description: 'Complete case file for the Rajesh Kumar theft case'
                },
                {
                    _id: '2',
                    name: 'CCTV Footage Analysis Report',
                    type: 'evidence',
                    pages: 8,
                    description: 'Analysis of security footage from October 15, 2025'
                },
                {
                    _id: '3',
                    name: 'Digital Inventory Logs',
                    type: 'evidence',
                    pages: 12,
                    description: 'System logs showing laptop dispatch record'
                },
                {
                    _id: '4',
                    name: 'Witness Statement: Prakash Mehta',
                    type: 'pleading',
                    pages: 5,
                    description: 'Statement from colleague present during inventory'
                },
                {
                    _id: '5',
                    name: 'Bail Application Template',
                    type: 'correspondence',
                    pages: 3,
                    description: 'Standard format for bail applications'
                }
            ];

            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch courtroom documents',
                error: error.message
            });
        }
    }

    /**
     * Get initial courtroom messages
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getCourtroomMessages(req, res) {
        try {
            // Sample initial messages with proper Date objects
            const messages = [
                {
                    id: 1,
                    sender: 'system',
                    content: 'Welcome to the CourtCraft courtroom simulation. You are representing the plaintiff in a contract dispute case.',
                    timestamp: new Date().toISOString()
                },
                {
                    id: 2,
                    sender: 'ai',
                    content: 'Good morning, Counsel. I am Judge Sharma presiding over this matter. Please present your opening statement.',
                    timestamp: new Date().toISOString()
                }
            ];

            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            // Fallback to default messages if fetch fails
            const messages = [
                {
                    id: 1,
                    sender: 'system',
                    content: 'Welcome to the CourtCraft courtroom simulation. You are representing the plaintiff in a contract dispute case.',
                    timestamp: new Date().toISOString()
                },
                {
                    id: 2,
                    sender: 'ai',
                    content: 'Good morning, Counsel. I am Judge Sharma presiding over this matter. Please present your opening statement.',
                    timestamp: new Date().toISOString()
                }
            ];

            res.json({
                success: true,
                data: messages
            });
        }
    }

    /**
     * Get AI response to courtroom message
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getCourtroomResponse(req, res) {
        try {
            const { message } = req.body;
            
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }
            
            // Sample AI response with proper Date object
            const aiResponse = {
                id: Date.now(),
                sender: 'ai',
                content: "Thank you for that statement, Counsel. The defendant would like to respond to your claims. Mr. Advocate for the defense, please present your counter-argument.",
                timestamp: new Date().toISOString()
            };

            res.json({
                success: true,
                data: aiResponse
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate courtroom response',
                error: error.message
            });
        }
    }
}

module.exports = CourtroomController;