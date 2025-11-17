import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Add CSS animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes slideInFromLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Scrollbar styling */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  if (!document.head.querySelector('style[data-legal-assistant]')) {
    styleSheet.setAttribute('data-legal-assistant', 'true');
    document.head.appendChild(styleSheet);
  }
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

const LegalAssistantProfessional: React.FC = () => {
  const { t, language } = useLanguage();
  const { token, isTokenExpired, logout, chatHistory, addChatHistory, updateChatHistory, deleteChatHistory } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get document state from location state when navigating back
  const locationState = location.state as { 
    analysisResult?: DocumentAnalysis; 
    documentContext?: string; 
    file?: File 
  } | null;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your AI Legal Assistant powered by DharmaSikhara. How can I help you with your legal questions today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(locationState?.file || null);
  const [documentContext, setDocumentContext] = useState<string>(locationState?.documentContext || '');
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(locationState?.analysisResult || null);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'keypoints' | 'sections' | 'document' | 'docchat'>('chat');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load chat history
  useEffect(() => {
    if (chatHistory.length > 0) {
      const latestChat = chatHistory[chatHistory.length - 1];
      setMessages(latestChat.messages);
      setCurrentChatId(latestChat.id);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 1 && token) {
      const chatTitle = messages[1]?.text.substring(0, 40) + '...' || 'New Chat';
      
      if (currentChatId) {
        updateChatHistory(currentChatId, messages);
      } else {
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
  }, [messages, token, currentChatId, addChatHistory, updateChatHistory]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);
    setIsLoading(true);
    setError('');

    try {
      let textContent = '';

      // Read text files directly
      if (selectedFile.type.startsWith('text/') || selectedFile.name.toLowerCase().endsWith('.txt')) {
        textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(selectedFile);
        });
      } 
      // Handle PDFs
      else if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Use absolute URL for cPanel deployment
        const apiUrl = '/api/account/extract-text';
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ message: 'Failed to extract text' }));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to extract PDF text');
        }
        
        textContent = data.text;
      }
      // Handle Word documents
      else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               selectedFile.name.toLowerCase().endsWith('.docx') ||
               selectedFile.type === 'application/msword' || 
               selectedFile.name.toLowerCase().endsWith('.doc')) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Use absolute URL for cPanel deployment
        const apiUrl = '/api/account/extract-text';
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to extract text' }));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to extract Word document text');
        }
        
        textContent = data.text;
      } else {
        // Try to read other files as text as a fallback
        textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = () => reject(new Error('Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.'));
          reader.readAsText(selectedFile);
        });
      }

      if (!textContent || textContent.trim().length === 0) {
        throw new Error('No text content found in the file');
      }

      setDocumentContext(textContent);
      await analyzeDocument(textContent);
      
    } catch (err) {
      console.error('File processing error:', err);
      setError('File upload error: ' + (err as Error).message);
      setIsLoading(false);
      setFile(null);
    }
  };

  const processFile = async (selectedFile: File) => {
    setIsLoading(true);
    setError('');
    
    try {
      let textContent = '';
      
      // Handle PDF files
      if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Use relative URL for cPanel deployment
        const apiUrl = '/api/account/extract-text';
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to extract text' }));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to extract PDF text');
        }
        
        textContent = data.text;
      }
      // Handle Word documents
      else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               selectedFile.name.toLowerCase().endsWith('.docx') ||
               selectedFile.type === 'application/msword' || 
               selectedFile.name.toLowerCase().endsWith('.doc')) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Use relative URL for cPanel deployment
        const apiUrl = '/api/account/extract-text';
          
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to extract text' }));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to extract Word document text');
        }
        
        textContent = data.text;
      } else {
        // Try to read other files as text as a fallback
        textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = () => reject(new Error('Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.'));
          reader.readAsText(selectedFile);
        });
      }

      if (!textContent || textContent.trim().length === 0) {
        throw new Error('No text content found in the file');
      }

      setDocumentContext(textContent);
      await analyzeDocument(textContent);
      
    } catch (err) {
      console.error('File processing error:', err);
      setError('File upload error: ' + (err as Error).message);
      setIsLoading(false);
      setFile(null);
    }
  };

  const analyzeDocument = async (documentText: string) => {
    if (!documentText) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token && !isTokenExpired()) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Use environment-aware API calls
      const analyzeDocumentUrl = process.env.NODE_ENV === 'production' 
        ? '/api/ai/analyze-document'
        : '/api/ai/analyze-document';
        
      const response = await fetch(analyzeDocumentUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ documentText })
      });
      
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Document too large. Maximum size is 50MB.');
        } else if (response.status === 503) {
          throw new Error('AI service unavailable. Please ensure Gemini API is configured.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Analysis failed: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Analysis failed');
      }

      setAnalysisResult(data.data);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Document analyzed successfully!

📄 Type: ${data.data.document_type}
📝 Length: ${data.data.document_length.toLocaleString()} characters
🔑 Key Terms: ${data.data.key_terms.length}

You can now ask questions about this document.`,
        sender: 'ai',
        timestamp: new Date(),
        legalCategory: data.data.document_type,
        relatedConcepts: data.data.key_terms.slice(0, 5),
        confidence: data.data.confidence
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Navigate to the document summary page with state
      navigate('/document-summary', { 
        state: { 
          analysisResult: data.data, 
          documentContext, 
          file,
          fromLegalAssistant: true 
        } 
      });
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Analysis error: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

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
      
      if (documentContext) {
        requestBody.documentContext = documentContext;
        requestBody.documentAnalysis = analysisResult;
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token && !isTokenExpired()) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      // Use environment-aware API calls
      const legalAssistantUrl = process.env.NODE_ENV === 'production' 
        ? '/api/ai/legal-assistant'
        : '/api/ai/legal-assistant';
        
      const response = await fetch(legalAssistantUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('AI service unavailable. Please check Gemini API configuration.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get AI response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.data.response || data.data.answer || 'No response generated.',
        sender: 'ai',
        timestamp: new Date(),
        legalCategory: data.data.legalCategory,
        relatedConcepts: data.data.relatedConcepts,
        confidence: data.data.confidence,
        sources: data.data.sources
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err: any) {
      console.error('Send message error:', err);
      if (err.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    setDocumentContext('');
    setAnalysisResult(null);
    setFile(null);
    setActiveTab('chat');
    setError('');
  };

  const deleteCurrentChat = () => {
    if (currentChatId) {
      deleteChatHistory(currentChatId);
    }
    startNewChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Document chat functions removed as they are now in a separate page

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-80 h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out custom-scrollbar`}>
        {/* Header */}
        <div className="flex-shrink-0 p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DharmaSikhara</h1>
              <p className="text-blue-100 text-sm">AI Legal Assistant</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={triggerFileInput}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
            />
            
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Conversation
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Chats</h2>
          </div>
          
          {chatHistory.length > 0 ? (
            <div className="space-y-2">
              {chatHistory.slice().reverse().map((chat) => (
                <div 
                  key={chat.id}
                  className={`group p-3 rounded-xl cursor-pointer text-sm transition-all ${
                    currentChatId === chat.id 
                      ? 'bg-blue-50 border-2 border-blue-300 shadow-sm' 
                      : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => {
                    setMessages(chat.messages);
                    setCurrentChatId(chat.id);
                    setActiveTab('chat');
                    setIsSidebarOpen(false);
                  }}
                >
                  <div className="font-medium text-gray-800 truncate">{chat.title}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatHistory(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Start chatting to build history</p>
            </div>
          )}
        </div>

        {/* Document Analysis Tabs */}
        {documentContext && analysisResult && (
          <div className="flex-shrink-0 p-4 border-t-2 border-gray-200 bg-gray-50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Document Insights
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { tab: 'summary', label: 'Summary', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/document-summary' },
                { tab: 'keypoints', label: 'Key Points', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', route: '/document-key-points' },
                { tab: 'sections', label: 'Sections', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', route: '/document-sections' },
                { tab: 'document', label: 'Full Doc', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/document-full' },
                { tab: 'docchat', label: 'Document Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', route: '/document-chat' }
              ].map(({ tab, label, icon, route }) => (
                <button
                  key={tab}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    navigate(route, { state: { analysisResult, documentContext, file } });
                    setIsSidebarOpen(false);
                  }}
                >
                  <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              AI Active
            </span>
            <span className="font-medium">v2.1</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg shadow-sm p-4 lg:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Back to Home"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="ml-14 lg:ml-0">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  Legal Assistant
                  {isLoading && (
                    <span className="ml-3 flex items-center text-sm font-normal text-blue-600">
                      <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {documentContext 
                    ? `📄 ${file?.name || 'Document Loaded'}` 
                    : "Indian Law Specialist"}
                </p>
              </div>
            </div>
            {currentChatId && (
              <button
                onClick={deleteCurrentChat}
                className="hidden lg:flex items-center px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Chat
              </button>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 custom-scrollbar"
        >
          {activeTab === 'chat' ? (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-[90%] lg:max-w-3xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-lg'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-lg border border-gray-100'
                  } p-4 lg:p-5`}>
                    <div className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        <div className="text-xs font-semibold mb-1 opacity-75">📚 Sources:</div>
                        <div className="text-xs opacity-75">{message.sources.slice(0, 3).join(' • ')}</div>
                      </div>
                    )}
                    <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white rounded-2xl rounded-bl-md p-5 shadow-lg border border-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Document Analysis Complete</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Document insights are now available in separate pages. Click on the tabs in the sidebar or the buttons below to view them.
              </p>
              <div className="flex justify-center space-x-3 flex-wrap gap-2">
                <button 
                  onClick={() => navigate('/document-summary', { state: { analysisResult, documentContext, file } })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Summary
                </button>
                <button 
                  onClick={() => navigate('/document-key-points', { state: { analysisResult, documentContext, file } })}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Key Points
                </button>
                <button 
                  onClick={() => navigate('/document-sections', { state: { analysisResult, documentContext, file } })}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sections
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="flex-shrink-0 border-t-2 border-gray-200 p-4 lg:p-6 bg-white/90 backdrop-blur-lg">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start border border-red-200 shadow-sm animate-fadeIn">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <div className="font-semibold mb-1">Error</div>
                <div>{error}</div>
              </div>
              <button 
                onClick={() => setError('')}
                className="ml-3 text-red-400 hover:text-red-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={documentContext 
                  ? "Ask about the document..." 
                  : "Ask a legal question..."}
                className="w-full p-4 pr-16 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm transition-all hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={2}
                maxLength={2000}
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                {inputText.length}/2000
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              title="Send message"
            >
              {isLoading ? (
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500 space-y-2 sm:space-y-0">
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono mr-1">Enter</kbd>
              to send • 
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono mx-1">Shift + Enter</kbd>
              for new line
            </span>
            {documentContext && (
              <span className="flex items-center text-green-600 font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Document loaded: {file?.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );

};

export default LegalAssistantProfessional;