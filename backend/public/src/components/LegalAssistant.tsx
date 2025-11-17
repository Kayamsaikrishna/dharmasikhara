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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Memoize expensive computations
  const memoizedMessages = React.useMemo(() => messages, [messages.length]);

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
          // Use relative path for API calls to work in both development and production
          const response = await fetch('/api/account/extract-text', {
            method: 'POST',
            headers: token && !isTokenExpired() ? { 'Authorization': `Bearer ${token}` } : {},
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
        
        // Check if response is OK before trying to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Document analysis error response:', errorText);
          
          // Handle specific error cases
          if (response.status === 413) {
            setError('Document is too large. Please upload a smaller document (less than 50MB).');
          } else {
            setError(`Document analysis failed with status ${response.status}: ${response.statusText}`);
          }
          return;
        }
        
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
        // Handle JSON parsing errors and other network errors
        if (err instanceof SyntaxError) {
          setError('Failed to process document analysis response. The server returned an invalid response.');
        } else {
          setError('Failed to analyze document: ' + (err as Error).message);
        }
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
      const requestBody: any = {
        query: inputText
      };
      
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
      
      // Set a longer timeout for the request to accommodate large model processing times
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout (increased from 2 minutes)
      
      // Use relative path for API calls to work in both development and production
      const response = await fetch('/api/ai/legal-assistant', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timeout - the AI is taking longer than expected to generate a response. This is normal for large language models and can take up to 2 minutes. Please try again.');
      } else {
        setError('Failed to connect to the server: ' + (err.message || 'Unknown error'));
      }
      console.error('Send message error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegalResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show error message since this feature is not implemented
    setError('Legal research feature is not currently available.');
    return;
    
    /*
    if (!researchTopic.trim()) return;
    
    setIsLoading(true);
    setError('');
    setLegalResearch(null);

    try {
      // Check if token exists and is valid (required for legal research)
      if (!token || isTokenExpired()) {
        setError('Authentication required for legal research. Please log in.');
        return;
      }
      
      // Use relative path for API calls to work in both development and production
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

      // Handle token expiration
      if (response.status === 403 && data.message === 'Invalid or expired token') {
        setError('Session expired. Please log in again.');
        logout();
        window.location.href = '/login';
        return;
      }

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
    */
  };

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show error message since this feature is not implemented
    setError('Document generation feature is not currently available.');
    return;
    
    /*
    if (!documentType || !documentDetails.trim()) return;
    
    setIsLoading(true);
    setError('');
    setGeneratedDocument(null);

    try {
      // Check if token exists and is valid (required for document generation)
      if (!token || isTokenExpired()) {
        setError('Authentication required for document generation. Please log in.');
        return;
      }
      
      // Use relative path for API calls to work in both development and production
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

      // Handle token expiration
      if (response.status === 403 && data.message === 'Invalid or expired token') {
        setError('Session expired. Please log in again.');
        logout();
        window.location.href = '/login';
        return;
      }

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
    */
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    if (message.sender === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="bg-blue-500 text-white rounded-lg p-4 max-w-xs md:max-w-md lg:max-w-lg shadow-md">
            <div className="font-medium">{message.text}</div>
            <div className="text-xs text-blue-100 mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 rounded-lg p-4 max-w-xs md:max-w-md lg:max-w-lg shadow-sm">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatAIResponse(message.text) }}
            />
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Sources:</div>
                <div className="text-xs text-gray-600 mt-1">
                  {message.sources.join(', ')}
                </div>
              </div>
            )}
            <div className="text-xs text-gray-400 mt-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      );
    }
  };

  // Function to format AI responses with proper HTML
  const formatAIResponse = (text: string): string => {
    if (!text) return '';
    
    // Convert markdown-style bold to HTML bold
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert markdown-style italics to HTML italics
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert markdown-style headers to HTML headers
    formattedText = formattedText.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    formattedText = formattedText.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    formattedText = formattedText.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    formattedText = formattedText.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formattedText = formattedText.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formattedText = formattedText.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Convert markdown-style lists to HTML lists
    formattedText = formattedText.replace(/^\* (.*$)/gm, '<li>$1</li>');
    formattedText = formattedText.replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
    formattedText = formattedText.replace(/<\/ul>\s*<ul>/g, '');
    
    // Convert markdown-style numbered lists to HTML lists
    formattedText = formattedText.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
    formattedText = formattedText.replace(/<li>(.*?)<\/li>/g, '<ol><li>$1</li></ol>');
    formattedText = formattedText.replace(/<\/ol>\s*<ol>/g, '');
    
    // Convert markdown-style tables to HTML tables
    formattedText = convertMarkdownTableToHtml(formattedText);
    
    // Convert line breaks to HTML breaks
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };

  // Function to convert markdown tables to HTML tables
  const convertMarkdownTableToHtml = (text: string): string => {
    const lines = text.split('<br />');
    let inTable = false;
    let tableHtml = '';
    let headerRow = true;
    
    const resultLines = [];
    
    for (const line of lines) {
      // Check if this is a table row (contains |)
      if (line.includes('|') && line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<table class="min-w-full border-collapse border border-gray-300"><thead>';
        }
        
        const cells = line.split('|').filter(cell => cell.trim() !== '');
        if (cells.length > 0) {
          if (headerRow) {
            tableHtml += '<tr class="bg-gray-100">';
            cells.forEach(cell => {
              tableHtml += `<th class="border border-gray-300 px-4 py-2 text-left font-bold">${cell.trim()}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';
            headerRow = false;
          } else {
            // Check if this is a separator row (contains ---)
            if (cells[0].includes('---')) {
              // Skip separator row
              continue;
            } else {
              tableHtml += '<tr>';
              cells.forEach(cell => {
                tableHtml += `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`;
              });
              tableHtml += '</tr>';
            }
          }
        }
      } else {
        if (inTable) {
          tableHtml += '</tbody></table>';
          resultLines.push(tableHtml);
          inTable = false;
          headerRow = true;
        }
        resultLines.push(line);
      }
    }
    
    if (inTable) {
      tableHtml += '</tbody></table>';
      resultLines.push(tableHtml);
    }
    
    return resultLines.join('<br />');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Legal Assistant Title Bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">Legal Assistant</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-indigo-800 px-2 py-1 rounded-full">
              AI Powered
            </span>
          </div>
        </div>
        <p className="text-indigo-200 text-sm mt-1">
          Ask questions about Indian law, upload documents for analysis
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Container */}
        <div 
          ref={messagesEndRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 rounded-lg p-3 max-w-xs md:max-w-md lg:max-w-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          {error && (
            <div className="mb-3 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about Indian law or upload a document..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={2}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex space-x-1">
                <button
                  onClick={handleSpeechInput}
                  className={`p-1 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Legal Research Modal */}
      {showResearchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Legal Research</h3>
              <button
                onClick={() => setShowResearchForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleLegalResearch}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Research Topic
                </label>
                <input
                  type="text"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter research topic"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jurisdiction
                </label>
                <select
                  value={researchJurisdiction}
                  onChange={(e) => setResearchJurisdiction(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="india">India</option>
                  <option value="delhi">Delhi</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="kolkata">Kolkata</option>
                  <option value="chennai">Chennai</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowResearchForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Research
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Generation Modal */}
      {showDocumentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generate Legal Document</h3>
              <button
                onClick={() => setShowDocumentForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleGenerateDocument}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select document type</option>
                  <option value="bail-application">Bail Application</option>
                  <option value="legal-opinion">Legal Opinion</option>
                  <option value="contract-draft">Contract Draft</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details
                </label>
                <textarea
                  value={documentDetails}
                  onChange={(e) => setDocumentDetails(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter document details"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDocumentForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Analysis */}
      {showDocumentAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={triggerFileInput}
                  className="w-full text-left px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
                >
                  Upload Document for Analysis
                </button>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Document Details</h3>
              <button
                onClick={() => setShowDocumentAnalysis(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Document Type:</span>
                <span>{analysisResult?.document_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Document Length:</span>
                <span>{analysisResult?.document_length} characters</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Token Count:</span>
                <span>{analysisResult?.token_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Confidence:</span>
                <span>{analysisResult?.confidence}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Summary:</span>
                <span>{analysisResult?.summary}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Key Terms:</span>
                <span>{analysisResult?.key_terms.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Parties Involved:</span>
                <span>{analysisResult?.parties_involved.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Key Dates:</span>
                <span>{analysisResult?.key_dates.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Monetary Values:</span>
                <span>{analysisResult?.monetary_values.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Legal Provisions:</span>
                <span>{analysisResult?.legal_provisions.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Risk Assessment:</span>
                <span>{analysisResult?.risk_assessment.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Recommended Actions:</span>
                <span>{analysisResult?.recommended_actions.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Document Structure:</span>
                <span>{analysisResult?.document_structure.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalAssistant;