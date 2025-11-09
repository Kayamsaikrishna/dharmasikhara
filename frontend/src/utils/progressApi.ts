// progressApi.ts - API utilities for user progress tracking
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export interface ProgressData {
  scenarioId: string;
  userId: string;
  completedStages: string[];
  currentStage: string;
  lastUpdated: string;
  totalTimeSpent: number;
  assessmentScore?: number;
}

export const saveUserProgress = async (scenarioId: string, progress: any) => {
  try {
    const token = localStorage.getItem('token');
    
    // Try to save to backend API first
    const response = await fetch(`${API_BASE_URL}/api/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        scenarioId,
        ...progress
      })
    });

    if (!response.ok) {
      // If backend fails, fallback to localStorage
      console.warn('Backend API failed, falling back to localStorage');
      const localProgress = {
        scenarioId,
        ...progress,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`progress-${scenarioId}`, JSON.stringify(localProgress));
      return localProgress;
    }

    return await response.json();
  } catch (error) {
    // If any error occurs, fallback to localStorage
    console.warn('Error saving user progress, falling back to localStorage:', error);
    const localProgress = {
      scenarioId,
      ...progress,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`progress-${scenarioId}`, JSON.stringify(localProgress));
    return localProgress;
  }
};

export const getUserProgress = async (scenarioId: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/progress/${scenarioId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // If user is not authenticated or progress not found, try localStorage
      if (response.status === 401 || response.status === 404) {
        const localProgress = localStorage.getItem(`progress-${scenarioId}`);
        return localProgress ? JSON.parse(localProgress) : null;
      }
      throw new Error('Failed to fetch progress');
    }

    return await response.json();
  } catch (error) {
    // Try localStorage as fallback
    console.warn('Error fetching user progress, trying localStorage:', error);
    try {
      const localProgress = localStorage.getItem(`progress-${scenarioId}`);
      return localProgress ? JSON.parse(localProgress) : null;
    } catch (localError) {
      console.error('Error reading from localStorage:', localError);
      return null;
    }
  }
};

export const getAllUserProgress = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // If user is not authenticated or progress not found, try localStorage
      if (response.status === 401 || response.status === 404) {
        // Collect all progress items from localStorage
        const localProgressItems = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('progress-')) {
            try {
              const item = JSON.parse(localStorage.getItem(key) || '{}');
              if (item.scenarioId) {
                localProgressItems.push(item);
              }
            } catch (e) {
              console.warn('Error parsing localStorage item:', key, e);
            }
          }
        }
        return localProgressItems;
      }
      throw new Error('Failed to fetch progress');
    }

    return await response.json();
  } catch (error) {
    // Try localStorage as fallback
    console.warn('Error fetching all user progress, trying localStorage:', error);
    try {
      // Collect all progress items from localStorage
      const localProgressItems = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('progress-')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (item.scenarioId) {
              localProgressItems.push(item);
            }
          } catch (e) {
            console.warn('Error parsing localStorage item:', key, e);
          }
        }
      }
      return localProgressItems;
    } catch (localError) {
      console.error('Error reading from localStorage:', localError);
      return [];
    }
  }
};