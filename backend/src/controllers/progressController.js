const databaseService = require('../services/database');

// Save or update user progress for a scenario
exports.saveUserProgress = async (req, res) => {
  try {
    const { scenarioId, status, progress, completedStages, score, timeSpent, feedback } = req.body;
    
    // Check if user is authenticated
    if (!req.user) {
      // For unauthenticated requests, save to localStorage equivalent (return 404 to trigger frontend fallback)
      return res.status(404).json({ 
        success: false, 
        message: 'User must be authenticated to save progress on server' 
      });
    }
    
    const userId = req.user.id;

    // Validate required fields
    if (!scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Scenario ID is required' 
      });
    }

    // Check if progress record already exists
    const existingProgress = await databaseService.getUserProgress(userId, scenarioId);

    if (existingProgress) {
      // Update existing record
      const updatedProgress = await databaseService.saveUserProgress({
        id: existingProgress.id,
        userId,
        scenarioId,
        status: status || existingProgress.status,
        progress: progress !== undefined ? progress : existingProgress.progress,
        completedStages: completedStages !== undefined ? completedStages : (existingProgress.completed_stages || []),
        score: score !== undefined ? score : existingProgress.score,
        timeSpent: timeSpent !== undefined ? timeSpent : existingProgress.time_spent,
        feedback: feedback || existingProgress.feedback,
        completionDate: status === 'completed' && !existingProgress.completion_date ? 
          new Date().toISOString() : existingProgress.completion_date
      });

      res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: updatedProgress
      });
    } else {
      // Create new record
      const newProgress = await databaseService.saveUserProgress({
        userId,
        scenarioId,
        status: status || 'in_progress',
        progress: progress || 0,
        completedStages: completedStages || [],
        score,
        timeSpent: timeSpent || 0,
        feedback,
        completionDate: status === 'completed' ? new Date().toISOString() : null
      });

      res.status(200).json({
        success: true,
        message: 'Progress saved successfully',
        data: newProgress
      });
    }
  } catch (error) {
    console.error('Error saving user progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get user progress for a specific scenario
exports.getUserProgress = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    
    // Check if user is authenticated
    if (!req.user) {
      // For unauthenticated requests, check localStorage equivalent (return 404 to trigger frontend fallback)
      return res.status(404).json({ 
        success: false, 
        message: 'Progress record not found' 
      });
    }
    
    const userId = req.user.id;

    if (!scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Scenario ID is required' 
      });
    }

    // Try to find progress record by scenario ID
    const progressRecord = await databaseService.getUserProgress(userId, scenarioId);

    if (!progressRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Progress record not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: progressRecord
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get all progress records for a user
exports.getAllUserProgress = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      // For unauthenticated requests, check localStorage equivalent (return 404 to trigger frontend fallback)
      return res.status(404).json({ 
        success: false, 
        message: 'User must be authenticated to access server progress' 
      });
    }
    
    const userId = req.user.id;

    const progressRecords = await databaseService.getAllUserProgress(userId);

    res.status(200).json({
      success: true,
      data: progressRecords
    });
  } catch (error) {
    console.error('Error fetching all user progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};