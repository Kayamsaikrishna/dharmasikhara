import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface LegalCase {
  id: string;
  title: string;
  citation: string;
  court: string;
  date: string;
  summary: string;
  relevanceScore: number;
  url: string;
  keyPoints: string[];
  legalIssues?: string[];
  judges?: string[];
  keyLegalPrinciples?: string[];
  courtDecision?: string;
  relatedCases?: Array<{
    id?: string;
    title: string;
    citation: string;
    court: string;
    date: string;
  }>;
  status?: string;
  category?: string;
  citationCount?: number;
  newsCoverage?: Array<{
    title: string;
    source: string;
    date: string;
    url: string;
    snippet: string;
  }>;
  legalAnalysis?: Array<{
    title: string;
    author: string;
    source: string;
    url: string;
    summary: string;
  }>;
  timeline?: Array<{
    date: string;
    event: string;
    type: string;
    description: string;
  }>;
  documents?: Array<{
    type: string;
    title: string;
    date: string;
    url: string;
    pageCount?: number;
  }>;
}

interface SearchResult {
  cases: LegalCase[];
  documents: any[];
  citations: any[];
  news: any[];
  analysis: any[];
  timeline: any[];
  totalResults: number;
}

const LegalResearch: React.FC = () => {
  const { t, language, translationsLoaded } = useLanguage();
  const { user, token } = useUser();
  
  // Debugging: log language and some translations
  React.useEffect(() => {
    console.log('Current language:', language);
    console.log('Translations loaded:', translationsLoaded);
    console.log('Keyword search translation:', t('legalResearch.keywordSearch'));
    console.log('All courts translation:', t('legalResearch.allCourts'));
    console.log('Case name search translation:', t('legalResearch.caseNameSearch'));
    console.log('Party name search translation:', t('legalResearch.partyNameSearch'));
    console.log('Citation search translation:', t('legalResearch.citationSearch'));
    console.log('Supreme court translation:', t('legalResearch.supremeCourt'));
    console.log('High courts translation:', t('legalResearch.highCourts'));
    console.log('District courts translation:', t('legalResearch.districtCourts'));
    console.log('Tribunals translation:', t('legalResearch.tribunals'));
  }, [language, translationsLoaded, t]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('keywords'); // case-name, party-name, citation, keywords
  const [searchResults, setSearchResults] = useState<SearchResult>({
    cases: [],
    documents: [],
    citations: [],
    news: [],
    analysis: [],
    timeline: [],
    totalResults: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [jurisdiction, setJurisdiction] = useState('all-courts');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('cases'); // cases, documents, citations, news, analysis, timeline

  // Check if user is authenticated
  useEffect(() => {
    if (!user || !token) {
      setError(t('legalResearch.authRequired'));
    } else {
      setError(''); // Clear error when user is authenticated
    }
  }, [user, token, t]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user || !token) {
      setError(t('legalResearch.authRequired'));
      return;
    }
    
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setSearchResults({
      cases: [],
      documents: [],
      citations: [],
      news: [],
      analysis: [],
      timeline: [],
      totalResults: 0
    });
    setSelectedCase(null);

    try {
      const response = await fetch('/api/legal-research/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query: searchQuery,
          searchType,
          jurisdiction,
          limit: 50
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResults({
          cases: data.data.results,
          documents: [], // In a real implementation, these would come from the API
          citations: [],
          news: [],
          analysis: [],
          timeline: [],
          totalResults: data.data.results.length
        });
      } else if (response.status === 401 || response.status === 403) {
        setError(t('legalResearch.sessionExpired'));
        // Clear user context to force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError(data.message || t('legalResearch.searchFailed'));
      }
    } catch (err) {
      setError(t('legalResearch.connectionError'));
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSelect = async (caseId: string, source: string) => {
    // Check if user is authenticated
    if (!user || !token) {
      setError(t('legalResearch.authRequired'));
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/legal-research/case/${caseId}/${source}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedCase(data.data);
      } else if (response.status === 401 || response.status === 403) {
        setError(t('legalResearch.sessionExpired'));
        // Clear user context to force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError(data.message || t('legalResearch.detailsFailed'));
      }
    } catch (err) {
      setError(t('legalResearch.connectionError'));
      console.error('Case details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!user || !token) {
      setError(t('legalResearch.authRequired'));
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/legal-research/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query: searchQuery,
          searchType,
          jurisdiction,
          results: searchResults.cases
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // In a real implementation, this would download the report
        // For now, we'll show a success message
        alert(t('legalResearch.reportGeneratedSuccessfully'));
      } else if (response.status === 401 || response.status === 403) {
        setError(t('legalResearch.sessionExpired'));
        // Clear user context to force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError(data.message || t('legalResearch.reportGenerationFailed'));
      }
    } catch (err) {
      setError(t('legalResearch.connectionError'));
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    if (status?.toLowerCase().includes('disposed')) return 'bg-green-100 text-green-800';
    if (status?.toLowerCase().includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (status?.toLowerCase().includes('admitted')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTimelineEventColor = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case 'judgment': return 'bg-green-500';
      case 'order': return 'bg-blue-500';
      case 'hearing': return 'bg-orange-500';
      case 'filing': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // If translations are not loaded yet, show loading state
  if (!translationsLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading translations...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!user || !token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('legalResearch.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('legalResearch.description')}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('legalResearch.authenticationRequired')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || t('legalResearch.signInToContinue')}
            </p>
            <a 
              href="/login" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {t('common.signIn')}
              <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('legalResearch.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('legalResearch.description')}
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('legalResearch.searchPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              disabled={loading}
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              disabled={loading}
            >
              <option value="case-name">{t('legalResearch.caseNameSearch')}</option>
              <option value="party-name">{t('legalResearch.partyNameSearch')}</option>
              <option value="citation">{t('legalResearch.citationSearch')}</option>
              <option value="keywords">{t('legalResearch.keywordSearch')}</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              disabled={loading}
            >
              <option value="all-courts">{t('legalResearch.allCourts')}</option>
              <option value="supreme-court">{t('legalResearch.supremeCourt')}</option>
              <option value="high-courts">{t('legalResearch.highCourts')}</option>
              <option value="district-courts">{t('legalResearch.districtCourts')}</option>
              <option value="tribunals">{t('legalResearch.tribunals')}</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                t('common.search')
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
          {(error.includes('session has expired') || error.includes('sign in')) && (
            <div className="mt-3">
              <a 
                href="/login" 
                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {t('common.signIn')}
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Search Results Summary */}
      {searchResults.totalResults > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                {t('legalResearch.searchResultsSummary')} {searchResults.totalResults} {t('legalResearch.resultsFound')}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {t('legalResearch.searchQuery')} "{searchQuery}" {t('legalResearch.in')} {jurisdiction}
              </p>
            </div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="mt-2 md:mt-0 inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {loading ? t('common.loading') : t('legalResearch.downloadReport')}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Search Results with Tabs */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('cases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cases'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('legalResearch.cases')} ({searchResults.cases.length})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('legalResearch.documents')} (0)
              </button>
              <button
                onClick={() => setActiveTab('citations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'citations'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('legalResearch.citations')} (0)
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'news'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('legalResearch.news')} (0)
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'cases' && (
            <div>
              {searchResults.cases.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.cases.map((caseItem) => (
                    <div 
                      key={caseItem.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => handleCaseSelect(caseItem.id, 'indiankanoon')}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {caseItem.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>{caseItem.citation}</span>
                            <span>•</span>
                            <span>{caseItem.court}</span>
                            <span>•</span>
                            <span>{caseItem.date}</span>
                            {caseItem.status && (
                              <>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                                  {caseItem.status}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                            {caseItem.summary}
                          </p>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRelevanceColor(caseItem.relevanceScore)}`}>
                            {Math.round(caseItem.relevanceScore * 100)}% {t('legalResearch.relevant')}
                          </span>
                          {caseItem.citationCount !== undefined && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {caseItem.citationCount} {t('legalResearch.citations')}
                            </span>
                          )}
                        </div>
                      </div>
                      {caseItem.keyPoints && caseItem.keyPoints.length > 0 && (
                        <div className="mt-2">
                          <ul className="flex flex-wrap gap-2">
                            {caseItem.keyPoints.slice(0, 4).map((point, index) => (
                              <li 
                                key={index} 
                                className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                              >
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {caseItem.legalIssues && caseItem.legalIssues.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('legalResearch.legalIssues')}: {caseItem.legalIssues.slice(0, 3).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : !loading && searchQuery ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      {t('legalResearch.noResults')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('legalResearch.tryAdjustingSearch')}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('legalResearch.documentsTabTitle')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('legalResearch.documentsTabDescription')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'citations' && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('legalResearch.citationsTabTitle')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('legalResearch.citationsTabDescription')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t('legalResearch.newsTabTitle')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('legalResearch.newsTabDescription')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Case Details */}
        <div className="lg:col-span-1">
          {selectedCase ? (
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedCase.title}
                    </h2>
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCase.citation}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCase.court} | {selectedCase.date}
                      </p>
                      {selectedCase.judges && selectedCase.judges.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Judges: {selectedCase.judges.join(', ')}
                        </p>
                      )}
                      {selectedCase.status && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
                            {selectedCase.status}
                          </span>
                        </p>
                      )}
                      {selectedCase.category && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Category: {selectedCase.category}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('legalResearch.summary')}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {selectedCase.summary}
                      </p>
                    </div>
                    
                    {selectedCase.legalIssues && selectedCase.legalIssues.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          {t('legalResearch.legalIssues')}
                        </h3>
                        <ul className="space-y-1">
                          {selectedCase.legalIssues.map((issue: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedCase.keyLegalPrinciples && selectedCase.keyLegalPrinciples.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Key Legal Principles
                        </h3>
                        <ul className="space-y-1">
                          {selectedCase.keyLegalPrinciples.map((principle: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{principle}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedCase.courtDecision && (
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Court Decision
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {selectedCase.courtDecision}
                        </p>
                      </div>
                    )}
                    
                    {selectedCase.timeline && selectedCase.timeline.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Case Timeline
                        </h3>
                        <div className="space-y-3">
                          {selectedCase.timeline.map((event, index) => (
                            <div key={index} className="flex">
                              <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${getTimelineEventColor(event.type)}`}></div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{event.date}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{event.event}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedCase.relatedCases && selectedCase.relatedCases.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Related Cases
                        </h3>
                        <ul className="space-y-2">
                          {selectedCase.relatedCases.map((relatedCase: any, index: number) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                              <span className="font-medium">{relatedCase.title}</span>
                              <br />
                              <span className="text-gray-500">{relatedCase.citation} | {relatedCase.court} | {relatedCase.date}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedCase.documents && selectedCase.documents.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Related Documents
                        </h3>
                        <ul className="space-y-2">
                          {selectedCase.documents.map((doc, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex justify-between">
                              <span>
                                <span className="font-medium">{doc.title}</span>
                                <br />
                                <span className="text-gray-500">{doc.type} | {doc.date}</span>
                              </span>
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                View
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <a
                        href={selectedCase.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        {t('legalResearch.viewFullCase')}
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('legalResearch.caseDetails')}
              </h2>
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('legalResearch.selectCase')}
                </p>
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  {t('legalResearch.detailedInfoAvailable')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Information about real data integration */}
      {searchResults.cases.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('legalResearch.realDataIntegration')}
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {t('legalResearch.realDataIntegrationDescription')}
              </p>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Note: This implementation currently uses mock data for demonstration purposes. In a production environment, this would connect to real legal databases like Indian Kanoon, SCC Online, and Google Scholar to perform real-time web searches and fetch current case law and legal precedents.
              </p>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                The system is designed to handle real-time data fetching with proper error handling, rate limiting, and caching mechanisms to ensure optimal performance and reliability.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalResearch;