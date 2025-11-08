const User = require('../models/User');
const Document = require('../models/Document');
const Subscription = require('../models/Subscription');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('subscription')
            .select('-password');
        
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
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching profile'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, institution, year, specialization } = req.body;
        
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (institution) updateData.institution = institution;
        if (year) updateData.year = year;
        if (specialization) updateData.specialization = specialization;
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
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
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating profile'
        });
    }
};

const getUserDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ user: req.user.userId })
            .sort({ uploadedAt: -1 });
        
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Get user documents error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching documents'
        });
    }
};

const uploadDocument = async (req, res) => {
    try {
        const { title, content, fileType, fileSize } = req.body;
        
        // For PDF files, we need to extract text content
        let extractedContent = content;
        
        // If it's a PDF file, extract text from it
        if (fileType === 'pdf' && content.startsWith('data:application/pdf')) {
            // This is a base64 encoded PDF, we need to extract text from it
            try {
                // Convert base64 to buffer
                const base64Data = content.replace('data:application/pdf;base64,', '');
                const buffer = Buffer.from(base64Data, 'base64');
                
                // Parse PDF and extract text
                const pdfData = await pdfParse(buffer);
                extractedContent = pdfData.text;
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                // If PDF parsing fails, use a placeholder
                extractedContent = 'PDF content could not be extracted';
            }
        }
        
        const document = new Document({
            user: req.user.userId,
            title,
            content: extractedContent,
            fileType,
            fileSize
        });
        
        await document.save();
        
        // Add document to user's document list
        await User.findByIdAndUpdate(req.user.userId, {
            $push: { documents: document._id }
        });
        
        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document
        });
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while uploading document'
        });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if document belongs to user
        const document = await Document.findOne({ 
            _id: id, 
            user: req.user.userId 
        });
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        
        // Delete document
        await Document.findByIdAndDelete(id);
        
        // Remove document from user's document list
        await User.findByIdAndUpdate(req.user.userId, {
            $pull: { documents: id }
        });
        
        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting document'
        });
    }
};

const getSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('subscription');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // If no subscription exists, create a free subscription
        if (!user.subscription) {
            const freeSubscription = new Subscription({
                user: user._id,
                plan: 'free',
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                features: getPlanFeatures('free')
            });
            
            await freeSubscription.save();
            
            // Update user with subscription
            user.subscription = freeSubscription._id;
            await user.save();
            
            // Populate the subscription
            await user.populate('subscription');
        }
        
        res.json({
            success: true,
            data: user.subscription
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching subscription'
        });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const { plan } = req.body;
        
        // Validate plan
        const validPlans = ['free', 'pro', 'advanced', 'premium'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan'
            });
        }
        
        const user = await User.findById(req.user.userId).populate('subscription');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        let subscription;
        
        // If user has a subscription, update it
        if (user.subscription) {
            subscription = await Subscription.findByIdAndUpdate(
                user.subscription._id,
                {
                    plan,
                    status: 'active',
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    features: getPlanFeatures(plan)
                },
                { new: true }
            );
        } else {
            // Create new subscription
            subscription = new Subscription({
                user: user._id,
                plan,
                status: 'active',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                features: getPlanFeatures(plan)
            });
            
            await subscription.save();
            
            // Update user with subscription
            user.subscription = subscription._id;
            await user.save();
        }
        
        res.json({
            success: true,
            message: 'Subscription updated successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating subscription'
        });
    }
};

const extractText = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const file = req.file;
        console.log('File received:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            bufferLength: file.buffer ? file.buffer.length : 0
        });
        
        // For PDF files, extract text content
        if (file.mimetype === 'application/pdf') {
            try {
                console.log('Attempting to parse PDF...');
                console.log('pdfParse type:', typeof pdfParse);
                
                // Check which version of pdf-parse we're using
                if (typeof pdfParse === 'function') {
                    // Old API (v1.x)
                    console.log('Using old pdf-parse API');
                    const pdfData = await pdfParse(file.buffer);
                    const extractedText = pdfData.text;
                    console.log('PDF parsed successfully, text length:', extractedText.length);
                    
                    return res.json({
                        success: true,
                        text: extractedText
                    });
                } else if (typeof pdfParse === 'object' && pdfParse.PDFParse) {
                    // New API (v2.x)
                    console.log('Using new pdf-parse API');
                    const parser = new pdfParse.PDFParse({ data: file.buffer });
                    const result = await parser.getText();
                    await parser.destroy();
                    const extractedText = result.text;
                    console.log('PDF parsed successfully, text length:', extractedText.length);
                    
                    return res.json({
                        success: true,
                        text: extractedText
                    });
                } else {
                    console.error('Unknown pdf-parse API');
                    return res.status(500).json({
                        success: false,
                        message: 'Unsupported pdf-parse API version'
                    });
                }
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                console.error('PDF parsing error stack:', pdfError.stack);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to extract text from PDF: ' + pdfError.message
                });
            }
        } 
        // For text files, return the content directly
        else if (file.mimetype.startsWith('text/')) {
            console.log('Processing text file...');
            return res.json({
                success: true,
                text: file.buffer.toString('utf8')
            });
        } 
        // Unsupported file type
        else {
            console.log('Unsupported file type:', file.mimetype);
            return res.status(400).json({
                success: false,
                message: 'Unsupported file type. Please upload a PDF or text file.'
            });
        }
    } catch (error) {
        console.error('Extract text error:', error);
        console.error('Extract text error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'An error occurred while extracting text from file: ' + error.message
        });
    }
};

// Helper function to get plan features
const getPlanFeatures = (plan) => {
    const features = {
        documentAnalysis: true,
        scenariosAccess: 0,
        multiplayerAccess: false,
        customScenarios: 0,
        prioritySupport: false,
        storage: '0 GB',
        documentAnalysisLimit: '0 per week'
    };
    
    switch (plan) {
        case 'free':
            features.scenariosAccess = 2;
            features.storage = '0 GB';
            features.documentAnalysisLimit = '5 per week';
            break;
        case 'pro':
            features.scenariosAccess = 10;
            features.multiplayerAccess = true;
            features.storage = '1 GB';
            features.documentAnalysisLimit = '10 per week';
            break;
        case 'advanced':
            features.scenariosAccess = 30;
            features.multiplayerAccess = true;
            features.customScenarios = 5;
            features.storage = '2 GB';
            features.documentAnalysisLimit = '15 per week';
            break;
        case 'premium':
            features.scenariosAccess = 100;
            features.multiplayerAccess = true;
            features.customScenarios = 20;
            features.prioritySupport = true;
            features.storage = '10 GB';
            features.documentAnalysisLimit = '25 per week';
            break;
    }
    
    return features;
};

module.exports = {
    getProfile,
    updateProfile,
    getUserDocuments,
    uploadDocument,
    deleteDocument,
    getSubscription,
    updateSubscription,
    extractText
};