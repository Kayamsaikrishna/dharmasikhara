import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import textToSpeech from '../utils/textToSpeech';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  legalCategory?: string;
  relatedConcepts?: string[];
  confidence?: number;
  sources?: string[];
}

interface LegalResearch {
  topic: string;
  jurisdiction: string;
  summary: string;
  caseLaw: any[];
  statutes: any[];
  legalPrinciples: string[];
  suggestedReading: string[];
}

interface LegalDocument {
  documentType: string;
  generatedDocument: string;
  timestamp: string;
}

interface DocumentAnalysis {
  document_length: number;
  token_count: number;
  document_type: string;
  summary: string;
  key_terms: string[];
  parties_involved: string[];
  key_dates: string[];
  monetary_values: string[];
  legal_provisions: string[];
  risk_assessment: any[];
  recommended_actions: string[];
  document_structure: any;
  confidence: number;
}

const LegalAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your AI Legal Assistant powered by InCaseLawBERT. How can I help you with your legal questions today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [researchTopic, setResearchTopic] = useState('');
  const [researchJurisdiction, setResearchJurisdiction] = useState('india');
  const [showResearchForm, setShowResearchForm] = useState(false);
  const [legalResearch, setLegalResearch] = useState<LegalResearch | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentDetails, setDocumentDetails] = useState('');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<LegalDocument | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentContext, setDocumentContext] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null);
  const [showDocumentAnalysis, setShowDocumentAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'document' | 'summary' | 'keypoints' | 'sections'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const handleSpeechInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      // For text files, read content directly
      if (selectedFile.type.startsWith('text/') || selectedFile.name.toLowerCase().endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string || '';
          setDocumentContext(content);
          analyzeDocument(content);
        };
        reader.readAsText(selectedFile);
      } 
      // For PDF files, send to backend for text extraction
      else if (selectedFile.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/account/extract-text', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          const data = await response.json();
          
          if (data.success) {
            setDocumentContext(data.text);
            analyzeDocument(data.text);
          } else {
            setError(data.message || 'Failed to extract text from PDF');
          }
        } catch (err) {
          setError('Failed to extract text from PDF: ' + (err as Error).message);
          console.error('PDF extraction error:', err);
        }
      }
    }
  };

  const analyzeDocument = async (documentText: string) => {
    if (!documentText) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ documentText })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.data);
        setShowDocumentAnalysis(true);
        
        // Add a message to inform the user that the document has been analyzed
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: `I've analyzed your document. It appears to be a ${data.data.document_type} with ${data.data.document_length} characters. I've identified ${data.data.key_terms.length} key legal terms and provided a summary. You can now ask me questions about this document.`,
          sender: 'ai',
          timestamp: new Date(),
          legalCategory: data.data.document_type,
          relatedConcepts: data.data.key_terms,
          confidence: data.data.confidence
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(data.message || 'Failed to analyze document');
      }
    } catch (err) {
      setError('Failed to analyze document: ' + (err as Error).message);
      console.error('Document analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const requestBody: any = { query: inputText };
      
      // If we have document context, include it in the request
      if (documentContext) {
        requestBody.documentContext = documentContext;
        requestBody.documentAnalysis = analysisResult;
      }
      
      const response = await fetch('/api/ai/legal-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.response || data.data.answer || 'I apologize, but I could not generate a response.',
          sender: 'ai',
          timestamp: new Date(),
          legalCategory: data.data.legalCategory,
          relatedConcepts: data.data.relatedConcepts,
          confidence: data.data.confidence,
          sources: data.data.sources
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(data.message || 'Failed to get response from AI assistant');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Send message error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegalResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!researchTopic.trim()) return;
    
    setIsLoading(true);
    setError('');
    setLegalResearch(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/legal-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          topic: researchTopic,
          jurisdiction: researchJurisdiction
        })
      });

      const data = await response.json();

      if (data.success) {
        setLegalResearch(data.data);
        setShowResearchForm(false);
      } else {
        setError(data.message || 'Failed to conduct legal research');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Legal research error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentType || !documentDetails.trim()) return;
    
    setIsLoading(true);
    setError('');
    setGeneratedDocument(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          documentType,
          details: documentDetails
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedDocument(data.data);
        setShowDocumentForm(false);
      } else {
        setError(data.message || 'Failed to generate legal document');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Generate document error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    if (isSpeaking) {
      textToSpeech.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await textToSpeech.speak(text, { language });
    } catch (err) {
      console.error('Text-to-speech error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Legal Assistant Title Bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold">Legal Assistant</h2>
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-indigo-600 px-2 py-1 rounded-full">
              Powered by InCaseLawBERT
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white text-gray-800 p-4 flex flex-col shadow-lg rounded-lg">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Document Context</h2>
            <div 
              className="border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition duration-300 bg-indigo-50"
              onClick={triggerFileInput}
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-indigo-700 text-sm mb-1">
                {file ? file.name : 'Click to upload a file'}
              </p>
              <p className="text-xs text-indigo-500">
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
            
            {documentContext && (
              <div className="mt-3 text-xs text-gray-400">
                <p>Document loaded: {documentContext.length} characters</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => setShowResearchForm(true)}
                className="w-full text-left px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-300"
              >
                Legal Research
              </button>
              <button
                onClick={() => setShowDocumentForm(true)}
                className="w-full text-left px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-300"
              >
                Generate Document
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Document Analysis</h2>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('summary')}
                disabled={!analysisResult}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition duration-300 ${
                  activeTab === 'summary' 
                    ? 'bg-indigo-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } ${!analysisResult ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('keypoints')}
                disabled={!analysisResult}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition duration-300 ${
                  activeTab === 'keypoints' 
                    ? 'bg-indigo-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } ${!analysisResult ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Key Points
              </button>
              <button
                onClick={() => setActiveTab('sections')}
                disabled={!analysisResult}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition duration-300 ${
                  activeTab === 'sections' 
                    ? 'bg-indigo-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } ${!analysisResult ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Legal Sections
              </button>
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-indigo-100 rounded-lg p-3">
              <h3 className="font-medium text-sm mb-2">Capabilities</h3>
              <ul className="text-xs text-indigo-800 space-y-1">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 w-4 h-4 text-green-500 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Legal document analysis</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 w-4 h-4 text-green-500 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Case law research</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 w-4 h-4 text-green-500 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Document generation</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 w-4 h-4 text-green-500 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Voice input/output</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-indigo-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'chat'
                    ? 'text-white border-b-2 border-indigo-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Chat
              </button>
              {analysisResult && (
                <>
                  <button
                    onClick={() => setActiveTab('document')}
                    className={`px-4 py-3 text-sm font-medium ${
                      activeTab === 'document'
                        ? 'text-white border-b-2 border-indigo-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Document Analysis
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'chat' && (
              <>
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3xl rounded-lg p-4 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.sender === 'ai' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">AI</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="whitespace-pre-wrap">{message.text}</p>
                              <span className="text-xs text-indigo-500 ml-2">
                                {formatDateTime(message.timestamp)}
                              </span>
                            </div>
                            
                            {message.sender === 'ai' && (
                              <div className="mt-3 space-y-2">
                                {message.legalCategory && (
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                                      {message.legalCategory}
                                    </span>
                                    {message.relatedConcepts && message.relatedConcepts.map((concept, index) => (
                                      <span 
                                        key={index} 
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full"
                                      >
                                        {concept}
                                      </span>
                                    ))}
                                    {message.confidence && (
                                      <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                                        Confidence: {Math.round(message.confidence * 100)}%
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {message.sources && message.sources.length > 0 && (
                                  <div className="text-xs text-gray-400">
                                    <span className="font-medium">Sources:</span> {message.sources.join(', ')}
                                  </div>
                                )}
                                
                                <div className="flex space-x-2 pt-2">
                                  <button
                                    onClick={() => handleTextToSpeech(message.text)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                                  >
                                    {isSpeaking ? (
                                      <>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        Stop
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m1.414-2.828a5 5 0 010-7.072m-2.828 9.9a9 9 0 010-12.728" />
                                        </svg>
                                        Listen
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          {message.sender === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">U</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="max-w-3xl rounded-lg p-4 bg-white shadow-md border border-indigo-100">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">AI</span>
                          </div>
                          <div className="ml-2">
                            <div className="flex space-x-1 text-indigo-600">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <p className="text-sm text-indigo-500 mt-1">
                              Analyzing with InCaseLawBERT model...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-indigo-200">
                  {error && (
                    <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a legal question..."
                        className="w-full px-4 py-3 pr-12 bg-white text-gray-800 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm"
                        rows={2}
                        disabled={isLoading}
                      />
                      <div className="absolute right-2 bottom-2 flex space-x-1">
                        {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                          <button
                            onClick={handleSpeechInput}
                            className={`p-1 rounded-full ${
                              isListening 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                            title={isListening ? "Stop listening" : "Voice input"}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputText.trim()}
                      className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md"
                    >
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'document' && analysisResult && (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-indigo-100">
                    <h2 className="text-xl font-bold text-indigo-800 mb-2">Document Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Document Type</p>
                        <p className="text-white font-semibold">{analysisResult.document_type}</p>
                      </div>
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Length</p>
                        <p className="text-white font-semibold">{analysisResult.document_length} characters</p>
                      </div>
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Tokens</p>
                        <p className="text-white font-semibold">{analysisResult.token_count}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
                      <p className="text-gray-300">{analysisResult.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Key Terms</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.key_terms.map((term, index) => (
                            <span key={index} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Parties Involved</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.parties_involved.length > 0 ? (
                            analysisResult.parties_involved.map((party, index) => (
                              <span key={index} className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                                {party}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No parties identified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-4">Detailed Analysis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-white mb-2">Key Dates</h4>
                        {analysisResult.key_dates.length > 0 ? (
                          <ul className="space-y-1">
                            {analysisResult.key_dates.map((date, index) => (
                              <li key={index} className="text-gray-300 text-sm">{date}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No dates identified</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-white mb-2">Monetary Values</h4>
                        {analysisResult.monetary_values.length > 0 ? (
                          <ul className="space-y-1">
                            {analysisResult.monetary_values.map((value, index) => (
                              <li key={index} className="text-gray-300 text-sm">{value}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No monetary values identified</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium text-white mb-2">Legal Provisions</h4>
                      {analysisResult.legal_provisions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.legal_provisions.map((provision, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                              {provision}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No legal provisions identified</p>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium text-white mb-2">Risk Assessment</h4>
                      {analysisResult.risk_assessment.length > 0 ? (
                        <div className="space-y-2">
                          {analysisResult.risk_assessment.map((risk, index) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-lg">
                              <div className="flex justify-between">
                                <span className="text-white font-medium">{risk.risk}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  risk.severity === 'High' ? 'bg-red-600' : 
                                  risk.severity === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                                }`}>
                                  {risk.severity}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm mt-1">{risk.mentions} mention(s)</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No risks identified</p>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium text-white mb-2">Recommended Actions</h4>
                      {analysisResult.recommended_actions.length > 0 ? (
                        <ul className="space-y-2">
                          {analysisResult.recommended_actions.map((action, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-300">{action}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">No recommendations available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'summary' && analysisResult && (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Document Summary</h2>
                    <p className="text-gray-300 leading-relaxed">{analysisResult.summary}</p>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Document Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Document Type</p>
                          <p className="text-white font-semibold">{analysisResult.document_type}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Length</p>
                          <p className="text-white font-semibold">{analysisResult.document_length} characters</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Tokens</p>
                          <p className="text-white font-semibold">{analysisResult.token_count}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keypoints' && analysisResult && (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Key Points</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Key Legal Terms</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.key_terms.map((term, index) => (
                            <span key={index} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Parties Involved</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.parties_involved.length > 0 ? (
                            analysisResult.parties_involved.map((party, index) => (
                              <span key={index} className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                                {party}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No parties identified</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Key Dates</h3>
                        {analysisResult.key_dates.length > 0 ? (
                          <ul className="space-y-1">
                            {analysisResult.key_dates.map((date, index) => (
                              <li key={index} className="text-gray-300 text-sm">{date}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No dates identified</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Monetary Values</h3>
                        {analysisResult.monetary_values.length > 0 ? (
                          <ul className="space-y-1">
                            {analysisResult.monetary_values.map((value, index) => (
                              <li key={index} className="text-gray-300 text-sm">{value}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No monetary values identified</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Legal Provisions</h3>
                        {analysisResult.legal_provisions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.legal_provisions.map((provision, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                                {provision}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No legal provisions identified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && analysisResult && (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Legal Sections & Provisions</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Document Type Classification</h3>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-white font-semibold">{analysisResult.document_type}</p>
                          <p className="text-gray-300 text-sm mt-1">Confidence: {Math.round(analysisResult.confidence * 100)}%</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Legal Provisions Identified</h3>
                        {analysisResult.legal_provisions.length > 0 ? (
                          <div className="space-y-3">
                            {analysisResult.legal_provisions.map((provision, index) => (
                              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="text-white font-medium">{provision}</h4>
                                <p className="text-gray-300 text-sm mt-1">Relevant section or provision mentioned in the document</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400">No specific legal provisions identified in the document</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Risk Assessment</h3>
                        {analysisResult.risk_assessment.length > 0 ? (
                          <div className="space-y-3">
                            {analysisResult.risk_assessment.map((risk, index) => (
                              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-white font-medium">{risk.risk}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    risk.severity === 'High' ? 'bg-red-600' : 
                                    risk.severity === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                                  }`}>
                                    {risk.severity}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm mt-2">{risk.mentions} mention(s) in the document</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400">No legal risks identified in the document</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Recommended Actions</h3>
                        {analysisResult.recommended_actions.length > 0 ? (
                          <ul className="space-y-2">
                            {analysisResult.recommended_actions.map((action, index) => (
                              <li key={index} className="flex items-start bg-gray-700 p-3 rounded-lg">
                                <svg className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-300">{action}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No specific recommendations available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legal Research Modal */}
      {showResearchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Legal Research
                </h3>
                <button
                  onClick={() => setShowResearchForm(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleLegalResearch}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Research Topic
                    </label>
                    <input
                      type="text"
                      value={researchTopic}
                      onChange={(e) => setResearchTopic(e.target.value)}
                      placeholder="Enter legal topic or question"
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Jurisdiction
                    </label>
                    <select
                      value={researchJurisdiction}
                      onChange={(e) => setResearchJurisdiction(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="india">India (All Courts)</option>
                      <option value="supreme-court">Supreme Court of India</option>
                      <option value="high-courts">High Courts</option>
                      <option value="district-courts">District Courts</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowResearchForm(false)}
                    className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 shadow-md"
                  >
                    {isLoading ? 'Researching...' : 'Conduct Research'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Legal Research Results */}
      {legalResearch && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Research Results: {legalResearch.topic}
                </h3>
                <button
                  onClick={() => setLegalResearch(null)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="prose max-w-none text-gray-800">
                <p className="text-indigo-700 mb-4">
                  {legalResearch.summary}
                </p>
                
                {legalResearch.caseLaw.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-white mb-2">
                      Case Law
                    </h4>
                    <ul className="space-y-3">
                      {legalResearch.caseLaw.map((caseItem, index) => (
                        <li key={index} className="border-l-4 border-indigo-500 pl-3 py-1 bg-indigo-50 p-3 rounded">
                          <p className="font-medium text-white">
                            {caseItem.title}
                          </p>
                          <p className="text-sm text-indigo-600">
                            {caseItem.citation} | {caseItem.court} | {caseItem.date}
                          </p>
                          <p className="text-sm text-indigo-700 mt-1">
                            {caseItem.summary}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {legalResearch.statutes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-white mb-2">
                      Statutes
                    </h4>
                    <ul className="space-y-3">
                      {legalResearch.statutes.map((statute, index) => (
                        <li key={index} className="border-l-4 border-purple-500 pl-3 py-1 bg-purple-50 p-3 rounded">
                          <p className="font-medium text-white">
                            {statute.name} - {statute.section}
                          </p>
                          <p className="text-sm text-indigo-700">
                            {statute.description}
                          </p>
                          <ul className="mt-2 text-sm text-gray-400">
                            {statute.keyPoints.map((point: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Generation Modal */}
      {showDocumentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Generate Legal Document
                </h3>
                <button
                  onClick={() => setShowDocumentForm(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleGenerateDocument}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Document Type
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Document Type</option>
                      <option value="bail-application">Bail Application</option>
                      <option value="legal-opinion">Legal Opinion</option>
                      <option value="contract-draft">Contract Draft</option>
                      <option value="affidavit">Affidavit</option>
                      <option value="notice">Legal Notice</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Document Details
                    </label>
                    <textarea
                      value={documentDetails}
                      onChange={(e) => setDocumentDetails(e.target.value)}
                      placeholder="Enter details for the document..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDocumentForm(false)}
                    className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 shadow-md"
                  >
                    {isLoading ? 'Generating...' : 'Generate Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generated Document */}
      {generatedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Generated Document: {generatedDocument.documentType}
                </h3>
                <button
                  onClick={() => setGeneratedDocument(null)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border border-indigo-200 rounded-md p-4 bg-white">
                <pre className="whitespace-pre-wrap text-sm text-indigo-800 font-mono">
                  {generatedDocument.generatedDocument}
                </pre>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    const blob = new Blob([generatedDocument.generatedDocument], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `legal-document-${new Date().toISOString().slice(0, 10)}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
                >
                  Download Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalAssistant;