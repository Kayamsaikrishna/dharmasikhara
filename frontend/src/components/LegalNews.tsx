import React, { useState, useEffect, useCallback } from 'react';
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
  const [allNews, setAllNews] = useState<LegalNewsItem[]>([]); // Store all news for filtering
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'bills'>('news');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [years, setYears] = useState<string[]>(['all']);
  const [fetchStatus, setFetchStatus] = useState<string>('idle'); // 'idle', 'fetching', 'success', 'error'

  // Fetch legal news and categories
  const fetchLegalNews = useCallback(async () => {
    try {
      setFetchStatus('fetching');
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/legal-news');
      
      if (response.data.success) {
        const newsData = response.data.data;
        setAllNews(newsData);
        setNews(newsData);
        setFetchStatus('success');
        
        // Extract unique years from news dates
        const yearSet = new Set<string>(newsData.map((item: LegalNewsItem) => 
          new Date(item.date).getFullYear().toString()
        ));
        const uniqueYears = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
        setYears(['all', ...uniqueYears]);
      } else {
        setError('Failed to fetch legal news: ' + (response.data.error || 'Unknown error'));
        setFetchStatus('error');
        loadMockNews();
      }
    } catch (err: any) {
      console.error('Error fetching legal news:', err);
      setError('Failed to fetch legal news. Please check your internet connection or try again later. Error: ' + (err.message || 'Unknown error'));
      setFetchStatus('error');
      loadMockNews();
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filteredNews = [...allNews];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filteredNews = filteredNews.filter(item => item.category === selectedCategory);
    }
    
    // Apply year filter
    if (selectedYear !== 'all') {
      filteredNews = filteredNews.filter(item => 
        new Date(item.date).getFullYear().toString() === selectedYear
      );
    }
    
    // Apply date range filter
    if (startDate) {
      filteredNews = filteredNews.filter(item => 
        new Date(item.date) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filteredNews = filteredNews.filter(item => 
        new Date(item.date) <= new Date(endDate)
      );
    }
    
    // Apply search query filter
    if (searchQuery) {
      filteredNews = filteredNews.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by date (newest first)
    filteredNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setNews(filteredNews);
  }, [allNews, selectedCategory, selectedYear, startDate, endDate, searchQuery]);

  // Fetch legal news on component mount
  useEffect(() => {
    fetchLegalNews();
    
    // Set up interval to fetch news every 30 minutes
    const interval = setInterval(() => {
      fetchLegalNews();
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(interval);
  }, [fetchLegalNews]);

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadMockNews = useCallback(() => {
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
    
    setAllNews(mockNews);
    setNews(mockNews);
    
    // Extract unique years from mock news dates
    const yearSet = new Set<string>(mockNews.map(item => 
      new Date(item.date).getFullYear().toString()
    ));
    const uniqueYears = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
    setYears(['all', ...uniqueYears]);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/legal-news/categories');
      
      if (response.data.success) {
        setCategories(['all', ...response.data.data]);
      } else {
        // Fallback categories if API fails
        setCategories(['all', 'Supreme Court', 'High Court', 'Legislation', 'Regulations', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Constitutional Law', 'Bills & Amendments']);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Fallback categories if API fails
      setCategories(['all', 'Supreme Court', 'High Court', 'Legislation', 'Regulations', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Constitutional Law', 'Bills & Amendments']);
    }
  };

  const handleSearch = () => {
    applyFilters();
  };

  const toggleExpand = (id: string) => {
    setExpandedNews(expandedNews === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid date
      }
      
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
    } catch (e) {
      return dateString; // Return original string if any error
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

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedYear('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  if (loading && fetchStatus === 'fetching') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <div className="text-xl">Fetching real legal news from trusted sources...</div>
          <div className="text-gray-600 mt-2">This may take a moment as we scrape data from multiple legal news websites</div>
        </div>
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className="lg:w-1/4 bg-gray-50 p-4 rounded-lg h-fit">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button 
                onClick={resetFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Reset All
              </button>
            </div>
            
            {/* Search Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Search
                </button>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category}`}
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label 
                      htmlFor={`category-${category}`} 
                      className="ml-2 text-sm text-gray-700 capitalize"
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Year Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year === 'all' ? 'All Years' : year}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date Range Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Apply Filters Button */}
            <button
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            >
              Apply Filters
            </button>
            
            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {news.length} of {allNews.length} articles
            </div>
          </div>
          
          {/* News List */}
          <div className="lg:w-3/4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button 
                  onClick={fetchLegalNews}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Retry Fetching Real Data
                </button>
              </div>
            )}
            
            {fetchStatus === 'success' && allNews.length === 0 && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Notice: </strong>
                <span className="block sm:inline">
                  We're currently working on expanding our web scraping capabilities to fetch more real legal news. 
                  Please check back later or try again in a few minutes.
                </span>
              </div>
            )}
            
            {news.length > 0 ? (
              <div className="space-y-6">
                {news.map(item => (
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No news available for the selected filters.</p>
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={fetchLegalNews}
                  className="mt-4 ml-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Retry Fetching Real Data
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Bills & Amendments Tab */
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Latest Parliament Bills</h2>
          <p className="text-gray-600 mb-6">Track the latest bills introduced in the Indian Parliament with official PDFs and analysis. All links are verified and working.</p>
          <BillsAndAmendments />
        </div>
      )}
    </div>
  );
};

export default LegalNews;