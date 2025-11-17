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
            customScenarios: 2,
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
                description: 'Access to view case files in simulations. No scenarios, document analysis, or advanced features.'
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
                description: 'Ideal for individual users who need basic scenarios and document analysis'
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
                description: 'Great for regular users who want more scenarios and document analysis'
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
                description: 'The ultimate plan with unlimited access to all features'
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
        const validPlans = ['free', 'basic', 'standard', 'premium'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // In a real implementation, you would process the payment with a payment gateway
        // For this demo, we'll simulate a successful payment
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create payment record
        const payment = await new Promise((resolve, reject) => {
            const createdAt = new Date().toISOString();
            db.run(
                `INSERT INTO payments 
                 (user_id, amount, currency, payment_method, payment_id, status, plan, features, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.user.userId,
                    amount,
                    'INR',
                    paymentMethod,
                    paymentId,
                    'completed',
                    plan,
                    JSON.stringify(getPlanFeatures(plan)),
                    createdAt
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            user_id: req.user.userId,
                            amount,
                            currency: 'INR',
                            payment_method: paymentMethod,
                            payment_id,
                            status: 'completed',
                            plan,
                            features: getPlanFeatures(plan),
                            created_at: createdAt
                        });
                    }
                }
            );
        });
        
        // Create or update subscription
        const subscription = await new Promise((resolve, reject) => {
            const startDate = new Date().toISOString();
            const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            
            // Check if user already has a subscription
            db.get('SELECT * FROM subscriptions WHERE user_id = ?', [req.user.userId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (row) {
                    // Update existing subscription
                    db.run(
                        `UPDATE subscriptions 
                         SET plan = ?, status = ?, start_date = ?, end_date = ?, features = ?, updated_at = ? 
                         WHERE id = ?`,
                        [
                            plan,
                            'active',
                            startDate,
                            endDate,
                            JSON.stringify(getPlanFeatures(plan)),
                            new Date().toISOString(),
                            row.id
                        ],
                        function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({
                                    id: row.id,
                                    user_id: req.user.userId,
                                    plan,
                                    status: 'active',
                                    start_date: startDate,
                                    end_date: endDate,
                                    features: getPlanFeatures(plan),
                                    updated_at: new Date().toISOString()
                                });
                            }
                        }
                    );
                } else {
                    // Create new subscription
                    db.run(
                        `INSERT INTO subscriptions 
                         (user_id, plan, status, start_date, end_date, features, created_at, updated_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            req.user.userId,
                            plan,
                            'active',
                            startDate,
                            endDate,
                            JSON.stringify(getPlanFeatures(plan)),
                            new Date().toISOString(),
                            new Date().toISOString()
                        ],
                        function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({
                                    id: this.lastID,
                                    user_id: req.user.userId,
                                    plan,
                                    status: 'active',
                                    start_date: startDate,
                                    end_date: endDate,
                                    features: getPlanFeatures(plan),
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                });
                            }
                        }
                    );
                }
            });
        });
        
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
        const payments = await new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', 
                [req.user.userId], 
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
        
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