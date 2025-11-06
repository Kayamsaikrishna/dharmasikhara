import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface LegalNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  url: string; // Added url property
}

const LegalNewsFeed: React.FC = () => {
  const [news, setNews] = useState<LegalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestNews();
    
    // Set up interval to fetch news every 30 minutes
    const interval = setInterval(() => {
      fetchLatestNews();
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(interval);
  }, []);

  const fetchLatestNews = async () => {
    try {
      const response = await fetch('/api/legal-news?limit=3');
      
      // Check if response is successful
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNews(data.data);
        } else {
          // Fallback to mock data if API fails
          setNews(getMockNews());
        }
      } else {
        // Fallback to mock data if API fails
        setNews(getMockNews());
      }
    } catch (err) {
      console.error('Failed to fetch legal news:', err);
      // Fallback to mock data if API fails
      setNews(getMockNews());
    } finally {
      setLoading(false);
    }
  };

  const getMockNews = (): LegalNewsItem[] => {
    return [
      {
        id: '1',
        title: 'Supreme Court Rules on Digital Evidence Admissibility',
        summary: 'The Supreme Court has issued new guidelines on the admissibility of digital evidence in criminal proceedings...',
        source: 'Supreme Court of India',
        date: new Date().toISOString().split('T')[0],
        category: 'Supreme Court',
        importance: 'high',
        url: 'https://supremecourtofindia.nic.in'
      },
      {
        id: '2',
        title: 'New Cybersecurity Regulations for Legal Firms',
        summary: 'The Ministry of Electronics and Information Technology has released new cybersecurity guidelines...',
        source: 'MeitY',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        category: 'Regulations',
        importance: 'medium',
        url: 'https://meity.gov.in'
      },
      {
        id: '3',
        title: 'Landmark Judgment on Environmental Law',
        summary: 'The National Green Tribunal has delivered a significant judgment on industrial pollution control...',
        source: 'NGT',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        category: 'Environmental Law',
        importance: 'high',
        url: 'https://ngt.nic.in'
      }
    ];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Latest Legal News</h2>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Latest Legal News</h2>
        <Link to="/legal-news" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          View All →
        </Link>
      </div>
      
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-indigo-600"
              >
                {item.title}
              </a>
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {item.summary}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="font-medium">{item.source}</span>
                <span>•</span>
                <span>{formatDate(item.date)}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.importance === 'high' 
                  ? 'bg-red-100 text-red-800' 
                  : item.importance === 'medium' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {item.importance}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalNewsFeed;