const databaseService = require('../services/database');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const getProfile = async (req, res) => {
    try {
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Query user from SQLite database
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove password from response
        delete user.password;
        
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
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        
        if (firstName) {
            updateFields.push('first_name = ?');
            updateValues.push(firstName);
        }
        if (lastName) {
            updateFields.push('last_name = ?');
            updateValues.push(lastName);
        }
        if (institution) {
            updateFields.push('institution = ?');
            updateValues.push(institution);
        }
        if (year) {
            updateFields.push('year = ?');
            updateValues.push(year);
        }
        if (specialization) {
            updateFields.push('specialization = ?');
            updateValues.push(specialization);
        }
        
        // Always update the updated_at field
        updateFields.push('updated_at = ?');
        updateValues.push(new Date().toISOString());
        
        // Add user ID to the values array
        updateValues.push(req.user.userId);
        
        // Execute update query
        await new Promise((resolve, reject) => {
            const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            db.run(query, updateValues, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
        
        // Fetch updated user data
        const updatedUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Remove password from response
        delete updatedUser.password;
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
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
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Query documents from SQLite database
        const documents = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC', 
                   [req.user.userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
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
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Insert document into database
        const document = await new Promise((resolve, reject) => {
            const createdAt = new Date().toISOString();
            db.run(
                'INSERT INTO documents (user_id, title, content, file_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [req.user.userId, title, extractedContent, fileType, fileSize, createdAt],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            user_id: req.user.userId,
                            title,
                            content: extractedContent,
                            file_type: fileType,
                            file_size: fileSize,
                            created_at: createdAt
                        });
                    }
                }
            );
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
        
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Check if document belongs to user
        const document = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM documents WHERE id = ? AND user_id = ?', 
                   [id, req.user.userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        
        // Delete document
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
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

// Placeholder for subscription functionality
const getSubscription = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        plan: 'free',
        status: 'active',
        features: {
          documentAnalysis: true,
          scenariosAccess: 5,
          multiplayerAccess: false,
          customScenarios: 0,
          prioritySupport: false,
          storage: '100 MB',
          documentAnalysisLimit: '5 per week'
        }
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching subscription'
    });
  }
};

// Function to extract text from PDF files
const extractText = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a file to upload.'
      });
    }
    
    // Log file information for debugging
    console.log('File uploaded:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // Check file type and process accordingly
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      // Extract text from PDF
      try {
        const pdfData = await pdfParse(req.file.buffer);
        
        res.json({
          success: true,
          text: pdfData.text
        });
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        res.status(500).json({
          success: false,
          message: 'Failed to parse PDF file: ' + pdfError.message
        });
      }
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               req.file.mimetype === 'application/msword' ||
               req.file.originalname.toLowerCase().endsWith('.doc') ||
               req.file.originalname.toLowerCase().endsWith('.docx')) {
      // Extract text from Word document
      const mammoth = require('mammoth');
      
      try {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        res.json({
          success: true,
          text: result.value
        });
      } catch (wordError) {
        console.error('Word document extraction error:', wordError);
        res.status(500).json({
          success: false,
          message: 'Failed to extract text from Word document: ' + wordError.message
        });
      }
    } else {
      console.log('Unsupported file type:', req.file.mimetype, req.file.originalname);
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Supported types: PDF, DOC, DOCX. Received: ' + req.file.mimetype + ' for file: ' + req.file.originalname
      });
    }
  } catch (error) {
    console.error('File extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract text from file: ' + error.message
    });
  }
};

// Export all functions
module.exports = {
  getProfile,
  updateProfile,
  getUserDocuments,
  uploadDocument,
  deleteDocument,
  getSubscription,
  extractText
};