import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DocumentKeyPoints: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisResult, documentContext, file } = location.state || {};

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Document Loaded</h2>
          <p className="text-gray-600 mb-6">Please upload a document first to view key points.</p>
          <button
            onClick={() => navigate('/legal-assistant')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Legal Assistant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm p-4 lg:p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/legal-assistant', { state: { analysisResult, documentContext, file } })}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Back to Legal Assistant"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                Document Key Points
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {file?.name || 'Document Analysis'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/document-summary', { state: { analysisResult, documentContext, file } })}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Summary
            </button>
            <button
              onClick={() => navigate('/document-sections', { state: { analysisResult, documentContext, file } })}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sections
            </button>
            <button
              onClick={() => navigate('/document-full', { state: { analysisResult, documentContext, file } })}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Full Doc
            </button>
            <button
              onClick={() => navigate('/document-chat', { state: { analysisResult, documentContext, file } })}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Document Chat
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Key Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Key Terms
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.key_terms?.slice(0, 10).map((term: string, i: number) => (
                  <span key={i} className="px-3 py-2 bg-white text-blue-700 rounded-lg text-sm font-medium border border-blue-200 shadow-sm">
                    {term}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Parties Involved
              </h4>
              <p className="text-sm text-green-700 leading-relaxed">
                {analysisResult.parties_involved?.length > 0 
                  ? analysisResult.parties_involved.join(', ') 
                  : 'No parties identified'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Key Dates
              </h4>
              <p className="text-sm text-purple-700 leading-relaxed">
                {analysisResult.key_dates?.length > 0 
                  ? analysisResult.key_dates.join(', ') 
                  : 'No dates identified'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
              <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Monetary Values
              </h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                {analysisResult.monetary_values?.length > 0 
                  ? analysisResult.monetary_values.join(', ') 
                  : 'No values identified'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentKeyPoints;