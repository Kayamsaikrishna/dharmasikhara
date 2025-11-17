const databaseService = require('../services/database');

// Reviews functions
exports.getAllReviews = async (req, res) => {
  try {
    const db = databaseService.getSQLite();
    
    const reviews = db.prepare(`
        SELECT r.*, u.username 
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        ORDER BY r.created_at DESC
      `).all();
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching reviews'
    });
  }
};

// Add this new function to get reviews by scenario ID
exports.getReviewsByScenarioId = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const db = databaseService.getSQLite();
    
    const reviews = db.prepare(`
        SELECT r.*, u.username 
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        WHERE r.scenario_id = ?
        ORDER BY r.created_at DESC
      `).all(scenarioId);
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews by scenario ID:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching reviews for this scenario'
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { scenarioId, rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!scenarioId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Scenario ID and rating are required'
      });
    }
    
    const db = databaseService.getSQLite();
    
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO reviews (user_id, scenario_id, rating, comment, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`);
    const info = stmt.run(userId, scenarioId, rating, comment, createdAt, createdAt);
    
    const review = {
      id: info.lastInsertRowid,
      user_id: userId,
      scenario_id: scenarioId,
      rating,
      comment,
      created_at: createdAt,
      updated_at: createdAt
    };
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating review'
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    const db = databaseService.getSQLite();
    
    // Check if review exists and belongs to user
    const existingReview = db.prepare('SELECT * FROM reviews WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to update it'
      });
    }
    
    const updatedAt = new Date().toISOString();
    const stmt = db.prepare(`UPDATE reviews 
         SET rating = ?, comment = ?, updated_at = ? 
         WHERE id = ?`);
    stmt.run(rating, comment, updatedAt, id);
    
    const review = {
      id: parseInt(id),
      user_id: userId,
      scenario_id: existingReview.scenario_id,
      rating,
      comment,
      created_at: existingReview.created_at,
      updated_at: updatedAt
    };
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating review'
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const db = databaseService.getSQLite();
    
    // Check if review exists and belongs to user
    const existingReview = db.prepare('SELECT * FROM reviews WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
    }
    
    // Delete review
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting review'
    });
  }
};

// FAQ functions
exports.getAllFAQs = async (req, res) => {
  try {
    const db = databaseService.getSQLite();
    
    // Get all FAQ questions
    const faqs = db.prepare(`
        SELECT f.*, u.username, COUNT(fa.id) as answer_count
        FROM faq f
        LEFT JOIN users u ON f.user_id = u.id
        LEFT JOIN faq_answers fa ON f.id = fa.faq_id
        GROUP BY f.id
        ORDER BY f.created_at DESC
      `).all();
    
    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching FAQs'
    });
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const { question, category = 'general' } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }
    
    const db = databaseService.getSQLite();
    
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO faq (user_id, question, category, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?)`);
    const info = stmt.run(userId, question, category, createdAt, createdAt);
    
    const faq = {
      id: info.lastInsertRowid,
      user_id: userId,
      question,
      category,
      created_at: createdAt,
      updated_at: createdAt
    };
    
    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating FAQ'
    });
  }
};

exports.getFAQWithAnswers = async (req, res) => {
  try {
    const { id } = req.params;
    const db = databaseService.getSQLite();
    
    // Get FAQ question
    const faq = db.prepare('SELECT f.*, u.username FROM faq f LEFT JOIN users u ON f.user_id = u.id WHERE f.id = ?').get(id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    // Get all answers for this FAQ
    const answers = db.prepare(`
        SELECT fa.*, u.username 
        FROM faq_answers fa 
        LEFT JOIN users u ON fa.user_id = u.id 
        WHERE fa.faq_id = ? 
        ORDER BY fa.created_at ASC
      `).all(id);
    
    res.json({
      success: true,
      data: {
        ...faq,
        answers
      }
    });
  } catch (error) {
    console.error('Error fetching FAQ with answers:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching FAQ with answers'
    });
  }
};

exports.answerFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!answer) {
      return res.status(400).json({
        success: false,
        message: 'Answer is required'
      });
    }
    
    const db = databaseService.getSQLite();
    
    // Check if FAQ exists
    const existingFAQ = db.prepare('SELECT * FROM faq WHERE id = ?').get(id);
    
    if (!existingFAQ) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO faq_answers (faq_id, user_id, answer, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?)`);
    const info = stmt.run(id, userId, answer, createdAt, createdAt);
    
    const faqAnswer = {
      id: info.lastInsertRowid,
      faq_id: id,
      user_id: userId,
      answer,
      created_at: createdAt,
      updated_at: createdAt
    };
    
    res.status(201).json({
      success: true,
      message: 'FAQ answered successfully',
      data: faqAnswer
    });
  } catch (error) {
    console.error('Error answering FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while answering FAQ'
    });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const db = databaseService.getSQLite();
    
    // Check if FAQ exists
    const existingFAQ = db.prepare('SELECT * FROM faq WHERE id = ?').get(id);
    
    if (!existingFAQ) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    // Delete all answers for this FAQ first
    db.prepare('DELETE FROM faq_answers WHERE faq_id = ?').run(id);
    
    // Delete FAQ
    db.prepare('DELETE FROM faq WHERE id = ?').run(id);
    
    res.json({
      success: true,
      message: 'FAQ and all answers deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting FAQ'
    });
  }
};