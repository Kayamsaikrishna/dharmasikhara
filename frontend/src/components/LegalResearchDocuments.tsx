import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface ResearchDocument {
  id: string;
  title: string;
  fileName: string;
  category: string;
  language: string;
  type: string;
  size: number;
  path: string;
  uploadDate: string;
}

const LegalResearchDocuments: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, token } = useUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ResearchDocument | null>(null);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user || !token) {
      setError('Authentication required to access legal research documents');
    } else {
      setError(''); // Clear error when user is authenticated
    }
  }, [user, token]);

  // Fetch document categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user || !token) return;
      
      try {
        const response = await fetch('/api/legal-research/documents/categories', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setCategories(['all', ...data.data]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, [user, token]);

  // Fetch all documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user || !token) return;
      
      try {
        const response = await fetch('/api/legal-research/documents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setDocuments(data.data);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      }
    };
    
    fetchDocuments();
  }, [user, token]);

  const handleDocumentSearch = async () => {
    if (!user || !token) {
      setError('Authentication required to access legal research documents');
      return;
    }
    
    if (!searchQuery.trim() && selectedCategory === 'all') return;

    setLoading(true);
    setError('');
    setSelectedDocument(null);

    try {
      let url = '/api/legal-research/documents';
      
      // Add query parameters
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('query', searchQuery);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.data);
      } else if (response.status === 401 || response.status === 403) {
        setError('Session has expired. Please sign in again.');
        // Clear user context to force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError(data.message || 'Failed to search documents');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Document search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (document: ResearchDocument) => {
    setSelectedDocument(document);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const DocumentCard = ({ document }: { document: ResearchDocument }) => (
    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {document.title}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
              {document.category}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {document.language}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {document.uploadDate}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center mr-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {document.fileName}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {formatFileSize(document.size)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => handleDocumentSelect(document)}
            className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
          <a
            href={document.path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
  );

  // If user is not authenticated, show login prompt
  if (!user || !token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Legal Research Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Access legal research documents including BNS, BNSS, BSA, Constitution, and Court Judgements.
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
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Please sign in to access legal research documents'}
            </p>
            <a 
              href="/login" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign In
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
          Legal Research Documents
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Access legal research documents including BNS, BNSS, BSA, Constitution, and Court Judgements.
        </p>
      </div>

      {/* Document Search Section */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Research Documents
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Browse and access legal research documents including BNS, BNSS, BSA, Constitution, and Judgements.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search research documents by title, category, or language..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white shadow-sm"
                disabled={loading}
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white shadow-sm"
              disabled={loading}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <button
              onClick={handleDocumentSearch}
              disabled={loading || (!searchQuery.trim() && selectedCategory === 'all')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Documents
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Document Categories Info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm text-center">
            <div className="text-blue-600 dark:text-blue-400 font-semibold">BNS</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">Bharatiya Nyaya Sanhita</div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm text-center">
            <div className="text-green-600 dark:text-green-400 font-semibold">BNSS</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">Bharatiya Nagarik Suraksha Sanhita</div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm text-center">
            <div className="text-purple-600 dark:text-purple-400 font-semibold">BSA</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">Bharatiya Sakshya Adhiniyam</div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm text-center">
            <div className="text-yellow-600 dark:text-yellow-400 font-semibold">Constitution</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">Indian Constitution</div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm text-center">
            <div className="text-red-600 dark:text-red-400 font-semibold">Judgements</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">Court Judgements</div>
          </div>
        </div>
      </div>

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
                Sign In
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Document Results */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              Found {documents.length} research documents
            </h3>
            {searchQuery && (
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Search results for "{searchQuery}" in {selectedCategory} category
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              // Reload all documents
              const fetchDocuments = async () => {
                if (!user || !token) return;
                
                try {
                  const response = await fetch('/api/legal-research/documents', {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  const data = await response.json();
                  
                  if (data.success) {
                    setDocuments(data.data);
                  }
                } catch (err) {
                  console.error('Error fetching documents:', err);
                }
              };
              
              fetchDocuments();
            }}
            className="mt-2 md:mt-0 inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Search
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 gap-6">
        {documents.length > 0 ? (
          documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))
        ) : !loading ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No documents found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or browse all documents.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    // Reload all documents
                    const fetchDocuments = async () => {
                      if (!user || !token) return;
                      
                      try {
                        const response = await fetch('/api/legal-research/documents', {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                          setDocuments(data.data);
                        }
                      } catch (err) {
                        console.error('Error fetching documents:', err);
                      }
                    };
                    
                    fetchDocuments();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z" />
                  </svg>
                  Browse All Documents
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Selected Document Preview */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Document Preview: {selectedDocument.title}
                </h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
                  {selectedDocument.category}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {selectedDocument.language}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selectedDocument.uploadDate}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {formatFileSize(selectedDocument.size)}
                </span>
              </div>
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">File:</span> {selectedDocument.fileName}
                </p>
              </div>
              <div className="flex space-x-4 mb-4">
                <a
                  href={`http://localhost:5000${selectedDocument.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </a>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <iframe
                  src={`http://localhost:5000${selectedDocument.path}`}
                  className="w-full h-96"
                  title={selectedDocument.title}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalResearchDocuments;