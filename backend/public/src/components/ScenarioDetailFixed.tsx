import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getUserProgress, saveUserProgress } from '../utils/progressApi';
import { 
  Clock, BookOpen, Users, Star, Play, Award, Target, FileText, 
  Scale, Eye, Lock, AlertTriangle, ChevronDown, ChevronUp,
  CheckCircle, Circle, PlayCircle, Headphones, MessageSquare,
  Book, Shield, Save, RotateCcw
} from 'lucide-react';

const ScenarioDetailFixed = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [expandedSections, setExpandedSections] = useState({
    caseOverview: true,
    characters: false,
    evidence: false,
    timeline: false
  });
  // Load progress from backend or localStorage
  const [userProgress, setUserProgress] = useState<{
    started: boolean;
    currentStage: string | null;
    completedStages: string[];
    lastAccessed: string | null;
  }>({
    started: false,
    currentStage: null,
    completedStages: [],
    lastAccessed: null
  });

  // Fetch progress from backend or localStorage
  useEffect(() => {
    let isMounted = true;
    
    const fetchProgress = async () => {
      try {
        // Try to fetch progress
        const progress = await getUserProgress('the-inventory-that-changed-everything');
        if (isMounted && progress) {
          setUserProgress({
            started: true,
            currentStage: progress.currentStage || null,
            completedStages: progress.completedStages || [],
            lastAccessed: progress.lastAccessed || null
          });
        } else if (isMounted) {
          // Fallback to localStorage
          const savedProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
          if (savedProgress) {
            try {
              const parsedProgress = JSON.parse(savedProgress);
              setUserProgress(parsedProgress);
            } catch (parseError) {
              console.error('Error parsing saved progress:', parseError);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching progress:', error);
          // Fallback to localStorage
          const savedProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
          if (savedProgress) {
            try {
              const parsedProgress = JSON.parse(savedProgress);
              setUserProgress(parsedProgress);
            } catch (parseError) {
              console.error('Error parsing saved progress:', parseError);
            }
          }
        }
      }
    };

    fetchProgress();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to prevent repeated calls

  useEffect(() => {
    // Save progress to localStorage whenever it changes (for backward compatibility)
    localStorage.setItem('scenario-progress-the-inventory-that-changed-everything', JSON.stringify(userProgress));
  }, [userProgress]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStageClick = async (stage: string) => {
    let progress = null;
    
    try {
      // Try to fetch progress
      const userProgress = await getUserProgress('the-inventory-that-changed-everything');
      progress = userProgress;
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Fallback to localStorage
      const savedProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
      progress = savedProgress ? JSON.parse(savedProgress) : null;
    }
    
    // If no progress exists, redirect to simulation entrance
    if (!progress) {
      navigate('/simulation-entrance');
      return;
    }
    
    // Navigate based on the stage
    switch (stage) {
      case 'client-interview':
        navigate('/client-interview');
        break;
      case 'evidence-analysis': // This should link to digital-evidence
        navigate('/digital-evidence');
        break;
      case 'digital-evidence':
        navigate('/digital-evidence');
        break;
      case 'bail-draft':
        navigate('/bail-draft');
        break;
      case 'court-hearing':
        navigate('/courtroom');
        break;
      default:
        navigate('/simulation-entrance');
    }
  };

  // Determine stage completion based on user progress
  const clientInterviewCompleted = userProgress.completedStages.includes('client-interview');
  const digitalEvidenceCompleted = userProgress.completedStages.includes('digital-evidence');
  const bailDraftCompleted = userProgress.completedStages.includes('bail-draft');
  const courtHearingCompleted = userProgress.completedStages.includes('court-hearing');
  
  // Evidence Analysis is considered completed when Digital Evidence is completed
  const evidenceAnalysisCompleted = digitalEvidenceCompleted;

  // Scenario data
  const scenario = {
    id: 'the-inventory-that-changed-everything',
    title: 'The Inventory That Changed Everything',
    subtitle: 'A Criminal Law Case Study',
    description: 'A warehouse manager is accused of stealing a company laptop. As his defense attorney, you must investigate the inconsistencies in the evidence and build a compelling case for bail.',
    difficulty: 'Intermediate',
    duration: '45-60 min',
    category: 'Criminal Law',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    rating: 4.8,
    reviewCount: 127,
    completionRate: 76,
    tags: ['Criminal Law', 'Evidence Analysis', 'Bail Application', 'Cross-examination'],
    learningObjectives: [
      'Develop client interviewing techniques',
      'Analyze digital evidence and CCTV footage',
      'Draft compelling bail applications',
      'Understand inventory management legal issues'
    ],
    skillsPracticed: [
      'Client Counseling',
      'Evidence Review',
      'Legal Writing',
      'Case Strategy'
    ],
    stages: [
      {
        id: 1,
        icon: '👤',
        name: 'Client Counseling',
        duration: '10-15 min',
        description: 'Meet Rajesh Kumar in custody and gather his version of events',
        skills: ['Active Listening', 'Rapport Building', 'Fact Gathering'],
        completed: clientInterviewCompleted
      },
      {
        id: 2,
        icon: '🔍',
        name: 'Evidence Analysis',
        duration: '8-12 min',
        description: 'Review CCTV footage, inventory logs, and digital records',
        skills: ['Critical Thinking', 'Pattern Recognition', 'Legal Research'],
        completed: evidenceAnalysisCompleted // This should be true when digital evidence is completed
      },
      {
        id: 3,
        icon: '📝',
        name: 'Bail Application Draft',
        duration: '5-8 min',
        description: 'Prepare written bail application citing relevant precedents',
        skills: ['Legal Writing', 'Precedent Citation', 'Argumentation'],
        completed: bailDraftCompleted
      },
      {
        id: 4,
        icon: '⚖️',
        name: 'Court Hearing',
        duration: '12-18 min',
        description: 'Present oral arguments before the magistrate',
        skills: ['Oral Advocacy', 'Quick Thinking', 'Professional Conduct'],
        completed: courtHearingCompleted
      },
      {
        id: 5,
        icon: '🎓',
        name: 'Legal Assessment',
        duration: '20-30 min',
        description: 'Complete competency assessment to evaluate legal knowledge and skills',
        skills: ['Legal Knowledge', 'Case Analysis', 'Ethical Judgment', 'Argumentation'],
        completed: false // Will be determined by assessment completion
      }
    ],

    characters: [
      {
        name: 'Rajesh Kumar',
        role: 'Defendant',
        age: 32,
        avatar: '👤',
        personality: 'Sales executive accused of theft. Claims innocence and proper procedure.',
        keyFacts: [
          'Warehouse supervisor at TechDistributors',
          'Wife and 2-year-old daughter',
          'No criminal record',
          'Claims he properly locked warehouse'
        ],
        interactionType: 'AI Conversation',
        voiceEnabled: true
      },
      {
        name: 'Defense Attorney',
        role: 'Legal Representative',
        age: 35,
        avatar: '👩‍⚖️',
        personality: 'Experienced criminal defense lawyer. Analytical and methodical approach.',
        keyFacts: [
          '10 years experience in criminal law',
          'Specializes in white-collar crime',
          'Known for meticulous preparation',
          'Strong advocate for client rights'
        ],
        interactionType: 'AI Conversation',
        voiceEnabled: true
      },
      {
        name: 'Inspector Mehta',
        role: 'Investigating Officer',
        age: 45,
        avatar: '👮',
        personality: 'Senior police inspector. Thorough and detail-oriented.',
        keyFacts: [
          '20 years in law enforcement',
          'Led investigation of laptop theft',
          'Known for building strong cases',
          'Strict adherence to procedure'
        ],
        interactionType: 'AI Conversation',
        voiceEnabled: true
      }
    ],

    caseFile: {
      caseNumber: 'CR-2023-0457',
      court: 'Metropolitan Magistrate Court - Delhi',
      filingDate: 'March 15, 2023',
      nextHearing: 'April 5, 2023',
      judge: 'Hon. Shri Rajiv Sharma',
      prosecution: 'State of Delhi',
      chapters: [
        { id: 1, title: 'FIR and Initial Investigation' },
        { id: 2, title: 'Inventory Records' },
        { id: 3, title: 'CCTV Footage Analysis' },
        { id: 4, title: 'Digital Evidence' },
        { id: 5, title: 'Witness Statements' }
      ],
      documents: [
        { id: 1, name: 'FIR Report.pdf', type: 'PDF', size: '2.4 MB' },
        { id: 2, name: 'Inventory Log.xlsx', type: 'Excel', size: '1.1 MB' },
        { id: 3, name: 'CCTV Timestamps.txt', type: 'Text', size: '0.3 MB' },
        { id: 4, name: 'Security Protocol Manual.pdf', type: 'PDF', size: '3.7 MB' }
      ]
    },

    timeline: [
      {
        date: 'March 10, 2023',
        time: '5:30 PM',
        event: 'End of workday - Inventory check begins',
        keyPeople: ['Rajesh Kumar', 'Priya Sharma (Inventory Clerk)'],
        location: 'TechDistributors Warehouse - Sector 18, Noida'
      },
      {
        date: 'March 10, 2023',
        time: '6:45 PM',
        event: 'Inventory check completed - Laptop missing',
        keyPeople: ['Rajesh Kumar', 'Priya Sharma'],
        location: 'TechDistributors Warehouse'
      },
      {
        date: 'March 10, 2023',
        time: '7:15 PM',
        event: 'Rajesh Kumar leaves premises',
        keyPeople: ['Rajesh Kumar'],
        location: 'TechDistributors Main Gate'
      },
      {
        date: 'March 11, 2023',
        time: '9:00 AM',
        event: 'FIR filed by TechDistributors Management',
        keyPeople: ['Amit Verma (Manager)', 'Inspector Mehta'],
        location: 'Cyberabad Police Station'
      },
      {
        date: 'March 12, 2023',
        time: '2:30 PM',
        event: 'Rajesh Kumar arrested and taken into custody',
        keyPeople: ['Rajesh Kumar', 'Inspector Mehta'],
        location: 'Cyberabad Police Station'
      }
    ]
  };

  const handleStartSimulation = () => {
    navigate('/simulation-entrance');
  };

  const handleContinueSimulation = () => {
    // If we have progress, continue from where we left off
    if (userProgress.currentStage) {
      handleStageClick(userProgress.currentStage);
    } else {
      // Otherwise, start from the beginning
      navigate('/simulation-entrance');
    }
  };

  const handleResetProgress = async () => {
    if (window.confirm('Are you sure you want to reset your progress for this scenario? This cannot be undone.')) {
      try {
        // Reset progress in localStorage
        localStorage.removeItem('scenario-progress-the-inventory-that-changed-everything');
        
        // If user is authenticated, also reset on backend
        if (user) {
          // We don't have a delete endpoint, so we'll save progress with empty values
          await saveUserProgress('the-inventory-that-changed-everything', {
            currentStage: null,
            progress: 0,
            completedStages: [],
            lastUpdated: new Date().toISOString(),
            totalTimeSpent: 0
          });
        }
        
        // Reset local state
        setUserProgress({
          started: false,
          currentStage: null,
          completedStages: [],
          lastAccessed: null
        });
        
        alert('Progress has been reset successfully.');
      } catch (error) {
        console.error('Error resetting progress:', error);
        alert('Failed to reset progress. Please try again.');
      }
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '🌱';
      case 'Intermediate': return '🌿';
      case 'Advanced': return '🌳';
      case 'Expert': return '👑';
      default: return '📊';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center bg-white bg-opacity-20 text-white text-sm font-medium px-3 py-1 rounded-full">
                    <Award className="w-4 h-4 mr-2" />
                    Featured Scenario
                  </span>
                  <span className="inline-flex items-center bg-green-500 bg-opacity-90 text-white text-sm font-medium px-3 py-1 rounded-full">
                    <Headphones className="w-4 h-4 mr-2" />
                    Voice Enabled
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  {scenario.title}
                </h1>
                <h2 className="text-xl text-indigo-100 mb-4">{scenario.subtitle}</h2>
                <p className="text-indigo-100 text-lg leading-relaxed mb-6">
                  {scenario.description}
                </p>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 text-white">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{scenario.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{scenario.category}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 fill-yellow-300 text-yellow-300" />
                    <span className="font-semibold">{scenario.rating} ({scenario.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{scenario.completionRate}% completion rate</span>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 min-w-[280px] mt-8">
                <div className="text-white text-center mb-4">
                  <div className="text-4xl mb-2">🎭</div>
                  <div className="text-2xl font-bold mb-1">Ready to Begin?</div>
                  <div className="text-sm opacity-90">Interactive AI Simulation</div>
                </div>
                
                {userProgress.started ? (
                  <button
                    onClick={handleContinueSimulation}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-3 flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continue Progress
                  </button>
                ) : (
                  <button
                    onClick={handleStartSimulation}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-3 flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Simulation
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">View Detailed Case Files</span>
                  </button>
                  <button 
                    onClick={handleResetProgress}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Reset Progress</span>
                  </button>
                </div>
                
                <div className="mt-4 text-center text-white text-xs opacity-75">
                  ⚡ Instant access • No downloads required
                </div>
                {userProgress.lastAccessed && (
                  <div className="mt-2 text-center text-white text-xs opacity-75">
                    Progress saved: {new Date(userProgress.lastAccessed).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                <h3 className="font-bold text-lg mb-4">Scenario at a Glance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-100">Difficulty</span>
                    <span className="font-bold">{scenario.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-100">Duration</span>
                    <span className="font-bold">{scenario.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-100">Stages</span>
                    <span className="font-bold">{scenario.stages.length} Interactive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-100">AI Characters</span>
                    <span className="font-bold">{scenario.characters.filter(c => c.interactionType.includes('AI')).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Learning Objectives */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenario.learningObjectives.map((objective, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-4 mt-1">
                  <span className="text-indigo-800 text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700">{objective}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Experience */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8 mb-12 border border-amber-100">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center mr-3">
              <PlayCircle className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Interactive Experience</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stage Progression */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4">Stage Progression</h3>
              <div className="space-y-4">
                {scenario.stages.map((stage) => (
                  <div 
                    key={stage.id} 
                    className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                      stage.completed 
                        ? 'bg-green-50 border-green-200' 
                        : userProgress.currentStage === stage.name.toLowerCase().replace(' ', '-') || 
                          (userProgress.currentStage === 'evidence-analysis' && stage.name === 'Evidence Analysis')
                          ? 'bg-amber-50 border-amber-200 shadow-md'
                          : 'bg-white border-gray-200'
                    }`}
                    onClick={() => handleStageClick(stage.name.toLowerCase().replace(' ', '-'))}
                  >
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                      stage.completed 
                        ? 'bg-green-500 text-white' 
                        : userProgress.currentStage === stage.name.toLowerCase().replace(' ', '-') ||
                          (userProgress.currentStage === 'evidence-analysis' && stage.name === 'Evidence Analysis')
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                    }`}>
                      {stage.completed ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <span className="text-lg">{stage.icon}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{stage.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{stage.description}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{stage.duration}</span>
                      </div>
                    </div>
                    <div className="ml-2">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Practiced */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4">Skills You'll Practice</h3>
              <div className="grid grid-cols-2 gap-4">
                {scenario.skillsPracticed.map((skill, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="font-bold text-gray-900 mb-2">{skill}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${70 + (index * 10)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Case File Preview */}
              <div className="mt-6 bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Book className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="font-bold text-gray-900">Confidential Case File</h3>
                  <span className="ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">CLASSIFIED</span>
                </div>
                
                <div className="space-y-3">
                  {scenario.caseFile.documents.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-indigo-600 mr-3" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{doc.name}</div>
                        <div className="text-xs text-gray-500">{doc.type} • {doc.size}</div>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-4 py-2 text-center text-indigo-600 font-medium text-sm hover:bg-indigo-50 rounded-lg transition">
                  View All Documents →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Scenario Launching Soon</h2>
            <p className="text-indigo-100 mb-6">
              This immersive legal scenario is currently in development. Our team is working hard to bring you a realistic and engaging experience that will challenge your legal reasoning and advocacy skills.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleStartSimulation}
                disabled
                className="bg-white bg-opacity-20 text-white font-bold py-3 px-6 rounded-lg transition cursor-not-allowed opacity-75"
              >
                Simulate Client Counseling
              </button>
              <button 
                onClick={handleStartSimulation}
                disabled
                className="bg-white bg-opacity-20 text-white font-bold py-3 px-6 rounded-lg transition cursor-not-allowed opacity-75"
              >
                Simulate Digital Evidence
              </button>
              <button 
                onClick={handleStartSimulation}
                disabled
                className="bg-white bg-opacity-20 text-white font-bold py-3 px-6 rounded-lg transition cursor-not-allowed opacity-75"
              >
                Simulate Bail Draft
              </button>
            </div>
            <div className="mt-6 text-indigo-200 text-sm">
              <Lock className="inline h-4 w-4 mr-1" />
              Content will be unlocked upon release
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioDetailFixed;