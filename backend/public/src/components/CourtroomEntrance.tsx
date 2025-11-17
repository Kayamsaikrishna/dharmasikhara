import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { getUserProgress } from '../utils/progressApi';

const CourtroomEntrance = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [savedProgress, setSavedProgress] = useState<any>(null);
  const [showProgressView, setShowProgressView] = useState(false);
  const [shouldShowProgressView, setShouldShowProgressView] = useState(false);
  const [loading, setLoading] = useState(true);

  const steps = [
    {
      id: 'client-interview',
      title: "Client Counseling",
      description: "Meet Rajesh Kumar in custody and gather his version of events",
      icon: "👤",
      time: "10-15 min",
      skills: ["Active Listening", "Rapport Building", "Fact Gathering"]
    },
    {
      id: 'digital-evidence',
      title: "Digital Evidence Review",
      description: "Review digital evidence, documents, and case files",
      icon: "💻",
      time: "8-12 min",
      skills: ["Evidence Analysis", "Document Review", "Case Preparation"]
    },
    {
      id: 'bail-draft',
      title: "Bail Application Draft",
      description: "Prepare written bail application citing relevant precedents",
      icon: "📝",
      time: "5-8 min",
      skills: ["Legal Writing", "Precedent Citation", "Argumentation"]
    },
    {
      id: 'court-hearing',
      title: "Court Hearing",
      description: "Present oral arguments before the magistrate",
      icon: "⚖️",
      time: "12-18 min",
      skills: ["Oral Advocacy", "Quick Thinking", "Professional Conduct"]
    }
  ];

  const introSteps = [
    {
      title: "Welcome to the Legal Simulation",
      description: "You are now entering the virtual courtroom to represent Rajesh Kumar in his bail application.",
      icon: "🏛️"
    },
    {
      title: "Client Counseling",
      description: "Prepare to interview your client, analyze evidence, and present your case.",
      icon: "👤"
    },
    {
      title: "Digital Evidence Review",
      description: "Review digital evidence, documents, and case files.",
      icon: "💻"
    },
    {
      title: "Bail Application Draft",
      description: "Prepare written bail application citing relevant precedents.",
      icon: "📝"
    },
    {
      title: "Court Hearing",
      description: "Present oral arguments before the magistrate.",
      icon: "⚖️"
    }
  ];

  useEffect(() => {
    let isMounted = true;
    
    // Check for saved progress from backend
    const fetchProgress = async () => {
      if (user) {
        try {
          setLoading(true);
          // Use the scenario ID for "the inventory that changed everything"
          const progress = await getUserProgress('the-inventory-that-changed-everything');
          if (isMounted && progress) {
            setSavedProgress(progress);
            // If there's saved progress, show the progress view directly
            setShowProgressView(true);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error fetching progress:', error);
            // Fallback to localStorage for backward compatibility
            const localProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
            if (localProgress) {
              setSavedProgress(JSON.parse(localProgress));
              // If there's saved progress, show the progress view directly
              setShowProgressView(true);
            }
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        // For non-authenticated users, check localStorage
        const progress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
        if (isMounted && progress) {
          setSavedProgress(JSON.parse(progress));
          // If there's saved progress, show the progress view directly
          setShowProgressView(true);
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchProgress();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to prevent repeated calls

  useEffect(() => {
    // Run the intro animation
    const timer = setTimeout(() => {
      if (currentStep < introSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
      // Removed automatic switch to progress view
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentStep, savedProgress]);

  const handleStartSimulation = () => {
    navigate('/client-interview');
  };

  const handleNavigateToStage = (stage: string) => {
    switch (stage) {
      case 'client-interview':
        navigate('/client-interview');
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
        navigate('/client-interview');
    }
  };

  const handleRefresh = () => {
    setCurrentStep(0);
    setShowProgressView(false);
    setShouldShowProgressView(false);
  };

  const handleShowProgress = () => {
    // Show progress view directly
    setShowProgressView(true);
    setShouldShowProgressView(true);
  };

  // Show progress view when requested
  if (showProgressView && savedProgress) {
    const completedStages = savedProgress.completedStages || [];
    const currentStage = savedProgress.currentStage || 'client-interview';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-500">
                DHARMASIKHARA
              </span>
            </h1>
            <p className="text-xl text-indigo-200 mb-2">धर्मशिखर</p>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"></div>
          </motion.div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Simulation Stages</h2>
              <p className="text-indigo-200">Continue from where you left off or access completed stages</p>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => {
                const isCompleted = completedStages.includes(step.id);
                const isCurrent = currentStage === step.id;
                const isUnlocked = index === 0 || completedStages.includes(steps[index - 1].id);
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isCurrent 
                        ? 'border-amber-400 bg-amber-900 bg-opacity-30' 
                        : isCompleted 
                          ? 'border-green-500 bg-green-900 bg-opacity-20' 
                          : isUnlocked 
                            ? 'border-indigo-500 bg-indigo-900 bg-opacity-20' 
                            : 'border-gray-600 bg-gray-800 bg-opacity-30'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="text-4xl mr-4">{step.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white">{step.title}</h3>
                            <p className="text-indigo-200 mt-1">{step.description}</p>
                          </div>
                          {isCompleted && (
                            <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full flex items-center">
                              ✓ Completed
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full flex items-center">
                              Active
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                            {step.time}
                          </span>
                          {step.skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      {isCompleted || isCurrent ? (
                        <button
                          onClick={() => handleNavigateToStage(step.id)}
                          className={`px-6 py-2 rounded-full font-semibold transition-all ${
                            isCurrent
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isCurrent ? 'Continue' : 'Review'}
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleNavigateToStage(step.id)}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
                        >
                          Start Stage
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-6 py-2 bg-gray-600 text-gray-400 rounded-full font-semibold cursor-not-allowed"
                        >
                          Unlocks in sequence
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700 flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowProgressView(false);
                  setShouldShowProgressView(false);
                  setCurrentStep(0);
                }}
                className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors flex items-center"
              >
                ← Back to Animation
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors flex items-center"
              >
                ← Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original animation view (always show this first)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-500">
              DHARMASIKHARA
            </span>
          </h1>
          <p className="text-xl text-indigo-200 mb-2">धर्मशिखर</p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"></div>
        </motion.div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
          <div className="text-center mb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="text-7xl mb-6">{introSteps[currentStep].icon}</div>
                <h2 className="text-3xl font-bold text-white mb-4">{introSteps[currentStep].title}</h2>
                <p className="text-xl text-indigo-200 max-w-2xl mx-auto">{introSteps[currentStep].description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center space-x-2 mb-10">
              {introSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-amber-400 w-8' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-white bg-opacity-30'
                  }`}
                ></div>
              ))}
            </div>

            {(currentStep === introSteps.length - 1 || savedProgress) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-6"
              >
                <p className="text-lg text-amber-200">
                  {currentStep === introSteps.length - 1 
                    ? "You've completed the introduction to the legal simulation. Continue to the client interview to begin your journey, or pick up where you left off if you've made progress already."
                    : "Continue to the client interview to begin your journey, or pick up where you left off if you've made progress already."}
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <button
                    onClick={handleStartSimulation}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <span className="mr-2">🎭</span> Start Client Counseling
                  </button>
                  
                  {savedProgress && (
                    <button
                      onClick={handleShowProgress}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                    >
                      <span className="mr-2">📊</span> Continue Progress
                    </button>
                  )}
                  
                  <button
                    onClick={handleRefresh}
                    className="px-8 py-4 bg-white bg-opacity-20 text-white font-bold rounded-full shadow-lg hover:bg-opacity-30 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <span className="mr-2">🔄</span> Refresh Page
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep < introSteps.length - 1 && (
              <div className="mt-8">
                <div className="w-12 h-12 border-4 border-t-amber-400 border-r-amber-400 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-indigo-200 mt-4">Loading simulation...</p>
                {savedProgress && (
                  <div className="mt-6">
                    <button
                      onClick={handleShowProgress}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center mx-auto"
                    >
                      <span className="mr-2">📊</span> Continue Progress
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-center mt-8 text-indigo-300"
        >
          <p>Experience the pinnacle of legal practice through immersive simulation</p>
        </motion.div>
      </div>
    </div>
  );
};

export default CourtroomEntrance;