import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProgressTest: React.FC = () => {
  const navigate = useNavigate();

  const updateProgress = (stage: string) => {
    const progressKey = 'scenario-progress-the-inventory-that-changed-everything';
    
    switch (stage) {
      case 'client-interview':
        localStorage.setItem(progressKey, JSON.stringify({
          scenarioId: 'the-inventory-that-changed-everything',
          currentStage: 'client-interview',
          completedStages: []
        }));
        break;
      case 'digital-evidence':
        localStorage.setItem(progressKey, JSON.stringify({
          scenarioId: 'the-inventory-that-changed-everything',
          currentStage: 'digital-evidence',
          completedStages: ['client-interview']
        }));
        break;
      case 'bail-draft':
        localStorage.setItem(progressKey, JSON.stringify({
          scenarioId: 'the-inventory-that-changed-everything',
          currentStage: 'bail-draft',
          completedStages: ['client-interview', 'digital-evidence']
        }));
        break;
      case 'court-hearing':
        localStorage.setItem(progressKey, JSON.stringify({
          scenarioId: 'the-inventory-that-changed-everything',
          currentStage: 'court-hearing',
          completedStages: ['client-interview', 'digital-evidence', 'bail-draft']
        }));
        break;
      case 'all-completed':
        localStorage.setItem(progressKey, JSON.stringify({
          scenarioId: 'the-inventory-that-changed-everything',
          currentStage: 'court-hearing',
          completedStages: ['client-interview', 'digital-evidence', 'bail-draft']
        }));
        break;
      case 'reset':
        localStorage.removeItem(progressKey);
        break;
    }
    
    alert(`Progress updated to: ${stage}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Progress Test Utility</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-2xl border border-indigo-500">
            <h2 className="text-xl font-bold mb-4">Set Progress</h2>
            <div className="space-y-3">
              <button 
                onClick={() => updateProgress('client-interview')}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Client Interview
              </button>
              <button 
                onClick={() => updateProgress('digital-evidence')}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Digital Evidence
              </button>
              <button 
                onClick={() => updateProgress('bail-draft')}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                Bail Draft
              </button>
              <button 
                onClick={() => updateProgress('court-hearing')}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Court Hearing
              </button>
              <button 
                onClick={() => updateProgress('all-completed')}
                className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                All Completed
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-2xl border border-indigo-500">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => updateProgress('reset')}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Reset Progress
              </button>
              <button 
                onClick={() => navigate('/simulation-entrance')}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Go to Simulation Entrance
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-800 bg-opacity-50 p-6 rounded-2xl border border-indigo-500">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use this tool to test different progress states in the simulation</li>
            <li>Click "Set Progress" buttons to simulate completing different stages</li>
            <li>Click "Reset Progress" to start fresh</li>
            <li>Click "Go to Simulation Entrance" to see the progress-based view</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProgressTest;