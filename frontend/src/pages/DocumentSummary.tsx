import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DocumentSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisResult, documentContext, file } = location.state || {};

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Document Loaded</h2>
          <p className="text-gray-600 mb-6">Please upload a document first to view the summary.</p>
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
                Document Summary
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {file?.name || 'Document Analysis'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/document-key-points', { state: { analysisResult, documentContext, file } })}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Key Points
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
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document Summary
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <p className="text-gray-700 leading-relaxed text-lg">{analysisResult.summary}</p>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Document Type</h4>
              <p className="text-blue-700">{analysisResult.document_type}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Document Length</h4>
              <p className="text-blue-700">{analysisResult.document_length?.toLocaleString()} characters</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Key Terms</h4>
              <p className="text-blue-700">{analysisResult.key_terms?.length || 0} identified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSummary;