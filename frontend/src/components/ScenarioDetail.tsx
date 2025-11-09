import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getUserProgress } from '../utils/progressApi';
import { 
  Clock, BookOpen, Users, Star, Play, Award, Target, FileText, 
  Scale, Eye, Lock, AlertTriangle, ChevronDown, ChevronUp,
  CheckCircle, Circle, PlayCircle, Headphones, MessageSquare,
  Book, Shield, Save, RotateCcw
} from 'lucide-react';

const EnhancedScenarioDetail = () => {
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
    const fetchProgress = async () => {
      if (user) {
        try {
          // For authenticated users, fetch from backend
          const progress = await getUserProgress('the-inventory-that-changed-everything');
          if (progress) {
            setUserProgress({
              started: true,
              currentStage: progress.currentStage || null,
              completedStages: progress.completedStages || [],
              lastAccessed: progress.lastAccessed || null
            });
          }
        } catch (error) {
          console.error('Error fetching progress from backend:', error);
          // Fallback to localStorage
          const savedProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
          if (savedProgress) {
            setUserProgress(JSON.parse(savedProgress));
          }
        }
      } else {
        // For non-authenticated users, get from localStorage
        const savedProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
        if (savedProgress) {
          setUserProgress(JSON.parse(savedProgress));
        }
      }
    };

    fetchProgress();
  }, [user]);

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
    
    if (user) {
      try {
        // For authenticated users, fetch from backend
        const userProgress = await getUserProgress('the-inventory-that-changed-everything');
        progress = userProgress;
      } catch (error) {
        console.error('Error fetching progress from backend:', error);
        // Fallback to localStorage
        const savedProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
        progress = savedProgress ? JSON.parse(savedProgress) : null;
      }
    } else {
      // For non-authenticated users, get from localStorage
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
        role: 'You',
        age: 35,
        avatar: '👤⚖️',
        personality: 'Assigned to represent the defendant and uncover the truth.',
        keyFacts: [
          'Criminal defense specialist',
          'Experienced in circumstantial evidence cases',
          'Dedicated to client advocacy'
        ],
        interactionType: 'AI Conversation',
        voiceEnabled: true
      },
      {
        name: 'State Prosecutor',
        role: 'Prosecutor',
        age: 45,
        avatar: '👨‍⚖️',
        personality: 'Representing the state with circumstantial evidence against Rajesh.',
        keyArguments: [
          'CCTV shows accused with object',
          'High-value theft (₹2,50,000)',
          'Investigation ongoing',
          'Employee breach of trust'
        ],
        interactionType: 'AI Conversation',
        voiceEnabled: true
      },
      {
        name: 'Prakash Mehta',
        role: 'Key Witness',
        age: 34,
        avatar: '👤❓',
        personality: 'Colleague who was present during the inventory check.',
        testimony: 'Was present during inventory but didn\'t see what went into bag',
        interactionType: 'Optional Interview',
        voiceEnabled: true
      },
      {
        name: 'Mr. Desai',
        role: 'Complainant',
        age: 50,
        avatar: '👤–💼',
        personality: 'Store manager who reported the incident.',
        keyFacts: [
          'Reports the missing inventory',
          'Has access to storage room',
          'Key figure in investigation'
        ],
        interactionType: 'AI Conversation',
        voiceEnabled: true
      },
      {
        name: 'Ramesh Kumar',
        role: 'Surety',
        age: 58,
        avatar: '👤–👴',
        personality: 'Rajesh\'s father who offers to be a surety.',
        keyFacts: [
          'Retired government employee',
          'Willing to provide financial guarantee',
          'Strong family values'
        ],
        interactionType: 'Optional Interview',
        voiceEnabled: false
      },
      {
        name: 'Arjun Rao',
        role: 'Surety',
        age: 38,
        avatar: '👤–👨',
        personality: 'Rajesh\'s brother-in-law who offers to be a surety.',
        keyFacts: [
          'Business owner',
          'Willing to provide financial guarantee',
          'Close family connection'
        ],
        interactionType: 'Optional Interview',
        voiceEnabled: false
      }
    ],

    evidenceItems: [
      {
        id: 1,
        name: 'CCTV Footage',
        type: 'video',
        icon: '📺',
        description: 'Hallway camera shows Rajesh placing rectangular object in bag',
        quality: 'Low resolution, high angle',
        available: true,
        critical: true
      },
      {
        id: 2,
        name: 'Digital Inventory Log',
        type: 'document',
        icon: '📄',
        description: 'Laptop marked "dispatched to service center" at 9:47 AM',
        anomaly: 'No service ticket exists',
        available: true,
        critical: true
      },
      {
        id: 3,
        name: 'Access Records',
        type: 'document',
        icon: '🔑',
        description: 'Employee entry/exit logs for storage room',
        available: true,
        critical: false
      },
      {
        id: 4,
        name: 'Phone Charger',
        type: 'physical',
        icon: '🔌',
        description: 'Rajesh\'s black charger in hard plastic case',
        available: false,
        critical: true
      }
    ],

    caseFile: {
      title: 'The Inventory That Changed Everything',
      chapters: [
        {
          id: 1,
          title: 'A Routine Morning',
          content: `October 15, 2025, began like any other for Rajesh Kumar. He woke at 6:00 a.m. in his small but tidy apartment in Basavanagudi, Bangalore. His two-year-old daughter, Ananya, was already babbling in her crib. His wife, Priya, handed him a steaming cup of tea and reminded him: "Don't forget—inventory day today."
          
          Rajesh smiled. "I've done it a dozen times. Nothing to worry about."
          
          For four years, Rajesh had worked as a sales executive at Vijay Electronics, a well-known local chain that sold everything from smartphones to home appliances. He wasn't management, but he was trusted—punctual, honest, and always willing to help during audits. His boss often said, "If Rajesh says it's there, it's there."
          
          That morning, he wore his usual attire: pressed trousers, a light blue shirt, and his company ID clipped to his pocket. Slung over his shoulder was a dark navy fabric bag—a gift from Priya on their wedding anniversary. Inside: his lunchbox, a water bottle, and a slim black mobile charger in a hard plastic case.`
        },
        {
          id: 2,
          title: 'The Inventory Room',
          content: `At 10:45 a.m., Rajesh reported to the first-floor storage room. The monthly inventory had begun. This month, the focus was on high-value IT assets, including five new laptops purchased for the marketing team. One of them—a Dell Inspiron valued at ₹45,000—had just been unboxed the day before.
          
          Rajesh was paired with Prakash Mehta, a colleague of six years. They worked in comfortable silence, scanning barcodes and ticking off items on a printed sheet. At 11:02 a.m., Rajesh bent down to pick up his charger, which had slipped from his bag when he set it on the floor.
          
          "Careful," Prakash joked. "Don't lose your lifeline!"
          
          Rajesh chuckled and dropped the charger back into his bag. The entire motion took less than three seconds.
          
          Unbeknownst to them, a ceiling-mounted CCTV camera in the hallway—meant to monitor access to the storage room—captured the moment. Due to its high angle and low resolution, the charger's hard case appeared rectangular and substantial, almost like a slim laptop.`
        }
      ]
    },

    timeline: [
      { time: '9:12 AM', event: 'Manager Desai enters storage room alone', suspicious: true },
      { time: '9:47 AM', event: 'Laptop marked "dispatched" in digital log', suspicious: true },
      { time: '10:45 AM', event: 'Inventory check begins', suspicious: false },
      { time: '11:03 AM', event: 'Rajesh enters storage with Prakash', suspicious: false },
      { time: '11:17 AM', event: 'Rajesh exits (CCTV captures bag incident)', suspicious: false },
      { time: '2:00 PM', event: 'Laptop reported missing', suspicious: false },
      { time: 'Oct 16, 7:30 AM', event: 'Rajesh arrested at home', suspicious: false }
    ]
  };

  const handleStartSimulation = () => {
    // Update progress
    setUserProgress((prev: {
      started: boolean;
      currentStage: string | null;
      completedStages: string[];
      lastAccessed: string | null;
    }) => ({
      ...prev,
      started: true,
      currentStage: 'simulation-entrance',
      lastAccessed: new Date().toISOString()
    }));
    navigate('/simulation-entrance');
  };

  const handleContinueSimulation = () => {
    // Always navigate to simulation entrance to show animation first
    // Then user can choose to continue progress from there
    navigate('/simulation-entrance');
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset your progress for this scenario?')) {
      const resetProgressData = {
        started: false,
        currentStage: null,
        completedStages: [] as string[],
        lastAccessed: null
      };
      setUserProgress(resetProgressData);
      localStorage.setItem('scenario-progress-the-inventory-that-changed-everything', JSON.stringify(resetProgressData));
    }
  };

  // Debug function to simulate progress
  const simulateProgress = (targetStage: string) => {
    const progressKey = 'scenario-progress-the-inventory-that-changed-everything';
    
    let progressData = {
      scenarioId: 'the-inventory-that-changed-everything',
      currentStage: targetStage,
      completedStages: [] as string[]
    };
    
    switch (targetStage) {
      case 'client-interview':
        progressData.completedStages = [];
        break;
      case 'digital-evidence': // Changed from evidence-analysis
        progressData.completedStages = ['client-interview'];
        break;
      case 'bail-draft':
        progressData.completedStages = ['client-interview', 'digital-evidence']; // Changed from evidence-analysis
        break;
      case 'court-hearing':
        progressData.completedStages = ['client-interview', 'digital-evidence', 'bail-draft']; // Changed from evidence-analysis
        break;
    }
    
    localStorage.setItem(progressKey, JSON.stringify(progressData));
    alert(`Progress simulated for: ${targetStage}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/scenarios')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Scenarios
        </button>

        {/* Hero Section - Enhanced */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
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
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 min-w-[280px]">
                <div className="text-white text-center mb-4">
                  <div className="text-4xl mb-2">🎭</div>
                  <div className="text-2xl font-bold mb-1">Ready to Begin?</div>
                  <div className="text-sm opacity-90">Interactive AI Simulation</div>
                </div>
                
                {userProgress.started ? (
                  <button
                    onClick={handleContinueSimulation}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 mb-3"
                  >
                    <RotateCcw className="w-6 h-6 mr-2" />
                    Continue Progress
                  </button>
                ) : (
                  <button
                    onClick={handleStartSimulation}
                    className="w-full bg-white text-indigo-600 px-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 mb-3"
                  >
                    <PlayCircle className="w-6 h-6 mr-2" />
                    Start Simulation
                  </button>
                )}

                <Link to="/scenario-simulation">
                  <button
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 mb-3"
                  >
                    <BookOpen className="w-6 h-6 mr-2" />
                    View Detailed Case Files
                  </button>
                </Link>

                <div className="text-center text-white text-xs opacity-75">
                  ⚡ Instant access • No downloads required
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Info */}
        {userProgress.started && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Save className="w-5 h-5 text-amber-600 mr-2" />
                <span className="font-medium text-amber-800">
                  Progress saved: {userProgress.lastAccessed 
                    ? `Last accessed ${new Date(userProgress.lastAccessed).toLocaleDateString()}` 
                    : 'Started recently'}
                </span>
              </div>
              <button 
                onClick={resetProgress}
                className="text-amber-700 hover:text-amber-900 text-sm flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset Progress
              </button>
            </div>
            
            {/* Debug buttons - remove in production */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button 
                onClick={() => simulateProgress('client-interview')}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                Simulate Client Counseling
              </button>
              <button 
                onClick={() => simulateProgress('digital-evidence')}
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
              >
                Simulate Digital Evidence
              </button>
              <button 
                onClick={() => simulateProgress('bail-draft')}
                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
              >
                Simulate Bail Draft
              </button>
            </div>
          </div>
        )}

        {/* Interactive Stage Preview - NEW */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="w-8 h-8 text-indigo-600 mr-3" />
            Simulation Stages
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scenario.stages.map((stage, idx) => (
              <div 
                key={stage.id}
                className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 hover:border-indigo-400 transition-all hover:shadow-lg group"
              >
                {/* Stage Number */}
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {stage.id}
                </div>

                {/* Status Badge */}
                {stage.completed ? (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                )}

                {/* Icon */}
                <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform">
                  {stage.icon}
                </div>

                {/* Content */}
                <h3 className="font-bold text-gray-900 text-lg mb-2 text-center">
                  {stage.name}
                </h3>
                <div className="text-indigo-600 text-sm font-medium mb-3 text-center flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {stage.duration}
                </div>
                <p className="text-gray-700 text-sm mb-4 text-center">
                  {stage.description}
                </p>

                {/* Skills */}
                <div className="space-y-1">
                  {stage.skills.map((skill, skillIdx) => (
                    <div key={skillIdx} className="flex items-center text-xs text-gray-600">
                      <Circle className="w-2 h-2 fill-indigo-400 text-indigo-400 mr-2" />
                      {skill}
                    </div>
                  ))}
                </div>

                {/* Status Text */}
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <span className="inline-flex items-center text-xs bg-white px-3 py-1 rounded-full border border-indigo-200">
                    {stage.completed ? '✓ Completed' : 'Unlocks in sequence'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Characters - NEW */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => toggleSection('characters')}
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageSquare className="w-6 h-6 text-indigo-600 mr-3" />
                  AI Characters You'll Interact With
                </h2>
                {expandedSections.characters ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {expandedSections.characters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenario.characters.map((char, idx) => (
                    <div 
                      key={idx}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-4xl">{char.avatar}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{char.name}</h3>
                          <div className="text-indigo-600 text-sm font-medium">{char.role}</div>
                          {char.age && (
                            <div className="text-gray-500 text-xs">Age: {char.age}</div>
                          )}
                        </div>
                        {char.voiceEnabled && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                            <Headphones className="w-3 h-3 mr-1" />
                            Voice
                          </span>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="text-xs text-gray-600 font-medium mb-2">Personality:</div>
                        <div className="text-sm text-gray-800">{char.personality}</div>
                      </div>

                      {char.keyFacts && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 font-medium">Key Facts:</div>
                          {char.keyFacts.map((fact, factIdx) => (
                            <div key={factIdx} className="flex items-start text-xs text-gray-700">
                              <Circle className="w-2 h-2 fill-indigo-400 text-indigo-400 mr-2 mt-1 flex-shrink-0" />
                              {fact}
                            </div>
                          ))}
                        </div>
                      )}

                      {char.keyArguments && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 font-medium">Will Argue:</div>
                          {char.keyArguments.map((arg, argIdx) => (
                            <div key={argIdx} className="flex items-start text-xs text-gray-700">
                              <Circle className="w-2 h-2 fill-red-400 text-red-400 mr-2 mt-1 flex-shrink-0" />
                              {arg}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <span className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                          {char.interactionType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence Items - Enhanced */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => toggleSection('evidence')}
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Eye className="w-6 h-6 text-indigo-600 mr-3" />
                  Evidence to Analyze
                </h2>
                {expandedSections.evidence ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {expandedSections.evidence && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenario.evidenceItems.map((item) => (
                    <div 
                      key={item.id}
                      className={`border-2 rounded-xl p-4 ${
                        item.critical 
                          ? 'border-amber-300 bg-amber-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <div className="text-gray-600 text-xs">{item.type}</div>
                        </div>
                        {item.critical && (
                          <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            CRITICAL
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{item.description}</p>

                      {item.anomaly && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                          <div className="flex items-start">
                            <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-red-700">{item.anomaly}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300">
                        <span className="text-xs text-gray-600">
                          {item.available ? '✓ Available to review' : '✗ Not yet available'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Case File - NEW Creative Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => toggleSection('caseOverview')}
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                  Case File: {scenario.caseFile.title}
                </h2>
                {expandedSections.caseOverview ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {expandedSections.caseOverview && (
                <div className="space-y-6">
                  {/* Case Summary Card */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-5 rounded-r-xl">
                    <h3 className="font-bold text-lg text-indigo-900 mb-2">Case Summary</h3>
                    <p className="text-gray-700">
                      {scenario.description}
                    </p>
                  </div>

                  {/* Interactive Case File */}
                  <div className="border-2 border-amber-200 rounded-xl overflow-hidden">
                    <div className="bg-amber-500 text-white p-4 flex items-center">
                      <Book className="w-5 h-5 mr-2" />
                      <h3 className="font-bold text-lg">Confidential Case File</h3>
                      <span className="ml-auto bg-white bg-opacity-20 px-2 py-1 rounded text-sm">CLASSIFIED</span>
                    </div>
                    
                    <div className="p-5 bg-gradient-to-b from-amber-50 to-white">
                      {/* Chapter Navigation */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {scenario.caseFile.chapters.map((chapter, idx) => (
                          <button 
                            key={chapter.id}
                            className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm hover:bg-indigo-200 transition"
                          >
                            Chapter {chapter.id}: {chapter.title}
                          </button>
                        ))}
                      </div>

                      {/* Chapter Content Preview */}
                      <div className="prose max-w-none">
                        <h4 className="text-indigo-800 border-b border-indigo-200 pb-2 mb-4">
                          Chapter 1: {scenario.caseFile.chapters[0].title}
                        </h4>
                        <p className="text-gray-700 mb-4">
                          {scenario.caseFile.chapters[0].content.split('\n')[0]}
                        </p>
                        
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                          <p className="text-blue-800 italic">
                            "I've done it a dozen times. Nothing to worry about."
                          </p>
                          <p className="text-blue-700 text-sm mt-2">— Rajesh Kumar's response to his wife</p>
                        </div>
                        
                        <p className="text-gray-700 mb-4">
                          {scenario.caseFile.chapters[0].content.split('\n')[4]}
                        </p>
                        
                        <div className="flex items-center justify-center my-6">
                          <div className="border-t border-gray-300 flex-grow"></div>
                          <span className="mx-4 text-gray-500 italic">Continued in Simulation...</span>
                          <div className="border-t border-gray-300 flex-grow"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <h5 className="font-bold text-indigo-800 mb-2 flex items-center">
                              <Shield className="w-4 h-4 mr-2" />
                              Key Facts
                            </h5>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-indigo-500 text-indigo-500 mr-2 mt-1.5" />
                                <span>Rajesh has 4 years clean record</span>
                              </li>
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-indigo-500 text-indigo-500 mr-2 mt-1.5" />
                                <span>₹45,000 laptop went missing</span>
                              </li>
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-indigo-500 text-indigo-500 mr-2 mt-1.5" />
                                <span>CCTV shows bag incident at 11:03 AM</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <h5 className="font-bold text-amber-800 mb-2 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Suspicious Points
                            </h5>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-amber-500 text-amber-500 mr-2 mt-1.5" />
                                <span>Laptop marked "dispatched" at 9:47 AM</span>
                              </li>
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-amber-500 text-amber-500 mr-2 mt-1.5" />
                                <span>No service center record exists</span>
                              </li>
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-amber-500 text-amber-500 mr-2 mt-1.5" />
                                <span>Charger mistaken for laptop?</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h5 className="font-bold text-green-800 mb-2 flex items-center">
                              <Award className="w-4 h-4 mr-2" />
                              Defense Opportunities
                            </h5>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2 mt-1.5" />
                                <span>Strong family ties, no flight risk</span>
                              </li>
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2 mt-1.5" />
                                <span>Passport surrendered voluntarily</span>
                              </li>
                              <li className="flex items-start">
                                <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2 mt-1.5" />
                                <span>Colleague supports his innocence</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Case File Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                      <div className="text-2xl font-bold text-indigo-600">001</div>
                      <div className="text-xs text-gray-600">Case ID</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                      <div className="text-2xl font-bold text-indigo-600">IPC 379</div>
                      <div className="text-xs text-gray-600">Section</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                      <div className="text-2xl font-bold text-indigo-600">₹45,000</div>
                      <div className="text-xs text-gray-600">Value</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                      <div className="text-2xl font-bold text-indigo-600">Oct 16</div>
                      <div className="text-xs text-gray-600">Arrest Date</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline - Updated */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => toggleSection('timeline')}
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Clock className="w-6 h-6 text-indigo-600 mr-3" />
                  Case Timeline
                </h2>
                {expandedSections.timeline ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {expandedSections.timeline && (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400"></div>

                  {scenario.timeline.map((event, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 mb-8 last:mb-0">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-4 ${
                        event.suspicious 
                          ? 'bg-red-100 border-red-500 text-red-700' 
                          : 'bg-indigo-100 border-indigo-500 text-indigo-700'
                      } font-bold`}>
                        {idx + 1}
                      </div>
                      <div className={`flex-1 rounded-xl p-5 shadow-sm ${
                        event.suspicious 
                          ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200' 
                          : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-lg">{event.time}</span>
                          {event.suspicious && (
                            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                              SUSPICIOUS
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800">{event.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Streamlined */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
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

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {userProgress.started ? (
                  <button
                    onClick={handleContinueSimulation}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Continue Progress
                  </button>
                ) : (
                  <button
                    onClick={handleStartSimulation}
                    className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Now
                  </button>
                )}
                <button 
                  onClick={resetProgress}
                  className="w-full border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset Progress
                </button>
                <button className="w-full border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                💡 Success Tips
              </h3>
              <ul className="space-y-2 text-sm text-amber-900">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Build rapport with client first</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Look for timeline inconsistencies</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>The truth is in the details</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Address judge respectfully</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedScenarioDetail;