import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import { Upload, FileText, File as FileIcon } from 'lucide-react';

const LegalAnalysis: React.FC = () => {
  const { user, token } = useUser();
  const [documentText, setDocumentText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiStatus, setAiStatus] = useState<{available: boolean, message: string}>({available: false, message: 'Checking AI status...'});
  const [streamedResponse, setStreamedResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchUserDocuments = useCallback(async () => {
    try {
      const response = await fetch('/api/account/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserDocuments(data.data);
      }
    } catch (err) {
      console.error('Error fetching user documents:', err);
    }
  }, [token]);

  // Check AI status when component mounts
  useEffect(() => {
    checkAiStatus();
    
    // Fetch user documents if user is logged in
    if (user && token) {
      fetchUserDocuments();
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user, token]);

  const checkAiStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        setAiStatus({
          available: data.data.modelAvailable,
          message: data.data.modelAvailable 
            ? 'AI model is ready for analysis' 
            : 'AI model is currently unavailable. You can still test the integration with sample data.'
        });
      } else {
        setAiStatus({
          available: false,
          message: 'Unable to connect to AI service. Please ensure the backend is running.'
        });
      }
    } catch (err) {
      setAiStatus({
        available: false,
        message: 'Unable to connect to AI service. Please ensure the backend is running.'
      });
    }
  };

  const analyzeDocument = async () => {
    let textToAnalyze = documentText;
    
    // If we have a file that's a PDF, we need to send it to the backend for processing
    if (file && file.type === 'application/pdf') {
      setIsLoading(true);
      setError('');
      
      try {
        // Create FormData to send the file
        const formData = new FormData();
        formData.append('file', file);
        
        // Send file to backend for text extraction
        const response = await fetch('http://localhost:5001/api/account/extract-text', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token || ''}`
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          textToAnalyze = data.text;
        } else {
          setError(data.message || 'Failed to extract text from PDF');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError('Failed to process PDF file: ' + (err as Error).message);
        setIsLoading(false);
        return;
      }
    }
    
    if (!textToAnalyze.trim()) {
      setError('Please enter a legal document to analyze');
      return;
    }

    setIsLoading(true);
    setIsStreaming(true);
    setError('');
    setAnalysisResult(null);
    setStreamedResponse('');

    try {
      // For streaming, we'll use EventSource for small documents or fetch for large documents
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // If document is small enough, use EventSource (GET method)
      if (textToAnalyze.length < 1000) {
        const encodedText = encodeURIComponent(textToAnalyze);
        eventSourceRef.current = new EventSource(`http://localhost:5001/api/ai/stream-analysis?document=${encodedText}`);

        eventSourceRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'token') {
            // Fix: Check if content is a string before calling substring
            if (typeof data.content === 'string') {
              setStreamedResponse(prev => prev + data.content);
            } else {
              setStreamedResponse(prev => prev + JSON.stringify(data.content));
            }
          } else if (data.type === 'result') {
            setAnalysisResult(data.content);
            setIsStreaming(false);
          } else if (data.type === 'done') {
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
            }
            setIsLoading(false);
            setIsStreaming(false);
          }
        };

        eventSourceRef.current.onerror = (err) => {
          console.error('Streaming error:', err);
          setError('Error during analysis streaming. Please try again.');
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          setIsLoading(false);
          setIsStreaming(false);
        };
      } else {
        // For large documents, use POST method with fetch
        const response = await fetch('http://localhost:5001/api/ai/stream-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
          body: JSON.stringify({ documentText: textToAnalyze })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            // Process complete SSE messages
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete message in buffer
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'token') {
                    // Fix: Check if content is a string before calling substring
                    if (typeof data.content === 'string') {
                      setStreamedResponse(prev => prev + data.content);
                    } else {
                      setStreamedResponse(prev => prev + JSON.stringify(data.content));
                    }
                  } else if (data.type === 'result') {
                    setAnalysisResult(data.content);
                    setIsStreaming(false);
                  } else if (data.type === 'done') {
                    setIsLoading(false);
                    setIsStreaming(false);
                  } else if (data.type === 'error') {
                    setError(data.content);
                    setIsLoading(false);
                    setIsStreaming(false);
                  }
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    } catch (error) {
      setError('Failed to analyze document. Please make sure the AI backend is running.');
      console.error('Analysis error:', error);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // New function to ask questions about the analyzed document
  const askQuestionAboutDocument = async (question: string) => {
    if (!analysisResult || !question.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Send question with document context to the AI
      const response = await fetch('http://localhost:5001/api/ai/npc-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          query: question,
          context: 'document_analysis',
          documentContext: documentText, // Send the original document text, not the analysis result
          documentAnalysis: analysisResult // Send the analysis result separately
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Add the AI response to the streamed response
        setStreamedResponse(prev => prev + '\n\nQuestion: ' + question + '\n\n' + data.data.response);
      } else {
        setError('Failed to get response from AI assistant');
      }
    } catch (error) {
      setError('Failed to get response from AI assistant: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAnalysis = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsLoading(false);
    setIsStreaming(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      // For text files, read content
      if (selectedFile.type.startsWith('text/') || selectedFile.name.toLowerCase().endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDocumentText(e.target?.result as string || '');
        };
        reader.readAsText(selectedFile);
      } 
      // For PDF files, read as base64
      else if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          // For PDF, we'll extract text on the backend, but we can still show the file name
          setDocumentText(`PDF file selected: ${selectedFile.name}`);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleDocumentSelect = (doc: any) => {
    setDocumentText(doc.content);
    setShowDocumentSelector(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const saveDocument = async () => {
    if (!user || !token) {
      alert('Please log in to save documents');
      return;
    }
    
    if (!documentText.trim()) {
      setError('No document content to save');
      return;
    }
    
    try {
      const response = await fetch('/api/account/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Analysis Result ${new Date().toLocaleDateString()}`,
          content: documentText,
          fileType: 'text',
          fileSize: documentText.length
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Document saved successfully!');
        // Refresh user documents
        fetchUserDocuments();
      } else {
        setError(data.message || 'Failed to save document');
      }
    } catch (err) {
      setError('Failed to save document: ' + (err as Error).message);
      console.error('Save error:', err);
    }
  };

  const saveAnalysisResult = async () => {
    if (!user || !token) {
      alert('Please log in to save documents');
      return;
    }
    
    if (!analysisResult) {
      setError('No analysis result to save');
      return;
    }
    
    try {
      // Format the analysis result as a readable document
      const analysisContent = `
Document Analysis Result
========================

Document Overview:
- Length: ${analysisResult.document_length} characters
- Token Count: ${analysisResult.token_count}
- Document Type: ${analysisResult.document_type}

Key Legal Terms:
${analysisResult.key_terms ? analysisResult.key_terms.join(', ') : 'None identified'}

Document Summary:
${analysisResult.summary || 'No summary available.'}

Analysis performed on: ${new Date().toLocaleString()}
      `.trim();
      
      const response = await fetch('/api/account/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Analysis Result ${new Date().toLocaleDateString()}`,
          content: analysisContent,
          fileType: 'text',
          fileSize: analysisContent.length
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Analysis result saved successfully!');
        // Refresh user documents
        fetchUserDocuments();
      } else {
        setError(data.message || 'Failed to save analysis result');
      }
    } catch (err) {
      setError('Failed to save analysis result: ' + (err as Error).message);
      console.error('Save error:', err);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Legal Document Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload or paste your legal document below for instant AI-powered analysis using our advanced InCaseLawBERT model.
            </p>
            <div className={`mt-4 p-4 rounded-lg ${aiStatus.available ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <p className="font-medium">{aiStatus.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Input</h2>
              
              {/* Document Source Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Document Source
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`py-3 px-4 rounded-lg border ${
                      !showDocumentSelector
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setShowDocumentSelector(false)}
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-700" />
                      <span className="font-medium">Upload/Paste</span>
                    </div>
                  </button>
                  {user && userDocuments.length > 0 ? (
                    <button
                      type="button"
                      className={`py-3 px-4 rounded-lg border ${
                        showDocumentSelector
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setShowDocumentSelector(true)}
                    >
                      <div className="flex items-center">
                        <FileIcon className="w-5 h-5 mr-2 text-gray-700" />
                        <span className="font-medium">From My Documents</span>
                      </div>
                    </button>
                  ) : user ? (
                    <button
                      type="button"
                      className="py-3 px-4 rounded-lg border border-gray-300 hover:border-gray-400"
                      onClick={() => alert('You have no saved documents. Upload a document first.')}
                    >
                      <div className="flex items-center">
                        <FileIcon className="w-5 h-5 mr-2 text-gray-700" />
                        <span className="font-medium">From My Documents</span>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="py-3 px-4 rounded-lg border border-gray-300 hover:border-gray-400"
                      onClick={() => alert('Please log in to access your saved documents.')}
                    >
                      <div className="flex items-center">
                        <FileIcon className="w-5 h-5 mr-2 text-gray-700" />
                        <span className="font-medium">From My Documents</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Document Selector */}
              {showDocumentSelector ? (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Select a Document</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {userDocuments.map((doc) => (
                      <div
                        key={doc._id}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition duration-300"
                        onClick={() => handleDocumentSelect(doc)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.title}</h4>
                            <p className="text-sm text-gray-600">
                              {doc.fileType.toUpperCase()} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {doc.fileType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  {/* File Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Document
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition duration-300"
                      onClick={triggerFileInput}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-1">
                        {file ? file.name : 'Click to upload a file'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports PDF, TXT, and other text files
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.doc,.docx"
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>
                  
                  {/* Text Input */}
                  <div className="mt-6">
                    <label htmlFor="documentText" className="block text-sm font-medium text-gray-700 mb-2">
                      Paste Document Text
                    </label>
                    <textarea
                      id="documentText"
                      rows={15}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Paste your legal document here..."
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={analyzeDocument}
                  disabled={isLoading || !aiStatus.available || !documentText.trim()}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow-lg transition duration-300 ${
                    isLoading || !aiStatus.available || !documentText.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Analyze Document
                    </span>
                  )}
                </button>
                {isLoading && (
                  <button
                    onClick={stopAnalysis}
                    className="py-3 px-4 bg-red-500 text-white rounded-lg font-bold shadow-lg hover:bg-red-600 transition duration-300"
                  >
                    Stop
                  </button>
                )}
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results</h2>
              {isStreaming ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-indigo-800">Real-time Analysis</h3>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{streamedResponse}</p>
                    <div className="inline-block w-2 h-5 bg-indigo-600 ml-1 animate-pulse"></div>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={saveDocument}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                      </svg>
                      Save Document
                    </button>
                    <button
                      onClick={saveAnalysisResult}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save Analysis
                    </button>
                  </div>
                  
                  {/* Question input for document analysis */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Ask Questions About This Document
                    </h3>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Ask a question about this document..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                            askQuestionAboutDocument((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = document.querySelector('.bg-blue-50 input') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            askQuestionAboutDocument(input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition duration-300"
                      >
                        Ask
                      </button>
                    </div>
                  </div>

                  {/* Display Q&A history */}
                  {streamedResponse && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Q&A History</h3>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {streamedResponse}
                      </div>
                    </div>
                  )}

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Document Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Document Length</p>
                        <p className="font-medium">{analysisResult.document_length} characters</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Token Count</p>
                        <p className="font-medium">{analysisResult.token_count}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Document Type</p>
                        <p className="font-medium">{analysisResult.document_type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 101.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l-1.5-1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      Key Legal Terms
                    </h3>
                    {analysisResult.key_terms && analysisResult.key_terms.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.key_terms.map((term: string, index: number) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            {term}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No key legal terms identified.</p>
                    )}
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      Document Summary
                    </h3>
                    <p className="text-gray-700">{analysisResult.summary || 'No summary available.'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Analysis Results</h3>
                  <p className="text-gray-600 max-w-md">
                    {isLoading
                      ? 'Analyzing your document with AI...'
                      : 'Analysis results will appear here after you submit a document.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalAnalysis;