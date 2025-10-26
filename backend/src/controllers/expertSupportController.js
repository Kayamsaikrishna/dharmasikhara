const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Mock expert database (in a real implementation, this would connect to a real database)
const experts = [
  {
    id: 'expert-1',
    name: 'Dr. Priya Sharma',
    title: 'Senior Advocate',
    specialization: 'Criminal Law',
    experience: '15 years',
    institution: 'Supreme Court of India',
    rating: 4.8,
    reviews: 124,
    languages: ['en', 'hi'],
    availability: 'Mon-Fri 10:00-16:00',
    hourlyRate: 5000,
    bio: 'Dr. Priya Sharma is a Senior Advocate practicing in the Supreme Court of India with expertise in criminal law. She has handled over 200 criminal cases and has been instrumental in several landmark judgments.',
    education: [
      'LLB, Faculty of Law, University of Delhi',
      'LLM, Harvard Law School',
      'PhD in Criminal Justice, Jawaharlal Nehru University'
    ],
    areasOfExpertise: [
      'Criminal Defense',
      'Cyber Crime',
      'White Collar Crime',
      'Juvenile Justice'
    ]
  },
  {
    id: 'expert-2',
    name: 'Prof. Rajesh Kumar',
    title: 'Professor of Law',
    specialization: 'Constitutional Law',
    experience: '20 years',
    institution: 'National Law School of India University',
    rating: 4.9,
    reviews: 89,
    languages: ['en', 'hi', 'ta'],
    availability: 'Tue-Thu 14:00-18:00',
    hourlyRate: 4000,
    bio: 'Prof. Rajesh Kumar is a renowned professor of Constitutional Law at National Law School of India University. He has authored several books on constitutional principles and has been a visiting faculty at various international law schools.',
    education: [
      'LLB, Faculty of Law, University of Mumbai',
      'LLM, Yale Law School',
      'PhD in Constitutional Law, University of Cambridge'
    ],
    areasOfExpertise: [
      'Fundamental Rights',
      'Federalism',
      'Judicial Review',
      'Emergency Provisions'
    ]
  },
  {
    id: 'expert-3',
    name: 'Adv. Meera Patel',
    title: 'Corporate Lawyer',
    specialization: 'Corporate Law',
    experience: '12 years',
    institution: 'Patel & Associates',
    rating: 4.7,
    reviews: 156,
    languages: ['en', 'hi', 'gu'],
    availability: 'Mon-Wed-Fri 11:00-17:00',
    hourlyRate: 6000,
    bio: 'Adv. Meera Patel is a leading corporate lawyer with expertise in mergers and acquisitions, corporate governance, and regulatory compliance. She has advised Fortune 500 companies and startups on complex corporate transactions.',
    education: [
      'LLB, Gujarat National Law University',
      'LLM, Stanford Law School',
      'MBA, Indian School of Business'
    ],
    areasOfExpertise: [
      'Mergers & Acquisitions',
      'Corporate Governance',
      'Securities Law',
      'Regulatory Compliance'
    ]
  }
];

// Mock sessions database
const sessions = new Map();

class ExpertSupportController {
    /**
     * Get all available experts
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getExperts(req, res) {
        try {
            const { specialization, language } = req.query;
            
            let filteredExperts = experts;
            
            // Filter by specialization if provided
            if (specialization) {
                filteredExperts = filteredExperts.filter(expert => 
                    expert.specialization.toLowerCase().includes(specialization.toLowerCase())
                );
            }
            
            // Filter by language if provided
            if (language) {
                filteredExperts = filteredExperts.filter(expert => 
                    expert.languages.includes(language)
                );
            }
            
            res.json({
                success: true,
                data: filteredExperts
            });
        } catch (error) {
            console.error('Get experts error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch experts',
                error: error.message
            });
        }
    }

    /**
     * Get expert by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getExpertById(req, res) {
        try {
            const { expertId } = req.params;
            
            const expert = experts.find(e => e.id === expertId);
            
            if (!expert) {
                return res.status(404).json({
                    success: false,
                    message: 'Expert not found'
                });
            }
            
            res.json({
                success: true,
                data: expert
            });
        } catch (error) {
            console.error('Get expert by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch expert',
                error: error.message
            });
        }
    }

    /**
     * Schedule a session with an expert
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async scheduleSession(req, res) {
        try {
            const { userId, expertId, date, time, topic, notes } = req.body;
            
            // Validate inputs
            if (!userId || !expertId || !date || !time || !topic) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, expert ID, date, time, and topic are required'
                });
            }
            
            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Check if expert exists
            const expert = experts.find(e => e.id === expertId);
            if (!expert) {
                return res.status(404).json({
                    success: false,
                    message: 'Expert not found'
                });
            }
            
            // Check if expert is available at the requested time
            // In a real implementation, this would check against a calendar system
            const sessionDate = new Date(`${date}T${time}`);
            const now = new Date();
            
            if (sessionDate < now) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot schedule session in the past'
                });
            }
            
            // Create session
            const sessionId = uuidv4();
            const session = {
                id: sessionId,
                userId,
                expertId,
                userName: `${user.firstName} ${user.lastName}`,
                expertName: expert.name,
                date,
                time,
                topic,
                notes: notes || '',
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                scheduledAt: sessionDate.toISOString()
            };
            
            sessions.set(sessionId, session);
            
            res.json({
                success: true,
                message: 'Session scheduled successfully',
                data: session
            });
        } catch (error) {
            console.error('Schedule session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to schedule session',
                error: error.message
            });
        }
    }

    /**
     * Get user's scheduled sessions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserSessions(req, res) {
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
            
            // Get user's sessions
            const userSessions = Array.from(sessions.values()).filter(
                session => session.userId === userId
            );
            
            res.json({
                success: true,
                data: userSessions
            });
        } catch (error) {
            console.error('Get user sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch sessions',
                error: error.message
            });
        }
    }

    /**
     * Get expert's scheduled sessions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getExpertSessions(req, res) {
        try {
            const { expertId } = req.params;
            
            // Check if expert exists
            const expert = experts.find(e => e.id === expertId);
            if (!expert) {
                return res.status(404).json({
                    success: false,
                    message: 'Expert not found'
                });
            }
            
            // Get expert's sessions
            const expertSessions = Array.from(sessions.values()).filter(
                session => session.expertId === expertId
            );
            
            res.json({
                success: true,
                data: expertSessions
            });
        } catch (error) {
            console.error('Get expert sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch sessions',
                error: error.message
            });
        }
    }

    /**
     * Cancel a session
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async cancelSession(req, res) {
        try {
            const { sessionId } = req.params;
            
            const session = sessions.get(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }
            
            // Update session status
            session.status = 'cancelled';
            session.cancelledAt = new Date().toISOString();
            
            sessions.set(sessionId, session);
            
            res.json({
                success: true,
                message: 'Session cancelled successfully',
                data: session
            });
        } catch (error) {
            console.error('Cancel session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel session',
                error: error.message
            });
        }
    }

    /**
     * Submit feedback for a session
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async submitFeedback(req, res) {
        try {
            const { sessionId, rating, feedback } = req.body;
            
            // Validate inputs
            if (!sessionId || rating === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Session ID and rating are required'
                });
            }
            
            const session = sessions.get(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }
            
            // Update session with feedback
            session.rating = rating;
            session.feedback = feedback || '';
            session.feedbackSubmitted = true;
            session.feedbackAt = new Date().toISOString();
            
            sessions.set(sessionId, session);
            
            // Update expert's rating (simplified calculation)
            const expert = experts.find(e => e.id === session.expertId);
            if (expert) {
                expert.rating = ((expert.rating * expert.reviews) + rating) / (expert.reviews + 1);
                expert.reviews += 1;
            }
            
            res.json({
                success: true,
                message: 'Feedback submitted successfully',
                data: session
            });
        } catch (error) {
            console.error('Submit feedback error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit feedback',
                error: error.message
            });
        }
    }

    /**
     * Get upcoming sessions for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUpcomingSessions(req, res) {
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
            
            // Get user's upcoming sessions
            const now = new Date();
            const upcomingSessions = Array.from(sessions.values()).filter(
                session => session.userId === userId && 
                          new Date(session.scheduledAt) > now &&
                          session.status === 'scheduled'
            );
            
            res.json({
                success: true,
                data: upcomingSessions
            });
        } catch (error) {
            console.error('Get upcoming sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch upcoming sessions',
                error: error.message
            });
        }
    }
}

module.exports = new ExpertSupportController();