// Define the progress data structure
interface ProgressData {
  status?: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
  score?: number;
  timeSpent?: number;
  startDate?: string;
  completionDate?: string;
  feedback?: string;
  // Add any other fields specific to your scenario progress
  currentStage?: string;
  completedStages?: string[];
  lastAccessed?: string;
  scenarioSpecificData?: any;
}

// Save user progress
export const saveUserProgress = async (scenarioId: string, progressData: ProgressData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        scenarioId,
        progressData
      })
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to save progress');
    }

    return data.data;
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

// Get user progress for a specific scenario
export const getUserProgress = async (scenarioId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`/api/progress/${scenarioId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch progress');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

// Get all user progress records
export const getAllUserProgress = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/progress', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch progress records');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching all user progress:', error);
    throw error;
  }
};

// Default progress data structure
export const defaultProgressData = {
  status: 'not_started',
  progress: 0,
  currentStage: null,
  completedStages: [],
  lastAccessed: new Date().toISOString()
};