const databaseService = require('../services/database');

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

    // Get SQLite database connection
    const db = databaseService.getSQLite();

    // Check if progress record already exists
    const existingProgress = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_progress WHERE user_id = ? AND scenario_id = ?',
        [userId, scenarioId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (existingProgress) {
      // Update existing record
      const updatedProgress = await new Promise((resolve, reject) => {
        const updatedAt = new Date().toISOString();
        const completionDate = status === 'completed' && !existingProgress.completionDate ? 
          updatedAt : existingProgress.completionDate;
        
        db.run(
          `UPDATE user_progress SET status = ?, progress = ?, score = ?, time_spent = ?, 
           feedback = ?, updated_at = ?, completion_date = ? WHERE id = ?`,
          [
            status || existingProgress.status,
            progress !== undefined ? progress : existingProgress.progress,
            score !== undefined ? score : existingProgress.score,
            timeSpent !== undefined ? timeSpent : existingProgress.time_spent,
            feedback || existingProgress.feedback,
            updatedAt,
            completionDate,
            existingProgress.id
          ],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                id: existingProgress.id,
                user_id: userId,
                scenario_id: scenarioId,
                status: status || existingProgress.status,
                progress: progress !== undefined ? progress : existingProgress.progress,
                score: score !== undefined ? score : existingProgress.score,
                time_spent: timeSpent !== undefined ? timeSpent : existingProgress.time_spent,
                feedback: feedback || existingProgress.feedback,
                updated_at: updatedAt,
                completion_date: completionDate
              });
            }
          }
        );
      });

      res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: updatedProgress
      });
    } else {
      // Create new record
      const newProgress = await new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        const completionDate = status === 'completed' ? createdAt : null;
        
        db.run(
          `INSERT INTO user_progress 
           (user_id, scenario_id, status, progress, score, time_spent, feedback, created_at, updated_at, completion_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            scenarioId,
            status || 'in_progress',
            progress || 0,
            score,
            timeSpent || 0,
            feedback,
            createdAt,
            updatedAt,
            completionDate
          ],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                id: this.lastID,
                user_id: userId,
                scenario_id: scenarioId,
                status: status || 'in_progress',
                progress: progress || 0,
                score: score,
                time_spent: timeSpent || 0,
                feedback: feedback,
                created_at: createdAt,
                updated_at: updatedAt,
                completion_date: completionDate
              });
            }
          }
        );
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
    const userId = req.user.id;

    if (!scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Scenario ID is required' 
      });
    }

    // Get SQLite database connection
    const db = databaseService.getSQLite();

    // Try to find progress record by scenario ID
    const progressRecord = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_progress WHERE user_id = ? AND scenario_id = ?',
        [userId, scenarioId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

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

    // Get SQLite database connection
    const db = databaseService.getSQLite();

    const progressRecords = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM user_progress WHERE user_id = ? ORDER BY updated_at DESC',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

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