import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillsAndAmendments from './BillsAndAmendments';

interface LegalNewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  date: string;
  url: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
}

const LegalNews: React.FC = () => {
  const [news, setNews] = useState<LegalNewsItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'bills'>('news');

  // Fetch legal news and categories
  useEffect(() => {
    fetchLegalNews();
    fetchCategories();
    
    // Set up interval to fetch news every 30 minutes
    const interval = setInterval(() => {
      fetchLegalNews();
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const fetchLegalNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/legal-news', {
        params: { 
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 20
        }
      });
      
      if (response.data.success) {
        setNews(response.data.data);
      } else {
        setError('Failed to fetch legal news');
        // Fallback to mock data if API fails
        loadMockNews();
      }
    } catch (err) {
      setError('Failed to fetch legal news');
      console.error('Error fetching legal news:', err);
      // Fallback to mock data if API fails
      loadMockNews();
    } finally {
      setLoading(false);
    }
  };

  const loadMockNews = () => {
    const mockNews: LegalNewsItem[] = [
      {
        id: '1',
        title: 'Supreme Court Rules on Digital Evidence Admissibility',
        summary: 'The Supreme Court has issued new guidelines on the admissibility of digital evidence in criminal proceedings, emphasizing the need for proper chain of custody.',
        content: 'In a landmark judgment delivered today, the Supreme Court of India has laid down comprehensive guidelines regarding the admissibility of digital evidence in criminal proceedings. The court emphasized the critical importance of maintaining a proper chain of custody for digital evidence to ensure its integrity and authenticity. The judgment comes at a time when digital evidence is increasingly becoming crucial in criminal investigations. The court noted that with the proliferation of digital devices and the ease with which digital data can be manipulated, stringent safeguards are necessary to prevent misuse. The guidelines require law enforcement agencies to maintain detailed logs of digital evidence handling, including timestamps of access and details of personnel involved. The judgment also mandates that digital evidence be stored in secure environments with restricted access. Legal experts have hailed the judgment as a significant step towards ensuring fair trials in the digital age.',
        source: 'Supreme Court of India',
        date: new Date().toISOString().split('T')[0],
        url: 'https://supremecourtofindia.nic.in',
        category: 'Supreme Court',
        importance: 'high'
      },
      {
        id: '2',
        title: 'New Cybersecurity Regulations for Legal Firms',
        summary: 'The Ministry of Electronics and Information Technology has released new cybersecurity guidelines specifically for legal practitioners handling sensitive client data.',
        content: 'The Ministry of Electronics and Information Technology (MeitY) has announced new cybersecurity regulations that will come into effect from January 2024. These regulations are specifically designed for legal firms and practitioners who handle sensitive client data. The new guidelines mandate that all legal firms implement multi-factor authentication for accessing client data, encrypt all stored data, and conduct regular security audits. The regulations also require firms to appoint a dedicated Data Protection Officer (DPO) who will be responsible for ensuring compliance. Legal firms with more than 50 employees must undergo annual third-party security assessments. The regulations also introduce strict penalties for data breaches, with fines of up to 2% of annual turnover or INR 5 crores, whichever is higher. The Bar Council of India has welcomed these regulations, stating that they will significantly enhance client data protection in the legal profession.',
        source: 'MeitY',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        url: 'https://meity.gov.in',
        category: 'Regulations',
        importance: 'medium'
      },
      {
        id: '3',
        title: 'Landmark Judgment on Environmental Law',
        summary: 'The National Green Tribunal has delivered a significant judgment on industrial pollution control, setting new precedents for environmental litigation.',
        content: 'The National Green Tribunal (NGT) has delivered a groundbreaking judgment in a case related to industrial pollution control in the National Capital Region. The judgment establishes new precedents for determining liability in environmental damage cases and introduces a comprehensive framework for calculating compensation. The tribunal has mandated that all industries within a 10-kilometer radius of ecologically sensitive areas must conduct quarterly environmental impact assessments. The judgment also introduces the concept of "extended producer responsibility" for industries, requiring them to take responsibility for the entire lifecycle of their products. The tribunal has imposed strict penalties on industries found violating environmental norms, with compensation calculated based on the extent of environmental damage caused. Environmental law experts have described the judgment as a turning point in India\'s approach to environmental protection and corporate accountability.',
        source: 'NGT',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        url: 'https://ngt.nic.in',
        category: 'Environmental Law',
        importance: 'high'
      },
      {
        id: '4',
        title: 'Amendments to the Arbitration and Conciliation Act',
        summary: 'The Parliament has passed amendments to the Arbitration and Conciliation Act to expedite dispute resolution and reduce court backlog.',
        content: 'The Parliament has passed significant amendments to the Arbitration and Conciliation Act, 1996, aimed at further expediting dispute resolution and reducing the backlog of cases in Indian courts. The amendments introduce a new provision for emergency arbitrators, allowing parties to seek urgent interim measures even before the constitution of the arbitral tribunal. The amendments also mandate that courts must dispose of applications under Section 11 (appointment of arbitrators) within 60 days. A new provision has been introduced to limit the grounds for challenging arbitral awards, with challenges now restricted to cases involving patent illegality. The amendments also introduce provisions for fast-track arbitration for disputes below INR 1 crore. The Bar Council of India has welcomed these amendments, stating that they will further strengthen India\'s position as a hub for international commercial arbitration.',
        source: 'Ministry of Law',
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
        url: 'https://lawmin.gov.in',
        category: 'Legislation',
        importance: 'high'
      },
      {
        id: '5',
        title: 'New Guidelines for Bail Applications',
        summary: 'The Supreme Court has issued comprehensive guidelines for bail applications in cases involving economic offenses, emphasizing proportionality.',
        content: 'The Supreme Court has issued comprehensive new guidelines for bail applications in cases involving economic offenses, with a strong emphasis on the principle of proportionality. The guidelines state that economic offenses should not automatically be treated as more serious than other offenses when considering bail applications. The court emphasized that the nature and gravity of the offense, the likelihood of the accused fleeing, and the possibility of tampering with evidence should be the primary considerations. The guidelines also mandate that courts must consider the accused\'s health, age, and family circumstances when deciding bail applications. For first-time offenders in economic cases, the guidelines suggest a presumption in favor of bail unless there are compelling reasons to the contrary. The guidelines also require detailed reasoning in bail orders, with courts expected to specifically address each ground for and against bail. Legal experts have praised these guidelines for bringing much-needed clarity and consistency to bail jurisprudence.',
        source: 'Supreme Court of India',
        date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 days ago
        url: 'https://supremecourtofindia.nic.in',
        category: 'Criminal Law',
        importance: 'medium'
      }
    ];
    
    // Filter by category if not 'all'
    let filteredNews = mockNews;
    if (selectedCategory !== 'all') {
      filteredNews = mockNews.filter(item => item.category === selectedCategory);
    }
    
    // Sort by date (newest first)
    filteredNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setNews(filteredNews);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/legal-news/categories');
      
      if (response.data.success) {
        setCategories(['all', ...response.data.data]);
      } else {
        // Fallback categories if API fails
        setCategories(['all', 'Supreme Court', 'High Court', 'Legislation', 'Regulations', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Constitutional Law']);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Fallback categories if API fails
      setCategories(['all', 'Supreme Court', 'High Court', 'Legislation', 'Regulations', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Constitutional Law']);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNews(expandedNews === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getImportanceClass = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading legal news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Live Legal News & Updates</h1>
        <p className="text-gray-600">
          Stay informed with the latest legal developments, court rulings, and regulatory changes
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('news')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'news'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Legal News
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bills'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bills & Amendments
          </button>
        </nav>
      </div>

      {activeTab === 'news' ? (
        <>
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* News List */}
          <div className="space-y-6">
            {news.length > 0 ? (
              news.map(item => (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-lg shadow-md p-6 ${getImportanceClass(item.importance)}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">{item.source}</span>
                        <span>{formatDate(item.date)}</span>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                          {item.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.importance === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : item.importance === 'medium' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.importance.charAt(0).toUpperCase() + item.importance.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {expandedNews === item.id ? item.content : item.summary}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      {expandedNews === item.id ? 'Show Less' : 'Read More'}
                    </button>
                    
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      View Full Article →
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No news available for the selected category.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Bills & Amendments Tab */
        <BillsAndAmendments />
      )}
    </div>
  );
};

export default LegalNews;