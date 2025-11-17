import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DocumentSections: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisResult, documentContext, file } = location.state || {};

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Document Loaded</h2>
          <p className="text-gray-600 mb-6">Please upload a document first to view sections.</p>
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
                Document Sections
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
              onClick={() => navigate('/document-key-points', { state: { analysisResult, documentContext, file } })}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Key Points
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
          <h3 className="text-xl font-bold text-gray-900 mb-4">Legal Sections</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Legal Provisions
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.legal_provisions?.slice(0, 12).map((prov: string, i: number) => (
                  <span key={i} className="px-3 py-2 bg-white text-blue-700 rounded-lg text-sm border border-blue-200">
                    {prov}
                  </span>
                ))}
                {(!analysisResult.legal_provisions || analysisResult.legal_provisions.length === 0) && (
                  <p className="text-sm text-blue-600">No legal provisions identified</p>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
              <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Risk Assessment
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.risk_assessment?.slice(0, 8).map((risk: string, i: number) => (
                  <span key={i} className="px-3 py-2 bg-white text-red-700 rounded-lg text-sm border border-red-200">
                    {risk}
                  </span>
                ))}
                {(!analysisResult.risk_assessment || analysisResult.risk_assessment.length === 0) && (
                  <p className="text-sm text-red-600">No risks identified</p>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Document Type
              </h4>
              <p className="text-lg text-indigo-700 font-medium">{analysisResult.document_type}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSections;