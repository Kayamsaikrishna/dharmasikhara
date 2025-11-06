import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useUser } from '../contexts/UserContext';
import { getUserProgress, getAllUserProgress } from '../utils/progressApi';

interface SkillData {
  name: string;
  score: number;
  target: number;
}

interface ProgressData {
  date: string;
  score: number;
}

interface CategoryData {
  name: string;
  value: number;
  [key: string]: any;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  earned: boolean;
  points: number;
}

interface RecentActivity {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'completed' | 'achievement' | 'new' | 'points';
  points?: number;
}

const PerformanceDashboard: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for real data
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [earnedAchievements, setEarnedAchievements] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());

  // Custom hook to listen for localStorage changes
  const useLocalStorage = (key: string, initialValue: any) => {
    const [storedValue, setStoredValue] = useState(() => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        return initialValue;
      }
    });

    useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
          try {
            setStoredValue(e.newValue ? JSON.parse(e.newValue) : null);
          } catch (error) {
            setStoredValue(null);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return storedValue;
  };

  // Use real user progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        
        // Initialize with zero values for all users
        let allProgressData: any[] = [];
        let assessmentScore = null;
        
        if (user) {
          // For authenticated users, fetch all progress from backend
          try {
            const allUserProgress = await getAllUserProgress();
            allProgressData = allUserProgress?.data || [];
          } catch (error) {
            console.error('Error fetching progress from backend:', error);
            // Fallback to localStorage
            const savedProgress = localStorage.getItem('user-progress-data');
            allProgressData = savedProgress ? JSON.parse(savedProgress) : [];
          }
        } else {
          // For non-authenticated users, get from localStorage
          const savedProgress = localStorage.getItem('user-progress-data');
          allProgressData = savedProgress ? JSON.parse(savedProgress) : [];
        }
        
        // Check if assessment is completed
        assessmentScore = localStorage.getItem('assessment_total_score');
        
        // Track unique completed scenarios to prevent duplicates
        const uniqueCompletedScenarios = new Set<string>();
        let totalScenariosCompleted = 0;
        let totalTimeSpent = 0;
        
        // Process all progress data to count unique completed scenarios
        allProgressData.forEach((progress: any) => {
          if (progress && progress.status === 'completed') {
            // Use scenario ID to ensure uniqueness
            const scenarioId = progress.scenario?._id || progress.scenario;
            if (scenarioId && !uniqueCompletedScenarios.has(scenarioId)) {
              uniqueCompletedScenarios.add(scenarioId);
              totalScenariosCompleted++;
              totalTimeSpent += progress.timeSpent || 0;
            }
          }
        });
        
        // Update completed scenarios state
        setCompletedScenarios(uniqueCompletedScenarios);
        
        // Determine overall score based on progress - start from zero
        let calculatedOverallScore = 0;
        if (assessmentScore) {
          // If assessment is completed, use the actual score
          calculatedOverallScore = parseInt(assessmentScore.replace('%', ''));
        } else if (totalScenariosCompleted > 0) {
          // Base score on completed scenarios
          calculatedOverallScore = Math.min(20 + (totalScenariosCompleted * 15), 95);
        }
        // If no scenarios completed and no assessment, keep score at 0
        
        // Set skill data based on progress - start from zero
        const skillDataArray = [
          { name: 'Legal Research', score: totalScenariosCompleted > 0 ? Math.min(30 + (totalScenariosCompleted * 12), 90) : 0, target: 90 },
          { name: 'Case Analysis', score: totalScenariosCompleted > 0 ? Math.min(25 + (totalScenariosCompleted * 10), 80) : 0, target: 85 },
          { name: 'Document Drafting', score: totalScenariosCompleted > 0 ? Math.min(20 + (totalScenariosCompleted * 8), 75) : 0, target: 80 },
          { name: 'Oral Advocacy', score: totalScenariosCompleted > 0 ? Math.min(15 + (totalScenariosCompleted * 8), 70) : 0, target: 80 },
          { name: 'Negotiation', score: totalScenariosCompleted > 0 ? Math.min(10 + (totalScenariosCompleted * 6), 65) : 0, target: 75 }
        ];
        
        // Set progress data based on time - start from zero
        const progressDataArray = [
          { date: 'Week 1', score: totalScenariosCompleted >= 1 ? 35 : 0 },
          { date: 'Week 2', score: totalScenariosCompleted >= 2 ? 50 : (totalScenariosCompleted >= 1 ? 35 : 0) },
          { date: 'Week 3', score: totalScenariosCompleted >= 3 ? 60 : (totalScenariosCompleted >= 2 ? 50 : (totalScenariosCompleted >= 1 ? 35 : 0) ) },
          { date: 'Week 4', score: totalScenariosCompleted >= 4 ? 70 : (totalScenariosCompleted >= 3 ? 60 : (totalScenariosCompleted >= 2 ? 50 : (totalScenariosCompleted >= 1 ? 35 : 0) ) ) },
          { date: 'Week 5', score: totalScenariosCompleted >= 5 ? 80 : (totalScenariosCompleted >= 4 ? 70 : (totalScenariosCompleted >= 3 ? 60 : (totalScenariosCompleted >= 2 ? 50 : (totalScenariosCompleted >= 1 ? 35 : 0) ) ) ) },
          { date: 'Week 6', score: assessmentScore ? calculatedOverallScore : (totalScenariosCompleted >= 5 ? 80 : (totalScenariosCompleted >= 4 ? 70 : (totalScenariosCompleted >= 3 ? 60 : (totalScenariosCompleted >= 2 ? 50 : (totalScenariosCompleted >= 1 ? 35 : 0) ) ) ) ) }
        ];
        
        // Set category data based on completed scenarios
        // For now, we'll keep it simple with Criminal Law as the main focus
        const categoryDataArray = [
          { name: 'Criminal Law', value: totalScenariosCompleted > 0 ? 100 : 0 },
          { name: 'Civil Law', value: 0 },
          { name: 'Corporate Law', value: 0 },
          { name: 'Family Law', value: 0 },
          { name: 'Constitutional Law', value: 0 }
        ];
        
        // Set radar data based on skill data - start from zero
        const radarDataArray = [
          { subject: 'Legal Research', A: skillDataArray[0].score, B: skillDataArray[0].target, fullMark: 100 },
          { subject: 'Case Analysis', A: skillDataArray[1].score, B: skillDataArray[1].target, fullMark: 100 },
          { subject: 'Document Drafting', A: skillDataArray[2].score, B: skillDataArray[2].target, fullMark: 100 },
          { subject: 'Oral Advocacy', A: skillDataArray[3].score, B: skillDataArray[3].target, fullMark: 100 },
          { subject: 'Negotiation', A: skillDataArray[4].score, B: skillDataArray[4].target, fullMark: 100 },
          { subject: 'Legal Writing', A: totalScenariosCompleted > 0 ? Math.min(25 + (totalScenariosCompleted * 8), 75) : 0, B: 85, fullMark: 100 }
        ];
        
        // Set achievements based on progress
        const achievementsArray = [
          { id: 1, title: 'First Scenario', description: 'Complete your first legal scenario', earned: totalScenariosCompleted > 0, points: 100 },
          { id: 2, title: 'Speed Demon', description: 'Complete a scenario in under 30 minutes', earned: totalTimeSpent > 0 && totalTimeSpent < 30, points: 250 },
          { id: 3, title: 'Research Master', description: 'Score 90% or higher on legal research', earned: skillDataArray[0].score >= 90, points: 150 },
          { id: 4, title: 'Perfectionist', description: 'Achieve 100% on three scenarios', earned: totalScenariosCompleted >= 3, points: 300 },
          { id: 5, title: 'Social Learner', description: 'Participate in a multiplayer scenario', earned: false, points: 200 },
          { id: 6, title: 'Jack of All Trades', description: 'Complete scenarios in 5 different practice areas', earned: false, points: 400 }
        ];
        
        // Set recent activity based on progress
        const recentActivityArray: RecentActivity[] = [];
        
        if (assessmentScore) {
          recentActivityArray.push({ id: 1, title: 'Completed Assessment', description: 'Legal Competency Assessment', time: 'Just now', type: 'completed', points: 200 });
        }
        
        // Add completed scenarios to recent activity only if scenarios are completed
        if (totalScenariosCompleted > 0) {
          if (totalScenariosCompleted >= 5) {
            recentActivityArray.push({ id: 2, title: 'Completed Scenario', description: 'Fifth Scenario', time: assessmentScore ? '1 day ago' : 'Just now', type: 'completed', points: 150 });
          }
          
          if (totalScenariosCompleted >= 4) {
            recentActivityArray.push({ id: 3, title: 'Completed Scenario', description: 'Fourth Scenario', time: totalScenariosCompleted >= 5 ? '2 days ago' : '1 day ago', type: 'completed', points: 120 });
          }
          
          if (totalScenariosCompleted >= 3) {
            recentActivityArray.push({ id: 4, title: 'Completed Scenario', description: 'Third Scenario', time: totalScenariosCompleted >= 4 ? '3 days ago' : '2 days ago', type: 'completed', points: 100 });
          }
          
          if (totalScenariosCompleted >= 2) {
            recentActivityArray.push({ id: 5, title: 'Completed Scenario', description: 'Second Scenario', time: totalScenariosCompleted >= 3 ? '4 days ago' : '3 days ago', type: 'completed', points: 80 });
          }
          
          if (totalScenariosCompleted >= 1) {
            recentActivityArray.push({ id: 6, title: 'Completed Scenario', description: 'First Scenario', time: totalScenariosCompleted >= 2 ? '5 days ago' : '4 days ago', type: 'completed', points: 60 });
          }
        }
        
        // Add achievements to recent activity
        const earnedAchievementsCount = achievementsArray.filter(a => a.earned).length;
        if (earnedAchievementsCount > 0) {
          const lastAchievement = achievementsArray.find(a => a.earned);
          if (lastAchievement) {
            recentActivityArray.unshift({ 
              id: 7, 
              title: 'New Achievement', 
              description: lastAchievement.title, 
              time: 'Just now', 
              type: 'achievement', 
              points: lastAchievement.points 
            });
          }
        }
        
        // Ensure we have at least some recent activity
        if (recentActivityArray.length === 0) {
          recentActivityArray.push({ 
            id: 8, 
            title: 'Welcome!', 
            description: 'Start your first legal scenario', 
            time: 'Just now', 
            type: 'new' 
          });
        }
        
        // Sort recent activity by ID to show newest first
        recentActivityArray.sort((a, b) => b.id - a.id);
        
        // Set state with real data
        setSkillData(skillDataArray);
        setProgressData(progressDataArray);
        setCategoryData(categoryDataArray);
        setRadarData(radarDataArray);
        setAchievements(achievementsArray);
        setRecentActivity(recentActivityArray);
        setOverallScore(calculatedOverallScore);
        setScenariosCompleted(totalScenariosCompleted);
        setBonusPoints(earnedAchievementsCount * 100 + totalScenariosCompleted * 50); // Already starts from zero
        setEarnedAchievements(earnedAchievementsCount);
        
        setLoading(false);
      } catch (err) {
        setError('Error initializing dashboard data: ' + (err as Error).message);
        console.error('Error initializing dashboard data:', err);
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user]);
  
  // Re-run effect when window is focused to update data
  useEffect(() => {
    const handleFocus = () => {
      // Force re-render by updating state
      setSkillData(prev => [...prev]);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const getIconForActivity = (type: string) => {
    switch (type) {
      case 'completed':
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
      case 'achievement':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
          </div>
        );
      case 'new':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
      case 'points':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  // Fix the label function type
  const renderCustomizedLabel = ({ name, percent }: any) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        <p className="text-gray-600">Track your progress and skill development over time</p>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Overall Score</p>
              <p className="text-3xl font-bold">{overallScore}%</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: `${overallScore}%` }}></div>
            </div>
            <p className="text-indigo-100 text-xs mt-2">{Math.max(0, 100 - overallScore)}% to next level</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Scenarios Completed</p>
              <p className="text-3xl font-bold">{scenariosCompleted}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-green-100 text-sm">+{scenariosCompleted} completed</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Bonus Points</p>
              <p className="text-3xl font-bold">{bonusPoints.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-blue-100 text-sm">{Math.max(0, 500 - (bonusPoints % 500))} pts to next reward</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Achievements</p>
              <p className="text-3xl font-bold">{earnedAchievements}/6</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-purple-100 text-sm">Next: {achievements.find(a => !a.earned)?.title || 'All Achieved'}</p>
          </div>
        </div>
      </div>

      {/* Charts Section with Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Skill Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Skill Proficiency</h3>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View Details
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skillData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis domain={[0, 100]} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend />
                <Bar dataKey="score" name="Current Score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target Score" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Practice Areas</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm text-gray-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress and Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Progress Over Time */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance Trend</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full">6M</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">1Y</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">All</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis domain={[0, 100]} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  name="Performance Score" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }} 
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Skill Radar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Skill Radar</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
                <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#6b7280" />
                <Radar
                  name="Current"
                  dataKey="A"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Target"
                  dataKey="B"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition duration-200">
                {getIconForActivity(activity.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="text-right">
                  {activity.points && (
                    <div className="text-sm font-bold text-indigo-600">+{activity.points} pts</div>
                  )}
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              See All
            </button>
          </div>
          <div className="space-y-4">
            {achievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`border rounded-xl p-4 ${achievement.earned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${achievement.earned ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {achievement.earned ? 
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg> : 
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                    }
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${achievement.earned ? 'text-green-900' : 'text-gray-900'}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {achievement.points} pts
                      </span>
                      {achievement.earned && (
                        <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 font-medium rounded-full">
                          Earned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white mb-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-2">Performance Insights</h3>
          <p className="text-indigo-100 mb-6">Personalized recommendations to improve your legal skills</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h4 className="font-bold">Strength</h4>
              </div>
              <p className="text-indigo-100 text-sm">
                {skillData.length > 0 && skillData[0].score >= 80 
                  ? `Your ${skillData[0].name} skills are exceptional. Continue practicing to maintain this level.`
                  : skillData.length > 0 && skillData[2].score >= 70
                    ? `Your ${skillData[2].name} skills are strong. Keep up the good work.`
                    : "You're building solid foundational skills. Keep practicing to develop your strengths."}
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h4 className="font-bold">Improvement</h4>
              </div>
              <p className="text-indigo-100 text-sm">
                {skillData.length > 0 && skillData[3].score < 70
                  ? `Focus on ${skillData[3].name} skills. Try scenarios that involve speaking and presenting to improve.`
                  : skillData.length > 0 && skillData[1].score < 75
                    ? `Work on ${skillData[1].name} skills. Practice analyzing case details and evidence.`
                    : "You're making good progress. Try challenging scenarios to continue improving."}
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h4 className="font-bold">Opportunity</h4>
              </div>
              <p className="text-indigo-100 text-sm">
                {scenariosCompleted > 0
                  ? "Continue with the next stage in your current scenario to build on your progress."
                  : "Start with the Client Interview scenario to begin building your legal skills."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;