const databaseService = require('../services/database');

const getPlanFeatures = (plan) => {
    const features = {
        free: {
            documentAnalysis: false,
            scenariosAccess: 0,
            multiplayerAccess: false,
            customScenarios: 0,
            prioritySupport: false,
            storage: '0 GB',
            documentAnalysisLimit: '0 per week',
            legalAssistantTokens: 'Limited'
        },
        basic: {
            documentAnalysis: true,
            scenariosAccess: 1,
            multiplayerAccess: false,
            customScenarios: 0,
            prioritySupport: false,
            storage: '100 MB',
            documentAnalysisLimit: '2 per month',
            legalAssistantTokens: '100K'
        },
        standard: {
            documentAnalysis: true,
            scenariosAccess: 2,
            multiplayerAccess: true,
            customScenarios: 0,
            prioritySupport: false,
            storage: '500 MB',
            documentAnalysisLimit: '5 per month',
            legalAssistantTokens: '500K'
        },
        premium: {
            documentAnalysis: true,
            scenariosAccess: 4,
            multiplayerAccess: true,
            customScenarios: 0,
            prioritySupport: false,
            storage: '2 GB',
            documentAnalysisLimit: 'Unlimited',
            legalAssistantTokens: 'Unlimited'
        }
    };
    
    return features[plan] || features.free;
};

const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = [
            {
                id: 'free',
                name: 'Free Plan',
                price: 0,
                currency: 'INR',
                period: 'month',
                storage: '0 GB',
                documentAnalysisLimit: '0 per week',
                features: getPlanFeatures('free'),
                description: 'Access to view case files in simulations. No document analysis or advanced features.'
            },
            {
                id: 'basic',
                name: 'Basic Plan',
                price: 299,
                currency: 'INR',
                period: 'month',
                storage: '100 MB',
                documentAnalysisLimit: '2 per month',
                features: getPlanFeatures('basic'),
                description: 'Access to legal scenarios with limited stages: Client Counseling and Evidence Analysis.'
            },
            {
                id: 'standard',
                name: 'Standard Plan',
                price: 699,
                currency: 'INR',
                period: 'month',
                storage: '500 MB',
                documentAnalysisLimit: '5 per month',
                features: getPlanFeatures('standard'),
                description: 'Access to legal scenarios with limited stages: Client Counseling and Evidence Analysis. Includes multiplayer access.'
            },
            {
                id: 'premium',
                name: 'Premium Plan',
                price: 999,
                currency: 'INR',
                period: 'month',
                storage: '2 GB',
                documentAnalysisLimit: 'Unlimited',
                features: getPlanFeatures('premium'),
                description: 'Full access to all stages of complete legal scenarios: Client Counseling, Evidence Analysis, and Bail Drafting. Includes multiplayer access.'
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
        const { amount, paymentMethod, paymentId, plan } = req.body;
        
        // Validate required fields
        if (!amount || !paymentMethod || !paymentId || !plan) {
            return res.status(400).json({
                success: false,
                message: 'Amount, paymentMethod, paymentId, and plan are required'
            });
        }
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Create payment record
        const createdAt = new Date().toISOString();
        const paymentStmt = db.prepare(`INSERT INTO payments 
                 (user_id, amount, currency, payment_method, payment_id, status, plan, features, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        const paymentInfo = paymentStmt.run(
            req.user.userId,
            amount,
            'INR',
            paymentMethod,
            paymentId,
            'completed',
            plan,
            JSON.stringify(getPlanFeatures(plan)),
            createdAt
        );
        
        const payment = {
            id: paymentInfo.lastInsertRowid,
            user_id: req.user.userId,
            amount,
            currency: 'INR',
            payment_method: paymentMethod,
            payment_id,
            status: 'completed',
            plan,
            features: getPlanFeatures(plan),
            created_at: createdAt
        };
        
        // Create or update subscription
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Check if user already has a subscription
        const existingSubscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(req.user.userId);
        
        let subscription;
        if (existingSubscription) {
            // Update existing subscription
            const updateStmt = db.prepare(`UPDATE subscriptions 
                         SET plan = ?, status = ?, start_date = ?, end_date = ?, features = ?, updated_at = ? 
                         WHERE id = ?`);
            updateStmt.run(
                plan,
                'active',
                startDate,
                endDate,
                JSON.stringify(getPlanFeatures(plan)),
                new Date().toISOString(),
                existingSubscription.id
            );
            
            subscription = {
                id: existingSubscription.id,
                user_id: req.user.userId,
                plan,
                status: 'active',
                start_date: startDate,
                end_date: endDate,
                features: getPlanFeatures(plan),
                updated_at: new Date().toISOString()
            };
        } else {
            // Create new subscription
            const insertStmt = db.prepare(`INSERT INTO subscriptions 
                         (user_id, plan, status, start_date, end_date, features, created_at, updated_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
            const subscriptionInfo = insertStmt.run(
                req.user.userId,
                plan,
                'active',
                startDate,
                endDate,
                JSON.stringify(getPlanFeatures(plan)),
                new Date().toISOString(),
                new Date().toISOString()
            );
            
            subscription = {
                id: subscriptionInfo.lastInsertRowid,
                user_id: req.user.userId,
                plan,
                status: 'active',
                start_date: startDate,
                end_date: endDate,
                features: getPlanFeatures(plan),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
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
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Query payments from SQLite database
        const payments = db.prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.userId);
        
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

// Export all functions
module.exports = {
    getSubscriptionPlans,
    processPayment,
    getPaymentHistory,
    getPlanFeatures
};