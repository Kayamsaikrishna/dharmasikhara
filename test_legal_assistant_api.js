const express = require('express');
const { PythonShell } = require('python-shell');
const path = require('path');

const app = express();
app.use(express.json());

// Test endpoint for the Legal Assistant
app.post('/api/ai/legal-assistant', (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query is required'
            });
        }
        
        // Path to the Python script
        const pythonScriptPath = path.join(__dirname, 'backend', 'legal_ai.py');
        
        // Configure PythonShell options
        const options = {
            mode: 'text',
            pythonPath: 'python',
            pythonOptions: ['-u'],
            scriptPath: path.dirname(pythonScriptPath),
            args: []
        };
        
        // Start the Python process
        const pythonShell = new PythonShell(path.basename(pythonScriptPath), options);
        
        // Prepare the input data
        const inputData = {
            query: query,
            query_type: 'legal_assistant'
        };
        
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
                console.error('Python script error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Python script error',
                    error: err.message
                });
            } else {
                try {
                    // Parse the JSON output from Python
                    const result = JSON.parse(output);
                    
                    res.json({
                        success: true,
                        data: result
                    });
                } catch (parseError) {
                    console.error('Failed to parse Python output:', parseError);
                    console.error('Output was:', output);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to parse Python output',
                        error: parseError.message
                    });
                }
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Legal Assistant test server running on port ${PORT}`);
});