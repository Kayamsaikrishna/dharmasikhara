import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Expert {
  id: string;
  name: string;
  title: string;
  specialization: string;
  experience: string;
  institution: string;
  rating: number;
  reviews: number;
  languages: string[];
  availability: string;
  hourlyRate: number;
  bio: string;
  education: string[];
  areasOfExpertise: string[];
}

interface Session {
  id: string;
  userId: string;
  expertId: string;
  userName: string;
  expertName: string;
  date: string;
  time: string;
  topic: string;
  notes: string;
  status: string;
  createdAt: string;
  scheduledAt: string;
  rating?: number;
  feedback?: string;
  feedbackSubmitted?: boolean;
}

const ExpertSupport: React.FC = () => {
  const { t } = useLanguage();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    topic: '',
    notes: ''
  });
  const [feedbackData, setFeedbackData] = useState({
    sessionId: '',
    rating: 0,
    feedback: ''
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Mock user ID for demonstration
  const userId = 'user-123';

  // Fetch available experts
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/expert-support/experts');
        const data = await response.json();
        
        if (data.success) {
          setExperts(data.data);
          setFilteredExperts(data.data);
        } else {
          setError(data.message || 'Failed to fetch experts');
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Fetch experts error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // Fetch user's sessions
  useEffect(() => {
    const fetchUserSessions = async () => {
      try {
        const response = await fetch(`/api/expert-support/sessions/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setUserSessions(data.data);
        }
      } catch (err) {
        console.error('Fetch user sessions error:', err);
      }
    };

    fetchUserSessions();
  }, []);

  // Fetch upcoming sessions
  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        const response = await fetch(`/api/expert-support/sessions/upcoming/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setUpcomingSessions(data.data);
        }
      } catch (err) {
        console.error('Fetch upcoming sessions error:', err);
      }
    };

    fetchUpcomingSessions();
  }, []);

  // Filter experts based on specialization and language
  useEffect(() => {
    let result = experts;
    
    if (specializationFilter) {
      result = result.filter(expert => 
        expert.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
      );
    }
    
    if (languageFilter) {
      result = result.filter(expert => 
        expert.languages.includes(languageFilter)
      );
    }
    
    setFilteredExperts(result);
  }, [specializationFilter, languageFilter, experts]);

  const handleExpertSelect = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowScheduleForm(false);
    setShowFeedbackForm(false);
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExpert) return;
    
    try {
      const response = await fetch('/api/expert-support/sessions/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          expertId: selectedExpert.id,
          date: scheduleData.date,
          time: scheduleData.time,
          topic: scheduleData.topic,
          notes: scheduleData.notes
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add new session to user sessions
        setUserSessions(prev => [...prev, data.data]);
        
        // Reset form and close
        setScheduleData({
          date: '',
          time: '',
          topic: '',
          notes: ''
        });
        setShowScheduleForm(false);
        
        alert('Session scheduled successfully!');
      } else {
        setError(data.message || 'Failed to schedule session');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Schedule session error:', err);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/expert-support/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update session status in state
        setUserSessions(prev => 
          prev.map(session => 
            session.id === sessionId 
              ? { ...session, status: 'cancelled' } 
              : session
          )
        );
        
        setUpcomingSessions(prev => 
          prev.filter(session => session.id !== sessionId)
        );
        
        alert('Session cancelled successfully!');
      } else {
        setError(data.message || 'Failed to cancel session');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Cancel session error:', err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/expert-support/sessions/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update session with feedback
        setUserSessions(prev => 
          prev.map(session => 
            session.id === feedbackData.sessionId 
              ? { ...session, rating: feedbackData.rating, feedback: feedbackData.feedback, feedbackSubmitted: true } 
              : session
          )
        );
        
        // Reset form and close
        setFeedbackData({
          sessionId: '',
          rating: 0,
          feedback: ''
        });
        setShowFeedbackForm(false);
        
        alert('Feedback submitted successfully!');
      } else {
        setError(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Submit feedback error:', err);
    }
  };

  const handleOpenFeedbackForm = (sessionId: string) => {
    setFeedbackData({
      sessionId,
      rating: 0,
      feedback: ''
    });
    setShowFeedbackForm(true);
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)} ({t('expertSupport.reviews')})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('expertSupport.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('expertSupport.description')}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Experts List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('expertSupport.specialization')}
                </label>
                <input
                  type="text"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  placeholder={t('expertSupport.specializationPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('expertSupport.language')}
                </label>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('expertSupport.allLanguages')}</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>
            </div>
          </div>

          {/* Experts */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('expertSupport.availableExperts')} ({filteredExperts.length})
            </h2>
            
            {filteredExperts.length > 0 ? (
              <div className="space-y-4">
                {filteredExperts.map((expert) => (
                  <div 
                    key={expert.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedExpert?.id === expert.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => handleExpertSelect(expert)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {expert.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {expert.title} • {expert.institution}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {expert.specialization} • {expert.experience}
                        </p>
                      </div>
                      <div className="text-right">
                        {getRatingStars(expert.rating)}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ₹{expert.hourlyRate}/hr
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {expert.languages.map((lang) => (
                        <span 
                          key={lang} 
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-200"
                        >
                          {lang.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('expertSupport.noExperts')}
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('expertSupport.upcomingSessions')}
            </h2>
            
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {session.expertName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.scheduledAt).toLocaleDateString()} at {session.time}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.topic}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancelSession(session.id)}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {t('expertSupport.cancel')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('expertSupport.noUpcomingSessions')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Expert Details and Scheduling */}
        <div className="lg:col-span-1">
          {selectedExpert ? (
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedExpert.name}
                    </h2>
                    <button
                      onClick={() => setSelectedExpert(null)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedExpert.title} • {selectedExpert.institution}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedExpert.specialization} • {selectedExpert.experience}
                    </p>
                  </div>
                  
                  {getRatingStars(selectedExpert.rating)}
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('expertSupport.about')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {selectedExpert.bio}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('expertSupport.availability')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {selectedExpert.availability}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('expertSupport.hourlyRate')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      ₹{selectedExpert.hourlyRate}/hour
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => setShowScheduleForm(true)}
                      className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t('expertSupport.scheduleSession')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Schedule Form */}
              {showScheduleForm && (
                <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('expertSupport.scheduleSession')}
                      </h3>
                      <button
                        onClick={() => setShowScheduleForm(false)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleScheduleSession}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('expertSupport.date')}
                          </label>
                          <input
                            type="date"
                            value={scheduleData.date}
                            onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('expertSupport.time')}
                          </label>
                          <input
                            type="time"
                            value={scheduleData.time}
                            onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('expertSupport.topic')}
                          </label>
                          <input
                            type="text"
                            value={scheduleData.topic}
                            onChange={(e) => setScheduleData({...scheduleData, topic: e.target.value})}
                            placeholder={t('expertSupport.topicPlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('expertSupport.notes')}
                          </label>
                          <textarea
                            value={scheduleData.notes}
                            onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                            placeholder={t('expertSupport.notesPlaceholder')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          type="submit"
                          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t('expertSupport.schedule')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('expertSupport.expertDetails')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('expertSupport.selectExpert')}
              </p>
            </div>
          )}
          
          {/* Feedback Form */}
          {showFeedbackForm && (
            <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('expertSupport.submitFeedback')}
                  </h3>
                  <button
                    onClick={() => setShowFeedbackForm(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleFeedbackSubmit}>
                  <div className="space-y-4">
                    <input
                      type="hidden"
                      value={feedbackData.sessionId}
                      onChange={(e) => setFeedbackData({...feedbackData, sessionId: e.target.value})}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('expertSupport.rating')}
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackData({...feedbackData, rating: star})}
                            className="text-2xl focus:outline-none"
                          >
                            {star <= feedbackData.rating ? (
                              <span className="text-yellow-400">★</span>
                            ) : (
                              <span className="text-gray-300">☆</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('expertSupport.feedback')}
                      </label>
                      <textarea
                        value={feedbackData.feedback}
                        onChange={(e) => setFeedbackData({...feedbackData, feedback: e.target.value})}
                        placeholder={t('expertSupport.feedbackPlaceholder')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t('expertSupport.submit')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertSupport;