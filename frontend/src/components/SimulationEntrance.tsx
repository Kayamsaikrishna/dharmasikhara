import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SimulationEntrance = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    {
      title: "Welcome to the Legal Simulation",
      description: "You are now entering the virtual courtroom to represent Rajesh Kumar in his bail application.",
      icon: "🏛️"
    },
    {
      title: "Client Interview",
      description: "Prepare to interview your client, analyze evidence, and present your case.",
      icon: "👤"
    },
    {
      title: "Evidence Analysis",
      description: "Review CCTV footage, inventory logs, and digital records.",
      icon: "🔍"
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
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setIsAnimating(false);
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setIsAnimating(true);
        }, 300);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  const handleStartSimulation = () => {
    navigate('/client-interview');
  };

  const handleRefresh = () => {
    setCurrentStep(0);
    setIsAnimating(true);
  };

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
                <div className="text-7xl mb-6">{steps[currentStep].icon}</div>
                <h2 className="text-3xl font-bold text-white mb-4">{steps[currentStep].title}</h2>
                <p className="text-xl text-indigo-200 max-w-2xl mx-auto">{steps[currentStep].description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center space-x-2 mb-10">
              {steps.map((_, index) => (
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

            {currentStep === steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-6"
              >
                <p className="text-lg text-amber-200">
                  This feature is currently in development and will be fully implemented in the next phase.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <button
                    onClick={handleStartSimulation}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full shadow-lg hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <span className="mr-2">🎭</span> Start Client Interview
                  </button>
                  
                  <button
                    onClick={handleRefresh}
                    className="px-8 py-4 bg-white bg-opacity-20 text-white font-bold rounded-full shadow-lg hover:bg-opacity-30 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <span className="mr-2">🔄</span> Refresh Page
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep < steps.length - 1 && (
              <div className="mt-8">
                <div className="w-12 h-12 border-4 border-t-amber-400 border-r-amber-400 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-indigo-200 mt-4">Loading simulation...</p>
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

export default SimulationEntrance;