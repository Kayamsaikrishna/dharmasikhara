const voiceService = require('../services/voiceService');
const fs = require('fs');
const path = require('path');

class VoiceController {
    /**
     * Convert text to speech
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async textToSpeech(req, res) {
        try {
            const { text, language } = req.body;
            
            if (!text) {
                return res.status(400).json({
                    success: false,
                    message: 'Text is required'
                });
            }
            
            // Default to English if no language specified
            const langCode = language || 'en';
            
            // Convert text to speech
            const audioFilePath = await voiceService.textToSpeech(text, langCode);
            
            // Check if file exists
            if (!fs.existsSync(audioFilePath)) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate audio file'
                });
            }
            
            // Set headers for audio file
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Content-Disposition', `inline; filename="speech.wav"`);
            
            // Stream the audio file
            const audioStream = fs.createReadStream(audioFilePath);
            
            // Pipe the stream to response
            audioStream.pipe(res);
            
            // Clean up the temporary file after streaming
            audioStream.on('close', () => {
                voiceService.cleanupAudioFile(audioFilePath);
            });
            
            audioStream.on('error', (error) => {
                console.error('Error streaming audio file:', error);
                voiceService.cleanupAudioFile(audioFilePath);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Failed to stream audio file'
                    });
                }
            });
            
        } catch (error) {
            console.error('Text-to-speech error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to convert text to speech',
                error: error.message
            });
        }
    }

    /**
     * Get supported voices for a language
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getVoices(req, res) {
        try {
            const { language } = req.query;
            const langCode = language || 'en';
            
            const voices = await voiceService.getSupportedVoices(langCode);
            
            res.json({
                success: true,
                data: voices
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch supported voices',
                error: error.message
            });
        }
    }
}

module.exports = new VoiceController();