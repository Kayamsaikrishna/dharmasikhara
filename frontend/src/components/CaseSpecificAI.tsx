import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CaseType {
  name: string;
  description: string;
  capabilities: string[];
}

interface LegalDocument {
  name: string;
  type: string;
  content: string;
}

interface DocumentAnalysis {
  documentName: string;
  documentType: string;
  analysis: any;
}

interface CaseStrategy {
  strategy: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  precedents: any[];
  challenges: string[];
  confidence: number;
}

const CaseSpecificAI: React.FC = () => {
  const { t } = useLanguage();
  const [caseTypes, setCaseTypes] = useState<Record<string, CaseType>>({});
  const [selectedCaseType, setSelectedCaseType] = useState('');
  const [query, setQuery] = useState('');
  const [caseFacts, setCaseFacts] = useState('');
  const [legalIssues, setLegalIssues] = useState('');
  const [documents, setDocuments] = useState<LegalDocument[]>([{ name: '', type: '', content: '' }]);
  const [aiResponse, setAiResponse] = useState('');
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis[]>([]);
  const [caseStrategy, setCaseStrategy] = useState<CaseStrategy | null>(null);
  const [activeTab, setActiveTab] = useState('query');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available case-specific AI models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Use relative URLs for production
        const response = await fetch(`/api/case-specific-ai/models`);
        const data = await response.json();
        
        if (data.success) {
          setCaseTypes(data.data);
        } else {
          setError(data.message || 'Failed to fetch AI models');
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Fetch models error:', err);
      }
    };

    fetchModels();
  }, []);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCaseType || !query.trim()) return;
    
    setLoading(true);
    setError('');
    setAiResponse('');
    
    try {
      // Use relative URLs for production
      const response = await fetch(`/api/case-specific-ai/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          caseType: selectedCaseType,
          query: query
        })
      });

      const data = await response.json();

      if (data.success) {
        setAiResponse(data.data.response || data.data.answer || 'No response generated.');
      } else {
        setError(data.message || 'Failed to get AI response');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Query submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCaseType || documents.some(doc => !doc.name || !doc.content)) return;
    
    setLoading(true);
    setError('');
    setDocumentAnalysis([]);
    
    try {
      // Use relative URLs for production
      const response = await fetch(`/api/case-specific-ai/analyze-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          caseType: selectedCaseType,
          documents: documents
        })
      });

      const data = await response.json();

      if (data.success) {
        setDocumentAnalysis(data.data.documents);
      } else {
        setError(data.message || 'Failed to analyze documents');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Document analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCaseType || !caseFacts.trim()) return;
    
    setLoading(true);
    setError('');
    setCaseStrategy(null);
    
    try {
      // Use relative URLs for production
      const response = await fetch(`/api/case-specific-ai/strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          caseType: selectedCaseType,
          caseFacts: caseFacts,
          legalIssues: legalIssues.split(',').map(issue => issue.trim()).filter(issue => issue)
        })
      });

      const data = await response.json();

      if (data.success) {
        setCaseStrategy(data.data);
      } else {
        setError(data.message || 'Failed to generate case strategy');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Strategy generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDocument = () => {
    setDocuments([...documents, { name: '', type: '', content: '' }]);
  };

  const updateDocument = (index: number, field: keyof LegalDocument, value: string) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index][field] = value;
    setDocuments(updatedDocuments);
  };

  const removeDocument = (index: number) => {
    if (documents.length > 1) {
      const updatedDocuments = [...documents];
      updatedDocuments.splice(index, 1);
      setDocuments(updatedDocuments);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('caseSpecificAI.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('caseSpecificAI.description')}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Case Type Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('caseSpecificAI.selectCaseType')}
        </label>
        <select
          value={selectedCaseType}
          onChange={(e) => setSelectedCaseType(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">{t('caseSpecificAI.selectCaseType')}</option>
          {Object.entries(caseTypes).map(([key, caseType]) => (
            <option key={key} value={key}>
              {caseType.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCaseType && caseTypes[selectedCaseType] && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            {caseTypes[selectedCaseType].name}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
            {caseTypes[selectedCaseType].description}
          </p>
          <div className="flex flex-wrap gap-2">
            {caseTypes[selectedCaseType].capabilities.map((capability, index) => (
              <span 
                key={index} 
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-200"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('query')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'query'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('caseSpecificAI.askQuestion')}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('caseSpecificAI.analyzeDocuments')}
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'strategy'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('caseSpecificAI.caseStrategy')}
          </button>
        </nav>
      </div>

      {/* Query Tab */}
      {activeTab === 'query' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('caseSpecificAI.askQuestion')}
          </h2>
          
          <form onSubmit={handleQuerySubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('caseSpecificAI.question')}
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('caseSpecificAI.questionPlaceholder')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('caseSpecificAI.ask')}
              </button>
            </div>
          </form>
          
          {aiResponse && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {t('caseSpecificAI.response')}
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {aiResponse}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('caseSpecificAI.analyzeDocuments')}
          </h2>
          
          <form onSubmit={handleDocumentAnalysis}>
            {documents.map((doc, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {t('caseSpecificAI.document')} {index + 1}
                  </h3>
                  {documents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('caseSpecificAI.documentName')}
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => updateDocument(index, 'name', e.target.value)}
                      placeholder={t('caseSpecificAI.documentNamePlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('caseSpecificAI.documentType')}
                    </label>
                    <select
                      value={doc.type}
                      onChange={(e) => updateDocument(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={loading}
                    >
                      <option value="">{t('caseSpecificAI.selectDocumentType')}</option>
                      <option value="contract">Contract</option>
                      <option value="affidavit">Affidavit</option>
                      <option value="evidence">Evidence</option>
                      <option value="correspondence">Correspondence</option>
                      <option value="legal-opinion">Legal Opinion</option>
                      <option value="court-order">Court Order</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('caseSpecificAI.documentContent')}
                  </label>
                  <textarea
                    value={doc.content}
                    onChange={(e) => updateDocument(index, 'content', e.target.value)}
                    placeholder={t('caseSpecificAI.documentContentPlaceholder')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={loading}
                  />
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={addDocument}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={loading}
              >
                {t('caseSpecificAI.addDocument')}
              </button>
              
              <button
                type="submit"
                disabled={loading || documents.some(doc => !doc.name || !doc.content)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('caseSpecificAI.analyze')}
              </button>
            </div>
          </form>
          
          {documentAnalysis.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                {t('caseSpecificAI.analysisResults')}
              </h3>
              <div className="space-y-4">
                {documentAnalysis.map((analysis, index) => (
                  <div 
                    key={index} 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {analysis.documentName}
                      </h4>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-200">
                        {analysis.documentType}
                      </span>
                    </div>
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300">
                        {analysis.analysis.summary || 'Analysis summary not available.'}
                      </p>
                      
                      {analysis.analysis.key_terms && (
                        <div className="mt-2">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                            {t('caseSpecificAI.keyTerms')}
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {analysis.analysis.key_terms.slice(0, 10).map((term: string, i: number) => (
                              <span 
                                key={i} 
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300"
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Strategy Tab */}
      {activeTab === 'strategy' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('caseSpecificAI.caseStrategy')}
          </h2>
          
          <form onSubmit={handleStrategyGeneration}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('caseSpecificAI.caseFacts')}
              </label>
              <textarea
                value={caseFacts}
                onChange={(e) => setCaseFacts(e.target.value)}
                placeholder={t('caseSpecificAI.caseFactsPlaceholder')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('caseSpecificAI.legalIssues')}
              </label>
              <input
                type="text"
                value={legalIssues}
                onChange={(e) => setLegalIssues(e.target.value)}
                placeholder={t('caseSpecificAI.legalIssuesPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('caseSpecificAI.legalIssuesHelp')}
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !caseFacts.trim()}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('caseSpecificAI.generateStrategy')}
              </button>
            </div>
          </form>
          
          {caseStrategy && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                {t('caseSpecificAI.strategyResults')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('caseSpecificAI.strategy')}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {caseStrategy.strategy}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('caseSpecificAI.strengths')}
                  </h4>
                  <ul className="space-y-1">
                    {caseStrategy.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                        <span className="mr-2 text-green-500">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('caseSpecificAI.weaknesses')}
                  </h4>
                  <ul className="space-y-1">
                    {caseStrategy.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                        <span className="mr-2 text-yellow-500">⚠</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('caseSpecificAI.opportunities')}
                  </h4>
                  <ul className="space-y-1">
                    {caseStrategy.opportunities.map((opportunity, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                        <span className="mr-2 text-purple-500">↗</span>
                        <span>{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('caseSpecificAI.threats')}
                  </h4>
                  <ul className="space-y-1">
                    {caseStrategy.threats.map((threat, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                        <span className="mr-2 text-red-500">✗</span>
                        <span>{threat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('caseSpecificAI.challenges')}
                  </h4>
                  <ul className="space-y-1">
                    {caseStrategy.challenges.map((challenge, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                        <span className="mr-2 text-orange-500">⚡</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {caseStrategy.precedents.length > 0 && (
                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('caseSpecificAI.relevantPrecedents')}
                  </h4>
                  <div className="space-y-3">
                    {caseStrategy.precedents.map((precedent, index) => (
                      <div key={index} className="border-l-4 border-indigo-500 pl-3 py-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {precedent.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {precedent.citation}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {precedent.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  {t('caseSpecificAI.confidence')}: {Math.round(caseStrategy.confidence * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseSpecificAI;