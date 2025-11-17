import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Star, ThumbsUp, MessageCircle, Plus, Search } from 'lucide-react';

interface Review {
  id: number;
  user_id: number;
  scenario_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  username: string;
}

interface FAQ {
  id: number;
  user_id: number;
  question: string;
  category: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  answers: FAQAnswer[];
}

interface FAQAnswer {
  id: number;
  faq_id: number;
  user_id: number;
  answer: string;
  created_at: string;
  updated_at: string;
  author_name: string;
}

const ReviewsFAQ: React.FC = () => {
  const { user, token } = useUser();
  const [activeTab, setActiveTab] = useState<'reviews' | 'faq'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review form states
  const [scenarioId, setScenarioId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  // FAQ form states
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('general');
  
  // Answer form states
  const [answerText, setAnswerText] = useState<Record<number, string>>({});
  
  // Fetch reviews and FAQs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Use the correct API URL based on environment
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_BASE_URL = isDevelopment ? 'http://localhost:5000' : window.location.origin;
        
        // Fetch reviews
        const reviewsResponse = await fetch(`${API_BASE_URL}/api/community/reviews`);
        const reviewsData = await reviewsResponse.json();
        
        if (reviewsData.success) {
          setReviews(reviewsData.data);
        }
        
        // Fetch FAQs
        const faqsResponse = await fetch(`${API_BASE_URL}/api/community/faq`);
        const faqsData = await faqsResponse.json();
        
        if (faqsData.success) {
          setFaqs(faqsData.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching data: ' + (err as Error).message);
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !token) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    try {
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_BASE_URL = isDevelopment ? 'http://localhost:5000' : window.location.origin;
      
      const response = await fetch(`${API_BASE_URL}/api/community/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          scenarioId,
          rating,
          comment
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new review to the list
        setReviews([data.data, ...reviews]);
        
        // Reset form
        setScenarioId('');
        setRating(5);
        setComment('');
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review: ' + (err as Error).message);
      console.error('Review submission error:', err);
    }
  };
  
  // Handle FAQ submission
  const handleFAQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !token) {
      setError('You must be logged in to submit a question');
      return;
    }
    
    try {
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_BASE_URL = isDevelopment ? 'http://localhost:5000' : window.location.origin;
      
      const response = await fetch(`${API_BASE_URL}/api/community/faq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question,
          category
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new FAQ to the list
        setFaqs([data.data, ...faqs]);
        
        // Reset form
        setQuestion('');
        setCategory('general');
      } else {
        setError(data.message || 'Failed to submit question');
      }
    } catch (err) {
      setError('Failed to submit question: ' + (err as Error).message);
      console.error('FAQ submission error:', err);
    }
  };
  
  // Handle FAQ answer submission
  const handleAnswerSubmit = async (faqId: number) => {
    if (!user || !token) {
      setError('You must be logged in to submit an answer');
      return;
    }
    
    const answer = answerText[faqId];
    if (!answer) {
      setError('Please enter an answer');
      return;
    }
    
    try {
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_BASE_URL = isDevelopment ? 'http://localhost:5000' : window.location.origin;
      
      const response = await fetch(`${API_BASE_URL}/api/community/faq/${faqId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answer
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new answer to the FAQ
        setFaqs(faqs.map(faq => {
          if (faq.id === faqId) {
            return {
              ...faq,
              answers: [...faq.answers, data.data]
            };
          }
          return faq;
        }));
        
        // Reset answer text for this FAQ
        setAnswerText({
          ...answerText,
          [faqId]: ''
        });
      } else {
        setError(data.message || 'Failed to submit answer');
      }
    } catch (err) {
      setError('Failed to submit answer: ' + (err as Error).message);
      console.error('Answer submission error:', err);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading reviews and FAQs...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Reviews & FAQ</h1>
        <p className="text-gray-600">Share your experience and get answers to common questions</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ThumbsUp className="w-5 h-5 mr-2" />
              Reviews ({reviews.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'faq'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              FAQ ({faqs.length})
            </div>
          </button>
        </nav>
      </div>
      
      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          {/* Review Submission Form */}
          {user && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Share Your Experience</h2>
              <form onSubmit={handleReviewSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scenario ID</label>
                    <input
                      type="text"
                      value={scenarioId}
                      onChange={(e) => setScenarioId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter scenario ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="mr-1"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-gray-600">{rating} star{rating !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Share your experience with this scenario..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}
          
          {/* Reviews List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Reviews</h2>
            
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600 mb-4">Be the first to share your experience with a scenario!</p>
                {user ? (
                  <p className="text-gray-500">Use the form above to submit your review.</p>
                ) : (
                  <p className="text-gray-500">Please log in to submit a review.</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{review.username || 'Anonymous'}</h3>
                        <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                      </div>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-gray-600">{review.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div>
          {/* FAQ Submission Form */}
          {user && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ask a Question</h2>
              <form onSubmit={handleFAQSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="What would you like to know?"
                    required
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="scenarios">Scenarios</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
                >
                  Submit Question
                </button>
              </form>
            </div>
          )}
          
          {/* FAQ List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            {faqs.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-600 mb-4">Be the first to ask a question!</p>
                {user ? (
                  <p className="text-gray-500">Use the form above to submit your question.</p>
                ) : (
                  <p className="text-gray-500">Please log in to ask a question.</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{faq.question}</h3>
                          <div className="flex items-center mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {faq.category}
                            </span>
                            <span className="ml-3 text-sm text-gray-500">
                              Asked by {faq.author_name || 'Anonymous'} on {formatDate(faq.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Answers */}
                      {faq.answers && faq.answers.length > 0 && (
                        <div className="mt-6 space-y-4">
                          <h4 className="font-medium text-gray-900">Answers</h4>
                          {faq.answers.map((answer) => (
                            <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                              <p className="text-gray-700 mb-2">{answer.answer}</p>
                              <p className="text-sm text-gray-500">
                                Answered by {answer.author_name || 'Anonymous'} on {formatDate(answer.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Answer Form */}
                      {user && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Your Answer</h4>
                          <div className="flex">
                            <input
                              type="text"
                              value={answerText[faq.id] || ''}
                              onChange={(e) => setAnswerText({
                                ...answerText,
                                [faq.id]: e.target.value
                              })}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Type your answer..."
                            />
                            <button
                              onClick={() => handleAnswerSubmit(faq.id)}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition duration-300 font-medium"
                            >
                              Answer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsFAQ;