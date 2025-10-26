import React, { useEffect } from 'react';
import BailApplicationEditor from '../components/legal/BailApplicationEditor';
import { useNavigate } from 'react-router-dom';

const BailDraft: React.FC = () => {
  const navigate = useNavigate();

  // Update progress when component mounts
  useEffect(() => {
    // Update progress in localStorage
    const savedProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      // Add 'bail-draft' to completed stages if not already present
      const completedStages = progress.completedStages.includes('bail-draft') 
        ? progress.completedStages 
        : [...progress.completedStages, 'bail-draft'];
      
      const updatedProgress = {
        ...progress,
        currentStage: 'court-hearing',
        completedStages: completedStages
      };
      localStorage.setItem('scenario-progress-the-inventory-that-changed-everything', JSON.stringify(updatedProgress));
    }
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
        >
          ← Back to Home
        </button>
        <button
          onClick={() => navigate('/courtroom')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
        >
          Proceed to Courtroom →
        </button>
      </div>
      <div className="flex-1">
        <BailApplicationEditor />
      </div>
    </div>
  );
};

export default BailDraft;