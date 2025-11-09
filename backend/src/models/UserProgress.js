// UserProgress model for SQLite database
// This is a placeholder module to maintain compatibility with existing code structure

// UserProgress model for SQLite database
// This is a placeholder module to maintain compatibility with existing code structure

class UserProgress {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findOne(query) {
    // This method is no longer used as we've moved to direct SQLite queries
    // in the controller. Keeping for backward compatibility.
    return null;
  }

  static async find(query) {
    // This method is no longer used as we've moved to direct SQLite queries
    // in the controller. Keeping for backward compatibility.
    return [];
  }

  save() {
    // This method is no longer used as we've moved to direct SQLite queries
    // in the controller. Keeping for backward compatibility.
    return Promise.resolve(this);
  }
}

module.exports = UserProgress;
