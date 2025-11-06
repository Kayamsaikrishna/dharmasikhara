import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import textToSpeech from '../utils/textToSpeech';

// Utility function for debouncing
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

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
  const { language } = useLanguage(); // Removed unused 't' variable
  const { token, isTokenExpired, logout, chatHistory, addChatHistory, updateChatHistory, deleteChatHistory } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your AI Legal Assistant. How can I help you with your legal questions today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentContext, setDocumentContext] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'document' | 'summary' | 'keypoints' | 'sections' | 'full'>('chat');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Memoize expensive computations
  const memoizedMessages = React.useMemo(() => messages, [messages]); // Fixed dependency array

  // Auto-scroll to bottom of messages with optimized scrolling
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Debounce the scroll to reduce unnecessary operations
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [memoizedMessages]);

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

  // Load chat history when component mounts
  useEffect(() => {
    if (chatHistory.length > 0) {
      // Load the most recent chat
      const latestChat = chatHistory[chatHistory.length - 1];
      setMessages(latestChat.messages);
      setCurrentChatId(latestChat.id);
    }
  }, [chatHistory]);

  // Save chat history when messages change
  useEffect(() => {
    if (messages.length > 1 && token) { // Only save if there are actual conversation messages
      const chatTitle = messages[1]?.text.substring(0, 30) || 'New Chat';
      
      if (currentChatId) {
        // Update existing chat
        updateChatHistory(currentChatId, messages);
      } else {
        // Create new chat
        const newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: chatTitle,
          messages,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        addChatHistory(newChat);
        setCurrentChatId(newChatId);
      }
    }
  }, [messages, token, currentChatId, chatHistory.length]);

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
          debouncedAnalyzeDocument(content);
        };
        reader.readAsText(selectedFile);
      } 
      // For PDF files, send to backend for text extraction
      else if (selectedFile.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        try {
          // Prepare headers - only add Authorization if token exists
          const headers: Record<string, string> = {};
          
          // Only add Authorization header if user is logged in
          if (token && !isTokenExpired()) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch('/api/account/extract-text', {
            method: 'POST',
            headers,
            body: formData
          });
          
          const data = await response.json();
          
          // Handle token expiration (only if token was sent)
          if (response.status === 403 && data.message === 'Invalid or expired token') {
            setError('Session expired. Please log in again.');
            logout();
            window.location.href = '/login';
            return;
          }
          
          if (data.success) {
            setDocumentContext(data.text);
            debouncedAnalyzeDocument(data.text);
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

  // Optimize document analysis by debouncing API calls
  const debouncedAnalyzeDocument = React.useCallback(
    debounce(async (documentText: string) => {
      if (!documentText) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // Prepare headers - only add Authorization if token exists
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        // Only add Authorization header if user is logged in
        if (token && !isTokenExpired()) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/ai/analyze-document', {
          method: 'POST',
          headers,
          body: JSON.stringify({ documentText })
        });
        
        const data = await response.json();
        
        // Handle token expiration (only if token was sent)
        if (response.status === 403 && data.message === 'Invalid or expired token') {
          setError('Session expired. Please log in again.');
          logout();
          window.location.href = '/login';
          return;
        }
        
        if (data.success) {
          setAnalysisResult(data.data);
          
          // Add a message to inform the user that the document has been analyzed
          const aiMessage: Message = {
            id: Date.now().toString(),
            text: `I've analyzed your document. It appears to be a ${data.data.document_type}. I've identified ${data.data.key_terms.length} key legal terms and provided a summary. You can now ask me questions about this document. Try asking about the key points, legal provisions, or specific sections you're interested in.`,
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
    }, 500),
    [token, isTokenExpired, logout]
  );

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
      const requestBody: any = { query: inputText };
      
      // If we have document context, include it in the request
      if (documentContext) {
        requestBody.documentContext = documentContext;
        requestBody.documentAnalysis = analysisResult;
      }
      
      // Prepare headers - only add Authorization if token exists
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Only add Authorization header if user is logged in
      if (token && !isTokenExpired()) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/ai/legal-assistant', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // Handle token expiration (only if token was sent)
      if (response.status === 403 && data.message === 'Invalid or expired token') {
        setError('Session expired. Please log in again.');
        logout();
        window.location.href = '/login';
        return;
      }

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

  // Function to start a new chat
  const startNewChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I am your AI Legal Assistant. How can I help you with your legal questions today?',
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    setCurrentChatId(null);
  };

  // Function to delete current chat
  const deleteCurrentChat = () => {
    if (currentChatId) {
      // Remove chat from history
      deleteChatHistory(currentChatId);
      // Start a new chat
      startNewChat();
    } else {
      // Just clear current messages
      startNewChat();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Legal Assistant Title Bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold">Legal Assistant</h2>
          <div className="flex items-center space-x-4">
            {(token && !isTokenExpired()) && (
              <div className="flex space-x-2">
                <button 
                  onClick={startNewChat}
                  className="text-xs bg-white text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition duration-300"
                >
                  New Chat
                </button>
                <button 
                  onClick={deleteCurrentChat}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                >
                  Delete Chat
                </button>
              </div>
            )}
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
            <div className="space-y-2">

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
            <h2 className="text-lg font-semibold mb-3">Capabilities</h2>
            <ul className="space-y-2 text-sm">
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

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'chat'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Chat
              </button>
              {analysisResult && (
                <>
                  <button
                    onClick={() => setActiveTab('document')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'document'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Document Analysis
                  </button>
                  {/* Add a new tab for full document content */}
                  <button
                    onClick={() => setActiveTab('full')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'full'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Full Document
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                  {memoizedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-3/4 rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-800 shadow-md'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <span className="font-semibold text-xs">
                            {message.sender === 'user' ? 'You' : 'AI'}
                          </span>
                          <span className="text-xs opacity-70 ml-2">
                            {formatDateTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        {message.sender === 'ai' && (
                          <button
                            onClick={() => handleTextToSpeech(message.text)}
                            className="mt-2 text-xs flex items-center text-indigo-600 hover:text-indigo-800"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                              />
                            </svg>
                            {isSpeaking ? 'Stop' : 'Listen'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white text-gray-800 rounded-lg p-3 shadow-md">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce mr-1"></div>
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce mr-1 delay-75"></div>
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 bg-white p-4">
                  {error && (
                    <div className="mb-3 text-red-600 text-sm bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  )}
                  <div className="flex items-end">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a legal question..."
                        className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={2}
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSpeechInput}
                        className={`absolute right-2 bottom-2 p-1 rounded ${
                          isListening
                            ? 'text-red-500 animate-pulse'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        disabled={isLoading}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputText.trim()}
                      className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2 h-10 w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'document' && analysisResult && (
              <div className="h-full overflow-y-auto p-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-bold mb-4 text-indigo-700">Document Analysis</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-indigo-700 mb-2">Document Type</h3>
                      <p className="text-gray-800">{analysisResult.document_type}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-indigo-700 mb-2">Key Information</h3>
                      <ul className="text-gray-800 text-sm space-y-1">
                        <li>{analysisResult.key_terms?.length || 0} Key Legal Terms</li>
                        <li>{analysisResult.parties_involved?.length || 0} Parties Involved</li>
                        <li>{analysisResult.key_dates?.length || 0} Important Dates</li>
                        <li>{analysisResult.legal_provisions?.length || 0} Legal Provisions</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-indigo-700">Summary</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">{analysisResult.summary}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-indigo-700">Key Legal Terms</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.key_terms.map((term, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-indigo-700">Parties Involved</h3>
                      <ul className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {analysisResult.parties_involved.map((party, index) => (
                          <li key={index} className="text-gray-800">
                            {party}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-indigo-700">Key Dates</h3>
                      <ul className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {analysisResult.key_dates.map((date, index) => (
                          <li key={index} className="text-gray-800">
                            {date}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'summary' && analysisResult && (
              <div className="h-full overflow-y-auto p-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-bold mb-4 text-indigo-700">Document Summary</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="prose max-w-none">
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {analysisResult.summary || 'No summary available.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-2">About this Summary</h3>
                    <p className="text-sm text-blue-700">
                      This comprehensive summary provides an overview of the key points, structure, and important provisions 
                      from your document. It combines the introduction, key sections, and conclusion to give you a complete 
                      understanding of the document's content. Ask specific questions about any part of the document for 
                      more detailed information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keypoints' && analysisResult && (
              <div className="h-full overflow-y-auto p-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-bold mb-4 text-indigo-700">Key Points</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-indigo-700">Key Legal Terms</h3>
                      <ul className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {analysisResult.key_terms.map((term, index) => (
                          <li key={index} className="text-gray-800">
                            {term}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-indigo-700">Parties Involved</h3>
                      <ul className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {analysisResult.parties_involved.map((party, index) => (
                          <li key={index} className="text-gray-800">
                            {party}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-indigo-700">Key Dates</h3>
                      <ul className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {analysisResult.key_dates.map((date, index) => (
                          <li key={index} className="text-gray-800">
                            {date}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-indigo-700">Monetary Values</h3>
                      <ul className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {analysisResult.monetary_values.map((value, index) => (
                          <li key={index} className="text-gray-800">
                            {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && analysisResult && (
              <div className="h-full overflow-y-auto p-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-bold mb-4 text-indigo-700">Legal Sections</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-indigo-700">Legal Provisions</h3>
                    {analysisResult.legal_provisions && analysisResult.legal_provisions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisResult.legal_provisions.map((provision, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-gray-800 font-medium">{provision}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No specific legal provisions were identified in the document.</p>
                    )}
                    <p className="text-xs text-gray-500 mt-4">
                      These are the legal provisions, sections, and references identified in your document. 
                      You can ask specific questions about any of these provisions for more detailed information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Full Document tab content */}
            {activeTab === 'full' && documentContext && (
              <div className="h-full overflow-y-auto p-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-bold mb-4 text-indigo-700">Full Document Content</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <pre className="text-gray-800 whitespace-pre-wrap font-sans">
                      {documentContext}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LegalAssistant;