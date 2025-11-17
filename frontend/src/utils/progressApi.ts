// progressApi.ts - API utilities for user progress tracking
const isDevelopment = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isDevelopment ? 'http://localhost:5000' : (typeof window !== 'undefined' ? window.location.origin : '');

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
    
    // Always save to localStorage first
    const localProgress = {
      scenarioId,
      ...progress,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`scenario-progress-${scenarioId}`, JSON.stringify(localProgress));
    
    // If no token, save to localStorage only
    if (!token) {
      console.warn('No authentication token found, saving to localStorage only');
      return localProgress;
    }
    
    const backendProgressData = {
      scenarioId: scenarioId,
      status: progress.currentStage || progress.status || '',
      progress: progress.progress !== undefined ? progress.progress : 0,
      completedStages: progress.completedStages || [],
      score: progress.assessmentScore !== undefined ? progress.assessmentScore : null,
      timeSpent: progress.totalTimeSpent || progress.time_spent || 0,
      feedback: progress.feedback || ''
    };
    
    // Try to save to backend API
    const response = await fetch(`${API_BASE_URL}/api/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(backendProgressData)
    });

    // If backend fails with auth error, it's already saved to localStorage
    if (response.status === 401) {
      console.warn('Authentication failed, saved to localStorage only');
      return localProgress;
    }

    if (!response.ok) {
      // If backend fails for other reasons, it's already saved to localStorage
      console.warn('Backend API failed, saved to localStorage only');
      return localProgress;
    }

    return await response.json();
  } catch (error) {
    // If any error occurs, it's already saved to localStorage
    console.warn('Error saving user progress, saved to localStorage:', error);
    const localProgress = localStorage.getItem(`scenario-progress-${scenarioId}`);
    return localProgress ? JSON.parse(localProgress) : null;
  }
};

export const getUserProgress = async (scenarioId: string) => {
  try {
    const token = localStorage.getItem('token');
    
    // If no token, check localStorage only
    if (!token) {
      console.warn('No authentication token found, checking localStorage only');
      const localProgress = localStorage.getItem(`scenario-progress-${scenarioId}`);
      return localProgress ? JSON.parse(localProgress) : null;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/progress/${scenarioId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // If backend fails with auth error, check localStorage
    if (response.status === 401) {
      console.warn('Authentication failed, checking localStorage only');
      const localProgress = localStorage.getItem(`scenario-progress-${scenarioId}`);
      return localProgress ? JSON.parse(localProgress) : null;
    }

    if (!response.ok) {
      // If user is not authenticated or progress not found, try localStorage
      if (response.status === 404) {
        const localProgress = localStorage.getItem(`scenario-progress-${scenarioId}`);
        return localProgress ? JSON.parse(localProgress) : null;
      }
      throw new Error('Failed to fetch progress');
    }

    const data = await response.json();
    
    // If no progress data, return null
    if (data.data === null) {
      const localProgress = localStorage.getItem(`scenario-progress-${scenarioId}`);
      return localProgress ? JSON.parse(localProgress) : null;
    }
    
    // Map backend field names to frontend field names
    const frontendProgressData = {
      currentStage: data.data?.status || data.status || '',
      progress: data.data?.progress || data.progress || 0,
      completedStages: data.data?.completed_stages || data.completed_stages || [],
      lastUpdated: data.data?.last_updated || data.last_updated || new Date().toISOString(),
      totalTimeSpent: data.data?.time_spent || data.time_spent || 0,
      assessmentScore: data.data?.score || data.score || null,
      feedback: data.data?.feedback || data.feedback || ''
    };
    
    return frontendProgressData;
  } catch (error) {
    // Try localStorage as fallback
    console.warn('Error fetching user progress, trying localStorage:', error);
    try {
      const localProgress = localStorage.getItem(`scenario-progress-${scenarioId}`);
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
    
    // If no token, check localStorage only
    if (!token) {
      console.warn('No authentication token found, checking localStorage only');
      // Collect all progress items from localStorage
      const localProgressItems = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('scenario-progress-')) {
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
    
    const response = await fetch(`${API_BASE_URL}/api/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // If backend fails with auth error, check localStorage
    if (response.status === 401) {
      console.warn('Authentication failed, checking localStorage only');
      // Collect all progress items from localStorage
      const localProgressItems = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('scenario-progress-')) {
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

    if (!response.ok) {
      // If user is not authenticated or progress not found, try localStorage
      if (response.status === 404) {
        // Collect all progress items from localStorage
        const localProgressItems = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('scenario-progress-')) {
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
        if (key && key.startsWith('scenario-progress-')) {
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