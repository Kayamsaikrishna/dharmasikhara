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
      throw new Error('Failed to save progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
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
      // If user is not authenticated or progress not found, return null
      if (response.status === 401 || response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return null;
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
      // If user is not authenticated or progress not found, return empty array
      if (response.status === 401 || response.status === 404) {
        return [];
      }
      throw new Error('Failed to fetch progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all user progress:', error);
    return [];
  }
};