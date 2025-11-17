const databaseService = require('../services/database');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const getProfile = async (req, res) => {
    try {
        // Get SQLite database connection
        const db = databaseService.getSQLite();
        
        // Query user from SQLite database
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
        
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
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        db.prepare(query).run(...updateValues);
        
        // Fetch updated user data
        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
        
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
        const documents = db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC').all(req.user.userId);
        
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
        const createdAt = new Date().toISOString();
        const stmt = db.prepare('INSERT INTO documents (user_id, title, content, file_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        const info = stmt.run(req.user.userId, title, extractedContent, fileType, fileSize, createdAt);
        
        const document = {
            id: info.lastInsertRowid,
            user_id: req.user.userId,
            title,
            content: extractedContent,
            file_type: fileType,
            file_size: fileSize,
            created_at: createdAt
        };
        
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
        const document = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(id, req.user.userId);
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        
        // Delete document
        db.prepare('DELETE FROM documents WHERE id = ?').run(id);
        
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
    // Limit file size to prevent memory issues (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 5MB.'
      });
    }
    
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      // Extract text from PDF
      try {
        // Limit buffer size to prevent memory issues
        const buffer = req.file.buffer.slice(0, 5 * 1024 * 1024); // 5MB max
        const pdfData = await pdfParse(buffer);
        
        // Limit extracted text length
        const text = pdfData.text.substring(0, 100000); // 100KB max
        
        // Suggest garbage collection
        if (global.gc) {
          setImmediate(() => {
            global.gc();
          });
        }
        
        res.json({
          success: true,
          text: text
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
      try {
        const mammoth = require('mammoth');
        
        // Limit buffer size to prevent memory issues
        const buffer = req.file.buffer.slice(0, 5 * 1024 * 1024); // 5MB max
        const result = await mammoth.extractRawText({ buffer: buffer });
        
        // Limit extracted text length
        const text = result.value.substring(0, 100000); // 100KB max
        
        // Suggest garbage collection
        if (global.gc) {
          setImmediate(() => {
            global.gc();
          });
        }
        
        res.json({
          success: true,
          text: text
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