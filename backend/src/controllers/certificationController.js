const User = require('../models/User');
const Scenario = require('../models/Scenario');
const UserProgress = require('../models/UserProgress');
const { v4: uuidv4 } = require('uuid');

// Mock blockchain service (in a real implementation, this would connect to an actual blockchain)
class MockBlockchainService {
    constructor() {
        this.certificates = new Map();
    }

    async issueCertificate(certificateData) {
        // In a real implementation, this would interact with a blockchain
        const certificateId = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;
        const issueDate = new Date().toISOString();
        
        const certificate = {
            id: certificateId,
            ...certificateData,
            issueDate,
            blockchainHash: this.generateHash(certificateData),
            status: 'issued'
        };
        
        this.certificates.set(certificateId, certificate);
        return certificate;
    }
    
    async verifyCertificate(certificateId) {
        const certificate = this.certificates.get(certificateId);
        if (!certificate) {
            return { valid: false, message: 'Certificate not found' };
        }
        
        const currentHash = this.generateHash({
            userId: certificate.userId,
            certificationType: certificate.certificationType,
            issueDate: certificate.issueDate,
            userName: certificate.userName
        });
        
        const valid = currentHash === certificate.blockchainHash;
        return { 
            valid, 
            message: valid ? 'Certificate is valid' : 'Certificate has been tampered with',
            certificate
        };
    }
    
    generateHash(data) {
        // Simple hash function for demonstration (in real implementation, use cryptographic hashing)
        return require('crypto')
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex')
            .substring(0, 32);
    }
}

const blockchainService = new MockBlockchainService();

class CertificationController {
    /**
     * Get available certifications
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAvailableCertifications(req, res) {
        try {
            // Define available certifications
            const certifications = [
                {
                    id: 'criminal-law',
                    name: 'Criminal Law Certification',
                    description: 'Certification in Criminal Law Practice',
                    requirements: [
                        'Complete 5 criminal law scenarios',
                        'Achieve 80% average score',
                        'Pass final assessment'
                    ],
                    duration: '4 weeks',
                    difficulty: 'Advanced',
                    practiceAreas: ['Criminal Law'],
                    price: 0 // Free for now
                },
                {
                    id: 'civil-law',
                    name: 'Civil Law Certification',
                    description: 'Certification in Civil Law Practice',
                    requirements: [
                        'Complete 5 civil law scenarios',
                        'Achieve 80% average score',
                        'Pass final assessment'
                    ],
                    duration: '4 weeks',
                    difficulty: 'Advanced',
                    practiceAreas: ['Civil Law'],
                    price: 0 // Free for now
                },
                {
                    id: 'corporate-law',
                    name: 'Corporate Law Certification',
                    description: 'Certification in Corporate Law Practice',
                    requirements: [
                        'Complete 5 corporate law scenarios',
                        'Achieve 80% average score',
                        'Pass final assessment'
                    ],
                    duration: '4 weeks',
                    difficulty: 'Expert',
                    practiceAreas: ['Corporate Law'],
                    price: 0 // Free for now
                },
                {
                    id: 'family-law',
                    name: 'Family Law Certification',
                    description: 'Certification in Family Law Practice',
                    requirements: [
                        'Complete 5 family law scenarios',
                        'Achieve 80% average score',
                        'Pass final assessment'
                    ],
                    duration: '4 weeks',
                    difficulty: 'Intermediate',
                    practiceAreas: ['Family Law'],
                    price: 0 // Free for now
                },
                {
                    id: 'constitutional-law',
                    name: 'Constitutional Law Certification',
                    description: 'Certification in Constitutional Law Practice',
                    requirements: [
                        'Complete 5 constitutional law scenarios',
                        'Achieve 80% average score',
                        'Pass final assessment'
                    ],
                    duration: '4 weeks',
                    difficulty: 'Expert',
                    practiceAreas: ['Constitutional Law'],
                    price: 0 // Free for now
                },
                {
                    id: 'tax-law',
                    name: 'Tax Law Certification',
                    description: 'Certification in Tax Law Practice',
                    requirements: [
                        'Complete 5 tax law scenarios',
                        'Achieve 80% average score',
                        'Pass final assessment'
                    ],
                    duration: '4 weeks',
                    difficulty: 'Advanced',
                    practiceAreas: ['Tax Law'],
                    price: 0 // Free for now
                },
                {
                    id: 'intellectual-property',
                    name: 'Intellectual Property Certification',
                    description: 'Certification in Intellectual Property Law Practice',
                    requirements: [
                        'Complete 5 intellectual property scenarios',
                        'Achieve 80% average score',
                        'Pass final assessment'
                    ],
                    duration: '4 weeks',
                    difficulty: 'Advanced',
                    practiceAreas: ['Intellectual Property'],
                    price: 0 // Free for now
                }
            ];

            res.json({
                success: true,
                data: certifications
            });
        } catch (error) {
            console.error('Get certifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch certifications',
                error: error.message
            });
        }
    }

    /**
     * Get user's earned certifications
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserCertifications(req, res) {
        try {
            const { userId } = req.params;
            
            // In a real implementation, this would query the blockchain or database
            // For now, we'll return mock data
            const userCertifications = [
                {
                    id: 'CERT-ABC123',
                    certificationType: 'criminal-law',
                    certificationName: 'Criminal Law Certification',
                    issueDate: '2023-10-15T10:30:00Z',
                    expiryDate: '2026-10-15T10:30:00Z',
                    userName: 'John Doe',
                    userId: userId,
                    blockchainHash: 'a1b2c3d4e5f67890',
                    status: 'active'
                }
            ];

            res.json({
                success: true,
                data: userCertifications
            });
        } catch (error) {
            console.error('Get user certifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user certifications',
                error: error.message
            });
        }
    }

    /**
     * Check if user is eligible for a certification
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async checkCertificationEligibility(req, res) {
        try {
            const { userId, certificationId } = req.params;
            
            // Check user progress for required scenarios
            const userProgress = await UserProgress.find({ 
                user: userId, 
                status: 'completed' 
            }).populate('scenario');
            
            // Define certification requirements
            const requirements = {
                'criminal-law': {
                    requiredScenarios: 5,
                    minAverageScore: 80,
                    practiceArea: 'Criminal Law'
                },
                'civil-law': {
                    requiredScenarios: 5,
                    minAverageScore: 80,
                    practiceArea: 'Civil Law'
                },
                'corporate-law': {
                    requiredScenarios: 5,
                    minAverageScore: 80,
                    practiceArea: 'Corporate Law'
                },
                'family-law': {
                    requiredScenarios: 5,
                    minAverageScore: 80,
                    practiceArea: 'Family Law'
                },
                'constitutional-law': {
                    requiredScenarios: 5,
                    minAverageScore: 80,
                    practiceArea: 'Constitutional Law'
                },
                'tax-law': {
                    requiredScenarios: 5,
                    minAverageScore: 80,
                    practiceArea: 'Tax Law'
                },
                'intellectual-property': {
                    requiredScenarios: 5,
                    minAverageScore: 80,
                    practiceArea: 'Intellectual Property'
                }
            };
            
            const certRequirements = requirements[certificationId];
            if (!certRequirements) {
                return res.status(404).json({
                    success: false,
                    message: 'Certification not found'
                });
            }
            
            // Filter completed scenarios by practice area
            const relevantScenarios = userProgress.filter(progress => 
                progress.scenario.practiceArea === certRequirements.practiceArea
            );
            
            // Check if user meets requirements
            const completedScenarios = relevantScenarios.length;
            const averageScore = relevantScenarios.length > 0 
                ? relevantScenarios.reduce((sum, progress) => sum + (progress.score || 0), 0) / relevantScenarios.length
                : 0;
            
            const isEligible = 
                completedScenarios >= certRequirements.requiredScenarios && 
                averageScore >= certRequirements.minAverageScore;
            
            res.json({
                success: true,
                data: {
                    eligible: isEligible,
                    completedScenarios,
                    requiredScenarios: certRequirements.requiredScenarios,
                    averageScore: Math.round(averageScore * 100) / 100,
                    minAverageScore: certRequirements.minAverageScore,
                    practiceArea: certRequirements.practiceArea
                }
            });
        } catch (error) {
            console.error('Check certification eligibility error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check certification eligibility',
                error: error.message
            });
        }
    }

    /**
     * Issue a certificate to a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async issueCertificate(req, res) {
        try {
            const { userId, certificationId } = req.params;
            
            // Verify user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Check eligibility
            const eligibilityResponse = await this.checkCertificationEligibility({ 
                params: { userId, certificationId } 
            }, {
                json: (data) => {
                    if (!data.success || !data.data.eligible) {
                        throw new Error('Not eligible');
                    }
                },
                status: (code) => {
                    if (code !== 200) {
                        throw new Error('Eligibility check failed');
                    }
                    return { json: () => {} };
                }
            });
            
            // Define certification details
            const certifications = {
                'criminal-law': {
                    name: 'Criminal Law Certification',
                    description: 'Certification in Criminal Law Practice'
                },
                'civil-law': {
                    name: 'Civil Law Certification',
                    description: 'Certification in Civil Law Practice'
                },
                'corporate-law': {
                    name: 'Corporate Law Certification',
                    description: 'Certification in Corporate Law Practice'
                },
                'family-law': {
                    name: 'Family Law Certification',
                    description: 'Certification in Family Law Practice'
                },
                'constitutional-law': {
                    name: 'Constitutional Law Certification',
                    description: 'Certification in Constitutional Law Practice'
                },
                'tax-law': {
                    name: 'Tax Law Certification',
                    description: 'Certification in Tax Law Practice'
                },
                'intellectual-property': {
                    name: 'Intellectual Property Certification',
                    description: 'Certification in Intellectual Property Law Practice'
                }
            };
            
            const certDetails = certifications[certificationId];
            if (!certDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'Certification not found'
                });
            }
            
            // Issue certificate on blockchain
            const certificateData = {
                userId: user._id.toString(),
                userName: `${user.firstName} ${user.lastName}`,
                certificationType: certificationId,
                certificationName: certDetails.name,
                description: certDetails.description
            };
            
            const certificate = await blockchainService.issueCertificate(certificateData);
            
            res.json({
                success: true,
                message: 'Certificate issued successfully',
                data: certificate
            });
        } catch (error) {
            console.error('Issue certificate error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to issue certificate',
                error: error.message
            });
        }
    }

    /**
     * Verify a certificate
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async verifyCertificate(req, res) {
        try {
            const { certificateId } = req.params;
            
            const verification = await blockchainService.verifyCertificate(certificateId);
            
            res.json({
                success: true,
                data: verification
            });
        } catch (error) {
            console.error('Verify certificate error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify certificate',
                error: error.message
            });
        }
    }
}

module.exports = new CertificationController();