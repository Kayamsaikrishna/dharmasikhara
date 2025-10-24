import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EvidenceAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [analysisStatus, setAnalysisStatus] = useState<'pending' | 'in-progress' | 'completed'>('in-progress');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Simulate evidence analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalysisStatus('completed');
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="evidence-analysis h-screen w-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl border border-indigo-500 shadow-2xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-amber-400">Evidence Analysis</h1>
          <p className="text-xl text-gray-300">
            Analyzing collected evidence from client interview
          </p>
        </div>

        <div className="mb-10">
          <div className="flex justify-between mb-2">
            <span className="text-lg font-semibold">Analysis Progress</span>
            <span className="text-lg font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-6">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-6 rounded-full transition-all duration-300 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="text-xs font-bold text-gray-900">{progress}%</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-700 bg-opacity-50 p-6 rounded-2xl border border-amber-500">
            <div className="text-amber-400 text-3xl mb-3">📄</div>
            <h3 className="text-xl font-bold mb-2">Document Review</h3>
            <p className="text-gray-300">
              Analyzing case files and legal documents
            </p>
            <div className="mt-4 w-full bg-gray-600 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(progress * 1.2, 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-gray-700 bg-opacity-50 p-6 rounded-2xl border border-blue-500">
            <div className="text-blue-400 text-3xl mb-3">🔍</div>
            <h3 className="text-xl font-bold mb-2">Evidence Scan</h3>
            <p className="text-gray-300">
              Scanning digital evidence and records
            </p>
            <div className="mt-4 w-full bg-gray-600 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(progress * 0.9, 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-gray-700 bg-opacity-50 p-6 rounded-2xl border border-purple-500">
            <div className="text-purple-400 text-3xl mb-3">🧠</div>
            <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-300">
              Processing with legal AI models
            </p>
            <div className="mt-4 w-full bg-gray-600 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(progress * 0.7, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {analysisStatus === 'in-progress' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center bg-gray-700 bg-opacity-50 px-6 py-4 rounded-full">
              <div className="w-4 h-4 bg-amber-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-lg">Evidence analysis in progress. Please wait...</span>
            </div>
          </div>
        )}

        {analysisStatus === 'completed' && (
          <div className="text-center py-8 animate-fade-in">
            <div className="inline-flex flex-col items-center bg-gradient-to-r from-green-700 to-emerald-700 px-8 py-6 rounded-2xl mb-6">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-2xl font-bold">Analysis Complete!</h2>
              <p className="mt-2">Evidence analysis has been successfully completed.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => navigate('/client-interview')}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-full hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105"
              >
                Revisit Client Interview
              </button>
              <button
                onClick={() => navigate('/digital-evidence')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
              >
                Proceed to Digital Evidence
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 text-center text-gray-400 text-sm">
          <p>This process may take a few moments. Evidence is being analyzed for inconsistencies, patterns, and key insights.</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EvidenceAnalysis;