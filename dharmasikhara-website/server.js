const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const nodemailer = require('nodemailer');
const { PythonShell } = require('python-shell');
require('dotenv').config();

// Import the AI controller
const LegalAIController = require('./ai/ai_controller');
const aiController = new LegalAIController();

const app = express();
// Use the PORT from environment variables or try different ports
const PORT = process.env.PORT || 3000;
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

// Log the file path for debugging
console.log('Subscribers file path:', SUBSCRIBERS_FILE);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files with proper headers for subdomain hosting
app.use(express.static('src', {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Serve the logo files
app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));

// Create a transporter object using SMTP transport
const createTransporter = () => {
    console.log('Creating transporter with config:', {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true'
    });
    
    // Special handling for cPanel hosting
    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('infernomach')) {
        const config = {
            host: process.env.EMAIL_HOST || 'mail.infernomach.in',
            port: parseInt(process.env.EMAIL_PORT) || 465,
            secure: process.env.EMAIL_SECURE === 'true', // true for port 465 (SSL)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        };
        
        console.log('Using cPanel mail transporter config:', config);
        return nodemailer.createTransport(config);
    }
    
    // Special handling for custom domain
    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('hostliger')) {
        const config = {
            host: process.env.EMAIL_HOST || 'cloud.hostliger.in',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true', // false for port 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        };
        
        console.log('Using custom domain transporter config:', config);
        return nodemailer.createTransport(config);
    }
    
    // Special handling for Outlook/Office365
    if (process.env.EMAIL_HOST && (process.env.EMAIL_HOST.includes('office365') || process.env.EMAIL_HOST.includes('outlook'))) {
        const config = {
            host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            },
            authMethod: 'LOGIN',
            requireTLS: true,
            pool: true,
            maxConnections: 1,
            maxMessages: Infinity,
            rateDelta: 1000,
            rateLimit: 1
        };
        
        console.log('Using Outlook-specific transporter config:', config);
        return nodemailer.createTransport(config);
    }
    
    // Default configuration for other providers
    const config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    };
    
    console.log('Using default transporter config:', config);
    return nodemailer.createTransport(config);
};

// Serve the main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Handle email subscription
app.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address' 
            });
        }
        
        const emails = await getEmails();
        if (emails.includes(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'This email is already subscribed' 
            });
        }
        
        await saveEmail(email);
        console.log(`Email saved successfully: ${email}`);
        
        // Check AI model status
        let aiStatus = "AI features coming soon";
        try {
            const isAvailable = await aiController.isModelAvailable();
            aiStatus = isAvailable ? "AI-powered features now available" : "AI features coming soon";
        } catch (aiError) {
            console.log("AI status check failed:", aiError.message);
        }
        
        const emailSent = await sendConfirmationEmail(email, aiStatus);
        
        if (emailSent) {
            res.json({ 
                success: true, 
                message: `Thank you ${email}! We'll notify you when DharmaSikhara launches. A confirmation email has been sent to your inbox.` 
            });
        } else {
            res.json({ 
                success: true, 
                message: `Thank you ${email}! We'll notify you when DharmaSikhara launches. You're successfully subscribed to our mailing list.` 
            });
        }
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred. Please try again later.' 
        });
    }
});

// Get all subscribed emails (for admin use)
app.get('/subscribers', async (req, res) => {
    try {
        console.log('Fetching subscribers from:', SUBSCRIBERS_FILE);
        
        // Check if file exists
        const fileExists = fsSync.existsSync(SUBSCRIBERS_FILE);
        console.log('File exists:', fileExists);
        
        const emails = await getEmails();
        console.log('Retrieved emails:', emails);
        
        res.json({ 
            success: true, 
            emails,
            fileLocation: SUBSCRIBERS_FILE,
            emailCount: emails.length
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while fetching subscribers',
            error: error.message
        });
    }
});

// Debug endpoint - check file system
app.get('/debug/subscribers-file', async (req, res) => {
    try {
        const fileExists = fsSync.existsSync(SUBSCRIBERS_FILE);
        let fileContent = null;
        let fileStats = null;
        
        if (fileExists) {
            fileContent = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
            fileStats = fsSync.statSync(SUBSCRIBERS_FILE);
        }
        
        res.json({
            filePath: SUBSCRIBERS_FILE,
            fileExists,
            fileSize: fileStats ? fileStats.size : null,
            fileContent: fileContent ? JSON.parse(fileContent) : null,
            serverDir: __dirname
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            filePath: SUBSCRIBERS_FILE
        });
    }
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Save email to file
async function saveEmail(email) {
    try {
        let emails = [];
        
        try {
            const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
            emails = JSON.parse(data);
            console.log('Existing emails loaded:', emails);
        } catch (error) {
            console.log('No existing subscribers file, creating new one');
            emails = [];
        }
        
        if (!emails.includes(email)) {
            emails.push(email);
            await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(emails, null, 2));
            console.log('Email file updated successfully');
        }
    } catch (error) {
        console.error('Error saving email:', error);
        throw error;
    }
}

// Get all emails from file
async function getEmails() {
    try {
        const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Could not read subscribers file:', error.message);
        return [];
    }
}

// Send confirmation email
async function sendConfirmationEmail(email, aiStatus = "AI features coming soon") {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[INFO] Email service not configured. Subscription recorded for: ${email}`);
            return false;
        }
        
        const transporter = createTransporter();
        
        console.log(`Attempting to send email to: ${email}`);
        console.log(`Using host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
        console.log(`Using port: ${parseInt(process.env.EMAIL_PORT) || 587}`);
        console.log(`Using user: ${process.env.EMAIL_USER}`);
        
        const mailOptions = {
            from: `"DharmaSikhara" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to DharmaSikhara - Legal Education Revolution!',
            html: `
                <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="background-color: #1A365D; padding: 20px; text-align: center;">
                            <img src="http://localhost:3000/assets/law_icon.png" alt="DharmaSikhara Icon" style="max-width: 50px; height: auto; margin-bottom: 10px;">
                            <h1 style="margin: 0; font-size: 28px; color: white;">DharmaSikhara</h1>
                            <p style="margin: 10px 0 0; font-size: 16px; color: white;">Master the Law, Master Your Future</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #f8f9fa;">
                            <h2 style="color: #1A365D;">Thank you for subscribing!</h2>
                            <p>Dear Future Legal Professional,</p>
                            <p>Thank you for your interest in DharmaSikhara, the revolutionary legal practice simulator that's transforming how law students and junior lawyers develop essential courtroom skills.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-collapse: collapse;">
                                <tr>
                                    <td>
                                        <h3 style="color: #1A365D; margin-top: 0;"><i class="fas fa-robot"></i> AI Features Update</h3>
                                        <p><strong>${aiStatus}</strong></p>
                                        <p>Our advanced legal AI can now analyze documents, identify key terms, and provide insights to help you master legal concepts faster.</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p>You're now part of our exclusive community and will be among the first to:</p>
                            <ul style="margin: 20px 0; padding-left: 20px;">
                                <li>Receive early access invitations</li>
                                <li>Get special launch offers</li>
                                <li>Access exclusive updates and features</li>
                                <li>Try our new AI-powered legal document analysis tool</li>
                            </ul>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-collapse: collapse;">
                                <tr>
                                    <td>
                                        <h3 style="color: #1A365D; margin-top: 0;">What to Expect</h3>
                                        <p>DharmaSikhara bridges the gap between legal theory and practice by offering an immersive simulation environment where you can experience realistic courtroom scenarios without real-world consequences.</p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin-top: 30px;"><strong>Stay tuned for our launch announcement!</strong></p>
                            <p>Best regards,<br>The DharmaSikhara Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="background-color: #0F1C2E; color: #E2E8F0; padding: 20px; text-align: center; font-size: 14px;">
                            <img src="http://localhost:3000/assets/law_icon.png" alt="DharmaSikhara Icon" style="max-width: 30px; height: auto; margin-bottom: 10px;">
                            <p>&copy; 2025 DharmaSikhara. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            `
        };
        
        try {
            console.log('Attempting to verify SMTP connection...');
            await transporter.verify();
            console.log('SMTP connection verified successfully');
        } catch (verifyError) {
            console.log('[INFO] Email service configuration issue detected');
            console.log('[DEBUG] Verification error:', verifyError.message);
            if (verifyError.code) {
                console.log('[DEBUG] Error code:', verifyError.code);
            }
            if (verifyError.response) {
                console.log('[DEBUG] Error response:', verifyError.response);
            }
            
            // Additional debugging for authentication issues
            if (verifyError.message.includes('535') || verifyError.message.includes('authentication')) {
                console.log('[DEBUG] Authentication debugging info:');
                console.log('  - EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}...${process.env.EMAIL_USER.substring(process.env.EMAIL_USER.length-3)}` : 'NOT SET');
                console.log('  - EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
                console.log('  - EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
                console.log('  - EMAIL_SECURE:', process.env.EMAIL_SECURE || 'NOT SET');
                console.log('  - Password length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'NOT SET');
            }
            
            return false;
        }
        
        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to: ${email}`);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.log('[INFO] Email service temporarily unavailable');
        console.log('[DEBUG] Error:', error.message);
        if (error.code) {
            console.log('[DEBUG] Error code:', error.code);
        }
        if (error.response) {
            console.log('[DEBUG] Error response:', error.response);
        }
        return false;
    }
}

// AI Document Analysis Endpoint
app.post('/api/analyze-document', async (req, res) => {
    try {
        const { documentText } = req.body;
        
        if (!documentText) {
            return res.status(400).json({
                success: false,
                message: 'Document text is required'
            });
        }
        
        // Analyze the document using the AI model
        const analysisResult = await aiController.analyzeDocument(documentText);
        
        if (analysisResult.error) {
            return res.status(500).json({
                success: false,
                message: 'AI analysis failed',
                error: analysisResult.error
            });
        }
        
        res.json({
            success: true,
            data: analysisResult
        });
    } catch (error) {
        console.error('Document analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during document analysis',
            error: error.message
        });
    }
});

// AI Model Status Endpoint
app.get('/api/ai-status', async (req, res) => {
    try {
        const isAvailable = await aiController.isModelAvailable();
        
        res.json({
            success: true,
            data: {
                modelAvailable: isAvailable,
                modelName: 'InCaseLawBERT',
                status: isAvailable ? 'Ready' : 'Unavailable'
            }
        });
    } catch (error) {
        console.error('AI status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check AI model status',
            error: error.message
        });
    }
});

// Start server with port conflict handling
const HOST = process.env.HOST || 'localhost';

function startServer(port) {
    const server = app.listen(port, HOST, () => {
        console.log(`DharmaSikhara server running on http://${HOST}:${port}`);
        console.log(`Subscribers file location: ${SUBSCRIBERS_FILE}`);
        console.log('Debug endpoint available at: http://localhost:3000/debug/subscribers-file');
        
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log('Email service is configured.');
        } else {
            console.log('Email service not configured.');
        }
    });
    
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use, trying ${port + 1}...`);
            if (port < 3010) { // Try up to 10 ports
                startServer(port + 1);
            } else {
                console.error('Unable to find an available port after 10 attempts.');
                process.exit(1);
            }
        } else {
            console.error('Server error:', error);
            process.exit(1);
        }
    });
}

// Start the server
startServer(PORT);

module.exports = app;