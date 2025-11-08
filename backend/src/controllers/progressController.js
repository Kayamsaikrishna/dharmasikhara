const UserProgress = require('../models/UserProgress');

// Save or update user progress for a scenario
exports.saveUserProgress = async (req, res) => {
  try {
    const { scenarioId, status, progress, score, timeSpent, feedback } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Scenario ID is required' 
      });
    }

    // Check if progress record already exists
    let progressRecord = await UserProgress.findOne({ user: userId, scenario: scenarioId });

    if (progressRecord) {
      // Update existing record
      progressRecord.status = status || progressRecord.status;
      progressRecord.progress = progress !== undefined ? progress : progressRecord.progress;
      progressRecord.score = score !== undefined ? score : progressRecord.score;
      progressRecord.timeSpent = timeSpent !== undefined ? timeSpent : progressRecord.timeSpent;
      progressRecord.feedback = feedback || progressRecord.feedback;
      progressRecord.updatedAt = Date.now();
      
      if (status === 'completed' && !progressRecord.completionDate) {
        progressRecord.completionDate = Date.now();
      }
      
      await progressRecord.save();
    } else {
      // Create new record
      progressRecord = new UserProgress({
        user: userId,
        scenario: scenarioId,
        status: status || 'in_progress',
        progress: progress || 0,
        score: score,
        timeSpent: timeSpent || 0,
        feedback,
        startDate: Date.now()
      });
      
      if (status === 'completed') {
        progressRecord.completionDate = Date.now();
      }
      
      await progressRecord.save();
    }

    res.status(200).json({
      success: true,
      message: 'Progress saved successfully',
      data: progressRecord
    });
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
    const userId = req.user.id;

    if (!scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Scenario ID is required' 
      });
    }

    const progressRecord = await UserProgress.findOne({ 
      user: userId, 
      scenario: scenarioId 
    }).populate('scenario', 'title description');

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
    const userId = req.user.id;

    const progressRecords = await UserProgress.find({ user: userId })
      .populate('scenario', 'title description category')
      .sort({ updatedAt: -1 });

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