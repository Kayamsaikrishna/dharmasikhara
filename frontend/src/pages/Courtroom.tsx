import React from 'react';

const Courtroom: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
          <div className="text-6xl mb-6">⚖️</div>
          <h1 className="text-4xl font-bold text-white mb-4">Courtroom Simulation</h1>
          <p className="text-xl text-indigo-200 mb-6">
            This feature is currently under development and will be available in the next phase.
          </p>
          <div className="bg-amber-900 bg-opacity-50 rounded-lg p-4 mb-6">
            <p className="text-amber-200">
              The interactive courtroom experience with AI judges and advanced legal argumentation is being enhanced with new features including:
            </p>
            <ul className="text-left text-amber-100 mt-3 space-y-2">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Advanced AI legal reasoning engine</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Real-time performance analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Enhanced voice recognition and synthesis</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Multi-party legal proceedings</span>
              </li>
            </ul>
          </div>
          <p className="text-indigo-300">
            Please continue with the other stages of the simulation. Check back soon for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Courtroom;