const User = require('../models/User');

class LanguageController {
    /**
     * Get supported languages
     */
    async getSupportedLanguages(req, res) {
        try {
            // Supported languages for the platform
            const languages = [
                { code: 'en', name: 'English', nativeName: 'English' },
                { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
                { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
                { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
                { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
                { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
                { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
                { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
                { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
                { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
                { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
                { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' }
            ];

            res.json({
                success: true,
                data: languages
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch supported languages',
                error: error.message
            });
        }
    }

    /**
     * Set user language preference
     */
    async setUserLanguage(req, res) {
        try {
            const { userId } = req.params;
            const { languageCode } = req.body;

            // Validate language code
            const supportedLanguages = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];
            if (!supportedLanguages.includes(languageCode)) {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported language code'
                });
            }

            // Update user's language preference
            const user = await User.findByIdAndUpdate(
                userId,
                { 
                    $set: { 
                        'preferences.language': languageCode,
                        'updatedAt': new Date()
                    }
                },
                { new: true, select: 'preferences' }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'Language preference updated successfully',
                data: user.preferences
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update language preference',
                error: error.message
            });
        }
    }

    /**
     * Get user language preference
     */
    async getUserLanguage(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findById(userId).select('preferences');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const languageCode = user.preferences?.language || 'en';

            res.json({
                success: true,
                data: {
                    languageCode: languageCode
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user language preference',
                error: error.message
            });
        }
    }
}

module.exports = new LanguageController();