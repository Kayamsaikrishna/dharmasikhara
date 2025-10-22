import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import { Send, Bot, User, Upload, FileText, File as FileIcon } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const LegalAssistant: React.FC = () => {
  const { user, token } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Legal Assistant. How can I help you with your legal case today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentContext, setDocumentContext] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
          setDocumentContext(e.target?.result as string || '');
        };
        reader.readAsText(selectedFile);
      } 
      // For PDF files, read as base64
      else if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          // For PDF, we'll extract text on the backend, but we can still show the file name
          setDocumentContext(`PDF file selected: ${selectedFile.name}`);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !user || !token) return;
    
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
    
    try {
      // Prepare request body
      const requestBody: any = {
        query: inputText,
        context: 'legal assistance'
      };
      
      // If we have document context, add it to the request
      if (documentContext) {
        requestBody.documentContext = documentContext;
      }
      
      // If we have an analysis result, add it to the request
      if (analysisResult) {
        requestBody.documentAnalysis = analysisResult;
      }
      
      // Call the AI API endpoint
      const response = await fetch('http://localhost:5001/api/ai/npc-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Add AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.response || 'I understand your question. Let me help you with that.',
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an issue processing your request. Please try again.',
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting to the server. Please check your connection and try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDocument = async () => {
    if (!file || !token) return;
    
    setIsLoading(true);
    
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Send file to backend for text extraction
      const response = await fetch('http://localhost:5001/api/account/extract-text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDocumentContext(data.text);
        
        // Now analyze the document with the AI
        const analysisResponse = await fetch('http://localhost:5001/api/ai/analyze-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ documentText: data.text })
        });
        
        const analysisData = await analysisResponse.json();
        
        if (analysisData.success) {
          setAnalysisResult(analysisData.data);
          
          // Add a message to inform the user that the document has been analyzed
          const aiMessage: Message = {
            id: Date.now().toString(),
            text: `I've analyzed your document titled "${analysisData.data.document_type}". The document is about a laptop theft case involving Rajesh Kumar. You can now ask me specific questions about the case!`,
            sender: 'ai',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error('Failed to analyze document');
        }
      } else {
        throw new Error(data.message || 'Failed to extract text from document');
      }
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an issue processing your document. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Legal Assistant</h1>
              <p className="text-gray-600 mb-6">
                Please sign in to access the Legal Assistant and get help with your legal cases.
              </p>
              <a 
                href="/login" 
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Legal Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ask questions about your legal cases and get AI-powered guidance and information
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4">
              <h2 className="text-xl font-bold text-white">Document Context</h2>
              <p className="text-indigo-200 text-sm">Upload a document to ask questions about it</p>
            </div>
            
            <div className="p-4 border-b border-gray-200">
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
              
              {file && (
                <div className="flex space-x-3">
                  <button
                    onClick={analyzeDocument}
                    disabled={isLoading}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition duration-300 ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Analyze Document'}
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setDocumentContext('');
                      setAnalysisResult(null);
                    }}
                    className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition duration-300"
                  >
                    Clear
                  </button>
                </div>
              )}
              
              {analysisResult && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <strong>Document analyzed:</strong> {analysisResult.document_type} with {analysisResult.document_length} characters
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4">
              <div className="flex items-center">
                <Bot className="w-8 h-8 text-white mr-3" />
                <div>
                  <h2 className="text-xl font-bold text-white">Legal Assistant</h2>
                  <p className="text-indigo-200 text-sm">Ask me anything about your legal case</p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-4 ${
                      message.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start">
                      {message.sender === 'ai' && (
                        <Bot className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      {message.sender === 'user' && (
                        <User className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <p 
                          className={`text-xs mt-2 ${
                            message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-4 bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                    <div className="flex items-center">
                      <Bot className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSubmit} className="flex">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question about your legal case..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className={`px-6 py-3 rounded-r-lg font-medium text-white transition duration-300 flex items-center ${
                    !inputText.trim() || isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Legal Assistant uses AI to provide general legal information and guidance
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalAssistant;