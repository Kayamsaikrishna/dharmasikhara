import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DigitalEvidence: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'documents' | 'photos' | 'analysis'>('documents');

  // Update progress when component mounts
  useEffect(() => {
    // Update progress in localStorage
    const savedProgress = localStorage.getItem('scenario-progress-the-inventory-that-changed-everything');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      // Add 'digital-evidence' to completed stages if not already present
      const completedStages = progress.completedStages.includes('digital-evidence') 
        ? progress.completedStages 
        : [...progress.completedStages, 'digital-evidence'];
      
      const updatedProgress = {
        ...progress,
        currentStage: 'bail-draft',
        completedStages: completedStages
      };
      localStorage.setItem('scenario-progress-the-inventory-that-changed-everything', JSON.stringify(updatedProgress));
    }
  }, []);

  // Mock data for digital evidence
  const documents = [
    { id: 1, name: 'CCTV Footage Report', type: 'PDF', size: '2.4 MB', date: '2025-10-15' },
    { id: 2, name: 'Inventory Records', type: 'XLSX', size: '1.1 MB', date: '2025-10-10' },
    { id: 3, name: 'Witness Statements', type: 'DOCX', size: '0.8 MB', date: '2025-10-12' },
    { id: 4, name: 'Security Logs', type: 'CSV', size: '3.2 MB', date: '2025-10-14' },
  ];

  const photos = [
    { id: 1, name: 'Warehouse Entrance', description: 'Main entrance with security camera' },
    { id: 2, name: 'Storage Area', description: 'Section where laptop was reported missing' },
    { id: 3, name: 'Office Desk', description: 'Rajesh Kumar\'s workstation' },
    { id: 4, name: 'Exit Point', description: 'Secondary exit near storage area' },
  ];

  const analysisResults = [
    { id: 1, title: 'Timeline Inconsistencies', severity: 'High', description: 'Discrepancies found between security logs and witness statements' },
    { id: 2, title: 'Access Control Issues', severity: 'Medium', description: 'Multiple unauthorized access attempts detected' },
    { id: 3, title: 'Digital Footprint', severity: 'Low', description: 'Computer activity logs show normal usage patterns' },
  ];

  return (
    <div className="digital-evidence h-screen w-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white overflow-auto">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-800 bg-opacity-80 text-white rounded-full hover:bg-gray-700 transition-colors flex items-center text-sm"
        >
          ← Home
        </button>
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-amber-400">Digital Evidence Analysis</h1>
          <p className="text-xl text-gray-300">
            Review and analyze digital evidence collected during the investigation
          </p>
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl border border-indigo-500 shadow-2xl p-6 mb-8">
          <div className="flex border-b border-gray-700 mb-6">
            <button
              className={`py-3 px-6 font-semibold rounded-t-lg ${activeTab === 'documents' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('documents')}
            >
              📄 Documents
            </button>
            <button
              className={`py-3 px-6 font-semibold rounded-t-lg ${activeTab === 'photos' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('photos')}
            >
              📸 Photos
            </button>
            <button
              className={`py-3 px-6 font-semibold rounded-t-lg ${activeTab === 'analysis' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('analysis')}
            >
              🧠 Analysis Results
            </button>
          </div>

          {activeTab === 'documents' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-amber-300">Evidence Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-gray-700 bg-opacity-50 p-6 rounded-2xl border border-amber-500 hover:border-amber-400 transition-all">
                    <div className="flex items-start">
                      <div className="text-4xl mr-4">📄</div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{doc.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">{doc.type}</span>
                          <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm">{doc.size}</span>
                          <span className="px-3 py-1 bg-gray-900 text-gray-300 rounded-full text-sm">{doc.date}</span>
                        </div>
                        <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors">
                          View Document
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-amber-300">Evidence Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {photos.map(photo => (
                  <div key={photo.id} className="bg-gray-700 bg-opacity-50 p-4 rounded-2xl border border-blue-500 hover:border-blue-400 transition-all">
                    <div className="bg-gray-600 h-48 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-5xl">📸</div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{photo.name}</h3>
                    <p className="text-gray-300 text-sm mb-4">{photo.description}</p>
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
                      View Photo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-amber-300">AI Analysis Results</h2>
              <div className="space-y-6">
                {analysisResults.map(result => (
                  <div key={result.id} className="bg-gray-700 bg-opacity-50 p-6 rounded-2xl border-l-4 border-amber-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{result.title}</h3>
                        <p className="text-gray-300 mb-4">{result.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        result.severity === 'High' ? 'bg-red-900 text-red-300' : 
                        result.severity === 'Medium' ? 'bg-yellow-900 text-yellow-300' : 
                        'bg-green-900 text-green-300'
                      }`}>
                        {result.severity}
                      </span>
                    </div>
                    <div className="mt-4">
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors mr-3">
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors">
                        Add to Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => navigate('/client-interview')}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-full hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105"
          >
            ← Back to Interview
          </button>
          <button
            onClick={() => navigate('/bail-draft')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
          >
            Proceed to Bail Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalEvidence;