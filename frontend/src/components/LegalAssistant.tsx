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

const LegalAssistant: React.FC = () => {
  const { t, language } = useLanguage();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const response = await fetch('/api/ai/legal-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query: inputText })
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
          confidence: data.data.confidence
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
      const response = await fetch('/api/ai/legal-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      const response = await fetch('/api/ai/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('legalAssistant.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('legalAssistant.description')}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('legalAssistant.chat')}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowResearchForm(true)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
                  >
                    {t('legalAssistant.research')}
                  </button>
                  <button
                    onClick={() => setShowDocumentForm(true)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50"
                  >
                    {t('legalAssistant.documents')}
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'ai' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AI</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        
                        {message.sender === 'ai' && message.legalCategory && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/30 dark:text-purple-200">
                              {message.legalCategory}
                            </span>
                            {message.relatedConcepts && message.relatedConcepts.map((concept, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-200"
                              >
                                {concept}
                              </span>
                            ))}
                            {message.confidence && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-200">
                                {t('legalAssistant.confidence')}: {Math.round(message.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        )}
                        
                        {message.sender === 'ai' && (
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleTextToSpeech(message.text)}
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                            >
                              {isSpeaking ? (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                  </svg>
                                  {t('legalAssistant.stop')}
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m1.414-2.828a5 5 0 010-7.072m-2.828 9.9a9 9 0 010-12.728" />
                                  </svg>
                                  {t('legalAssistant.listen')}
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      {message.sender === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">U</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-lg p-4 bg-gray-100 dark:bg-gray-700">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div className="ml-2">
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('legalAssistant.askQuestion')}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              {t('legalAssistant.capabilities')}
            </h3>
            
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <svg className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('legalAssistant.capability1')}</span>
              </li>
              <li className="flex items-start">
                <svg className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('legalAssistant.capability2')}</span>
              </li>
              <li className="flex items-start">
                <svg className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('legalAssistant.capability3')}</span>
              </li>
              <li className="flex items-start">
                <svg className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('legalAssistant.capability4')}</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {t('legalAssistant.quickActions')}
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowResearchForm(true)}
                  className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  {t('legalAssistant.research')}
                </button>
                <button
                  onClick={() => setShowDocumentForm(true)}
                  className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
                >
                  {t('legalAssistant.documents')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Research Modal */}
      {showResearchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('legalAssistant.legalResearch')}
                </h3>
                <button
                  onClick={() => setShowResearchForm(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleLegalResearch}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('legalAssistant.researchTopic')}
                    </label>
                    <input
                      type="text"
                      value={researchTopic}
                      onChange={(e) => setResearchTopic(e.target.value)}
                      placeholder={t('legalAssistant.researchTopicPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('legalAssistant.jurisdiction')}
                    </label>
                    <select
                      value={researchJurisdiction}
                      onChange={(e) => setResearchJurisdiction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? t('common.loading') : t('legalAssistant.conductResearch')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Legal Research Results */}
      {legalResearch && (
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('legalAssistant.researchResults')}: {legalResearch.topic}
              </h3>
              <button
                onClick={() => setLegalResearch(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {legalResearch.summary}
              </p>
              
              {legalResearch.caseLaw.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('legalAssistant.caseLaw')}
                  </h4>
                  <ul className="space-y-2">
                    {legalResearch.caseLaw.map((caseItem, index) => (
                      <li key={index} className="border-l-4 border-blue-500 pl-3 py-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {caseItem.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {caseItem.citation} | {caseItem.court} | {caseItem.date}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {caseItem.summary}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {legalResearch.statutes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('legalAssistant.statutes')}
                  </h4>
                  <ul className="space-y-2">
                    {legalResearch.statutes.map((statute, index) => (
                      <li key={index} className="border-l-4 border-green-500 pl-3 py-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {statute.name} - {statute.section}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {statute.description}
                        </p>
                        <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
      )}

      {/* Document Generation Modal */}
      {showDocumentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('legalAssistant.generateDocument')}
                </h3>
                <button
                  onClick={() => setShowDocumentForm(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleGenerateDocument}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('legalAssistant.documentType')}
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">{t('legalAssistant.selectDocumentType')}</option>
                      <option value="bail-application">Bail Application</option>
                      <option value="legal-opinion">Legal Opinion</option>
                      <option value="contract-draft">Contract Draft</option>
                      <option value="affidavit">Affidavit</option>
                      <option value="notice">Legal Notice</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('legalAssistant.documentDetails')}
                    </label>
                    <textarea
                      value={documentDetails}
                      onChange={(e) => setDocumentDetails(e.target.value)}
                      placeholder={t('legalAssistant.documentDetailsPlaceholder')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDocumentForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isLoading ? t('common.loading') : t('legalAssistant.generate')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generated Document */}
      {generatedDocument && (
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('legalAssistant.generatedDocument')}: {generatedDocument.documentType}
              </h3>
              <button
                onClick={() => setGeneratedDocument(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-900">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('legalAssistant.download')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalAssistant;