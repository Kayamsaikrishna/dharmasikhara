const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = [
            {
                id: 'free',
                name: 'Basic Free Plan',
                price: 0,
                currency: 'INR',
                period: 'month',
                storage: '0 GB',
                documentAnalysisLimit: '5 per week',
                features: {
                    documentAnalysis: true,
                    scenariosAccess: 2,
                    multiplayerAccess: false,
                    customScenarios: 0,
                    prioritySupport: false,
                    storage: '0 GB',
                    documentAnalysisLimit: '5 per week'
                },
                description: 'Perfect for getting started with basic legal document analysis'
            },
            {
                id: 'pro',
                name: 'Pro Plan',
                price: 499,
                currency: 'INR',
                period: 'month',
                storage: '1 GB',
                documentAnalysisLimit: '10 per week',
                features: {
                    documentAnalysis: true,
                    scenariosAccess: 10,
                    multiplayerAccess: true,
                    customScenarios: 0,
                    prioritySupport: false,
                    storage: '1 GB',
                    documentAnalysisLimit: '10 per week'
                },
                description: 'Ideal for regular users who need more scenarios and multiplayer access'
            },
            {
                id: 'advanced',
                name: 'Advanced Plan',
                price: 899,
                currency: 'INR',
                period: 'month',
                storage: '2 GB',
                documentAnalysisLimit: '15 per week',
                features: {
                    documentAnalysis: true,
                    scenariosAccess: 30,
                    multiplayerAccess: true,
                    customScenarios: 5,
                    prioritySupport: false,
                    storage: '2 GB',
                    documentAnalysisLimit: '15 per week'
                },
                description: 'Great for serious learners who want to create custom scenarios'
            },
            {
                id: 'premium',
                name: 'Premium Plan',
                price: 1499,
                currency: 'INR',
                period: 'month',
                storage: '10 GB',
                documentAnalysisLimit: '25 per week',
                features: {
                    documentAnalysis: true,
                    scenariosAccess: 100,
                    multiplayerAccess: true,
                    customScenarios: 20,
                    prioritySupport: true,
                    storage: '10 GB',
                    documentAnalysisLimit: '25 per week'
                },
                description: 'The ultimate plan with unlimited access and priority support'
            }
        ];
        
        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Get subscription plans error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching subscription plans'
        });
    }
};

const processPayment = async (req, res) => {
    try {
        const { paymentMethod, cardNumber, expiry, cvv, name, plan, amount } = req.body;
        
        // Validate required fields
        if (!paymentMethod || !plan || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment information'
            });
        }
        
        // Validate plan
        const validPlans = ['free', 'pro', 'advanced', 'premium'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }
        
        // In a real implementation, you would process the payment with a payment gateway
        // For this demo, we'll simulate a successful payment
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create payment record
        const payment = new Payment({
            user: req.user.userId,
            amount,
            paymentMethod,
            paymentId,
            status: 'completed',
            plan,
            features: getPlanFeatures(plan)
        });
        
        await payment.save();
        
        // Update or create subscription
        const user = await User.findById(req.user.userId).populate('subscription');
        
        let subscription;
        if (user.subscription) {
            // Update existing subscription
            subscription = await Subscription.findByIdAndUpdate(
                user.subscription._id,
                {
                    plan,
                    status: 'active',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    features: getPlanFeatures(plan)
                },
                { new: true }
            );
        } else {
            // Create new subscription
            subscription = new Subscription({
                user: req.user.userId,
                plan,
                status: 'active',
                startDate: new Date(),
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
            message: 'Payment processed successfully',
            data: {
                payment,
                subscription
            }
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing payment'
        });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching payment history'
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
    getSubscriptionPlans,
    processPayment,
    getPaymentHistory
};