const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

class VoiceService {
    constructor() {
        // Check if we're on Windows or Unix-like system
        this.isWindows = os.platform() === 'win32';
        this.tempDir = os.tmpdir();
    }

    /**
     * Convert text to speech using Python gTTS
     * @param {string} text - Text to convert to speech
     * @param {string} language - Language code (en, hi, ta, etc.)
     * @returns {Promise<string>} - Path to the generated audio file
     */
    async textToSpeech(text, language = 'en') {
        return new Promise((resolve, reject) => {
            // Create a unique filename for the audio file
            const filename = `tts_${uuidv4()}.wav`;
            const filepath = path.join(this.tempDir, filename);
            
            // Prepare the input data
            const inputData = {
                text: text,
                language: language,
                output_path: filepath
            };

            // Configure PythonShell options
            const options = {
                mode: 'text',
                pythonPath: process.env.PYTHON_PATH || 'python',
                pythonOptions: ['-u'],
                scriptPath: path.join(__dirname, '..'),
                args: []
            };

            // Start the Python process
            const pythonShell = new PythonShell('tts_script.py', options);

            // Send the input data to the Python script
            pythonShell.send(JSON.stringify(inputData));

            // Collect the output
            let output = '';
            pythonShell.on('message', (message) => {
                output += message;
            });

            // Handle completion
            pythonShell.end((err) => {
                if (err) {
                    reject(new Error(`Text-to-speech conversion failed: ${err}`));
                } else {
                    try {
                        // Parse the JSON output from Python
                        const result = JSON.parse(output);
                        if (result.success) {
                            resolve(filepath);
                        } else {
                            reject(new Error(result.error || 'Text-to-speech conversion failed'));
                        }
                    } catch (parseError) {
                        reject(new Error(`Failed to parse Python output: ${parseError.message}`));
                    }
                }
            });
        });
    }

    /**
     * Get supported voices for a language
     * @param {string} language - Language code
     * @returns {Promise<Array>} - List of supported voices
     */
    async getSupportedVoices(language = 'en') {
        // For now, return a static list of voices
        // In a production environment, this would query the TTS engine
        const voices = {
            'en': [
                { id: 'en-US-Standard-C', name: 'English (US) Standard C', gender: 'female' },
                { id: 'en-US-Standard-D', name: 'English (US) Standard D', gender: 'male' },
                { id: 'en-US-Wavenet-C', name: 'English (US) Wavenet C', gender: 'female' },
                { id: 'en-US-Wavenet-D', name: 'English (US) Wavenet D', gender: 'male' }
            ],
            'hi': [
                { id: 'hi-IN-Standard-A', name: 'Hindi Standard A', gender: 'female' },
                { id: 'hi-IN-Standard-B', name: 'Hindi Standard B', gender: 'male' },
                { id: 'hi-IN-Wavenet-A', name: 'Hindi Wavenet A', gender: 'female' },
                { id: 'hi-IN-Wavenet-B', name: 'Hindi Wavenet B', gender: 'male' }
            ],
            'ta': [
                { id: 'ta-IN-Standard-A', name: 'Tamil Standard A', gender: 'female' },
                { id: 'ta-IN-Standard-B', name: 'Tamil Standard B', gender: 'male' }
            ]
        };

        return voices[language] || voices['en'];
    }

    /**
     * Clean up temporary audio files
     * @param {string} filepath - Path to the audio file to delete
     */
    async cleanupAudioFile(filepath) {
        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        } catch (error) {
            console.error('Failed to cleanup audio file:', error);
        }
    }
}

module.exports = new VoiceService();