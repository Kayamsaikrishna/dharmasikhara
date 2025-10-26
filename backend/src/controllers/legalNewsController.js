const axios = require('axios');

// Mock legal news data with current dates for demonstration
// In a real implementation, this would come from external APIs or RSS feeds
const mockLegalNews = [
  {
    id: 1,
    title: "Supreme Court Rules on Digital Evidence Admissibility",
    summary: "The Supreme Court has issued new guidelines on the admissibility of digital evidence in criminal proceedings, emphasizing the need for proper chain of custody.",
    content: "In a landmark judgment delivered today, the Supreme Court of India has laid down comprehensive guidelines regarding the admissibility of digital evidence in criminal proceedings. The court emphasized the critical importance of maintaining a proper chain of custody for digital evidence to ensure its integrity and authenticity. The judgment comes at a time when digital evidence is increasingly becoming crucial in criminal investigations. The court noted that with the proliferation of digital devices and the ease with which digital data can be manipulated, stringent safeguards are necessary to prevent misuse. The guidelines require law enforcement agencies to maintain detailed logs of digital evidence handling, including timestamps of access and details of personnel involved. The judgment also mandates that digital evidence be stored in secure environments with restricted access. Legal experts have hailed the judgment as a significant step towards ensuring fair trials in the digital age.",
    category: "Supreme Court",
    date: new Date().toISOString().split('T')[0], // Current date
    source: "Supreme Court of India",
    url: "https://supremecourtofindia.nic.in",
    importance: "high"
  },
  {
    id: 2,
    title: "New Cybersecurity Regulations for Legal Firms",
    summary: "The Ministry of Electronics and Information Technology has released new cybersecurity guidelines specifically for legal practitioners handling sensitive client data.",
    content: "The Ministry of Electronics and Information Technology (MeitY) has announced new cybersecurity regulations that will come into effect from January 2024. These regulations are specifically designed for legal firms and practitioners who handle sensitive client data. The new guidelines mandate that all legal firms implement multi-factor authentication for accessing client data, encrypt all stored data, and conduct regular security audits. The regulations also require firms to appoint a dedicated Data Protection Officer (DPO) who will be responsible for ensuring compliance. Legal firms with more than 50 employees must undergo annual third-party security assessments. The regulations also introduce strict penalties for data breaches, with fines of up to 2% of annual turnover or INR 5 crores, whichever is higher. The Bar Council of India has welcomed these regulations, stating that they will significantly enhance client data protection in the legal profession.",
    category: "Regulations",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    source: "MeitY",
    url: "https://meity.gov.in",
    importance: "medium"
  },
  {
    id: 3,
    title: "Landmark Judgment on Environmental Law",
    summary: "The National Green Tribunal has delivered a significant judgment on industrial pollution control, setting new precedents for environmental litigation.",
    content: "The National Green Tribunal (NGT) has delivered a groundbreaking judgment in a case related to industrial pollution control in the National Capital Region. The judgment establishes new precedents for determining liability in environmental damage cases and introduces a comprehensive framework for calculating compensation. The tribunal has mandated that all industries within a 10-kilometer radius of ecologically sensitive areas must conduct quarterly environmental impact assessments. The judgment also introduces the concept of \"extended producer responsibility\" for industries, requiring them to take responsibility for the entire lifecycle of their products. The tribunal has imposed strict penalties on industries found violating environmental norms, with compensation calculated based on the extent of environmental damage caused. Environmental law experts have described the judgment as a turning point in India's approach to environmental protection and corporate accountability.",
    category: "Environmental Law",
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    source: "NGT",
    url: "https://ngt.nic.in",
    importance: "high"
  },
  {
    id: 4,
    title: "Amendments to the Arbitration and Conciliation Act",
    summary: "The Parliament has passed amendments to the Arbitration and Conciliation Act to expedite dispute resolution and reduce court backlog.",
    content: "The Parliament has passed significant amendments to the Arbitration and Conciliation Act, 1996, aimed at further expediting dispute resolution and reducing the backlog of cases in Indian courts. The amendments introduce a new provision for emergency arbitrators, allowing parties to seek urgent interim measures even before the constitution of the arbitral tribunal. The amendments also mandate that courts must dispose of applications under Section 11 (appointment of arbitrators) within 60 days. A new provision has been introduced to limit the grounds for challenging arbitral awards, with challenges now restricted to cases involving patent illegality. The amendments also introduce provisions for fast-track arbitration for disputes below INR 1 crore. The Bar Council of India has welcomed these amendments, stating that they will further strengthen India's position as a hub for international commercial arbitration.",
    category: "Legislation",
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
    source: "Ministry of Law",
    url: "https://lawmin.gov.in",
    importance: "high"
  },
  {
    id: 5,
    title: "New Guidelines for Bail Applications",
    summary: "The Supreme Court has issued comprehensive guidelines for bail applications in cases involving economic offenses, emphasizing proportionality.",
    content: "The Supreme Court has issued comprehensive new guidelines for bail applications in cases involving economic offenses, with a strong emphasis on the principle of proportionality. The guidelines state that economic offenses should not automatically be treated as more serious than other offenses when considering bail applications. The court emphasized that the nature and gravity of the offense, the likelihood of the accused fleeing, and the possibility of tampering with evidence should be the primary considerations. The guidelines also mandate that courts must consider the accused's health, age, and family circumstances when deciding bail applications. For first-time offenders in economic cases, the guidelines suggest a presumption in favor of bail unless there are compelling reasons to the contrary. The guidelines also require detailed reasoning in bail orders, with courts expected to specifically address each ground for and against bail. Legal experts have praised these guidelines for bringing much-needed clarity and consistency to bail jurisprudence.",
    category: "Criminal Law",
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 days ago
    source: "Supreme Court of India",
    url: "https://supremecourtofindia.nic.in",
    importance: "medium"
  }
];

// Function to fetch real legal news from external sources
// This simulates real-time fetching with current dates
const fetchRealLegalNews = async () => {
  try {
    // In a real implementation, we would fetch from actual legal news APIs
    // Example of how you could integrate with a real API:
    /*
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'legal OR court OR law OR judiciary',
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: process.env.NEWS_API_KEY
      }
    });
    
    // Transform the API response to match our data structure
    const transformedNews = response.data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title,
      summary: article.description,
      content: article.content,
      category: determineCategory(article.title, article.description),
      date: article.publishedAt.split('T')[0],
      source: article.source.name,
      url: article.url,
      importance: determineImportance(article.title, article.description)
    }));
    
    return transformedNews;
    */
    
    // For demonstration, we'll return mock data with current timestamps
    const currentDate = new Date();
    const updatedNews = mockLegalNews.map((news, index) => ({
      ...news,
      date: new Date(currentDate.getTime() - (index * 86400000)).toISOString().split('T')[0]
    }));
    
    return updatedNews;
  } catch (error) {
    console.error('Error fetching legal news:', error);
    // Return mock data as fallback
    return mockLegalNews;
  }
};

// Helper function to determine category based on content (for real API integration)
const determineCategory = (title, description) => {
  const content = (title + ' ' + description).toLowerCase();
  
  if (content.includes('supreme court') || content.includes('high court')) {
    return 'Court Rulings';
  } else if (content.includes('act') || content.includes('bill') || content.includes('legislation')) {
    return 'Legislation';
  } else if (content.includes('regulation') || content.includes('policy')) {
    return 'Regulations';
  } else if (content.includes('cyber') || content.includes('data') || content.includes('privacy')) {
    return 'Technology Law';
  } else if (content.includes('criminal') || content.includes('crime') || content.includes('police')) {
    return 'Criminal Law';
  } else if (content.includes('civil') || content.includes('contract') || content.includes('property')) {
    return 'Civil Law';
  } else if (content.includes('corporate') || content.includes('company') || content.includes('business')) {
    return 'Corporate Law';
  } else if (content.includes('constitutional') || content.includes('fundamental rights')) {
    return 'Constitutional Law';
  } else {
    return 'General Legal News';
  }
};

// Helper function to determine importance based on content (for real API integration)
const determineImportance = (title, description) => {
  const content = (title + ' ' + description).toLowerCase();
  
  // High importance keywords
  const highImportanceKeywords = [
    'supreme court', 'landmark', 'ruling', 'amendment', 'act', 'bill', 
    'regulation', 'cybersecurity', 'data protection', 'environmental law'
  ];
  
  // Medium importance keywords
  const mediumImportanceKeywords = [
    'court', 'judgment', 'policy', 'guideline', 'directive', 'order',
    'criminal', 'civil', 'corporate', 'constitutional'
  ];
  
  // Check for high importance keywords
  if (highImportanceKeywords.some(keyword => content.includes(keyword))) {
    return 'high';
  }
  
  // Check for medium importance keywords
  if (mediumImportanceKeywords.some(keyword => content.includes(keyword))) {
    return 'medium';
  }
  
  // Default to low importance
  return 'low';
};

// Get latest legal news
const getLegalNews = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    // Fetch legal news
    const news = await fetchRealLegalNews();
    
    // Filter by category if specified
    let filteredNews = news;
    if (category && category !== 'all') {
      filteredNews = news.filter(newsItem => 
        newsItem.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Sort by date (newest first)
    filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit results
    const limitedNews = filteredNews.slice(0, parseInt(limit));
    
    return res.json({
      success: true,
      data: limitedNews,
      total: filteredNews.length
    });
  } catch (error) {
    console.error('Error in getLegalNews:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch legal news'
    });
  }
};

// Get legal news by ID
const getLegalNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch legal news
    const news = await fetchRealLegalNews();
    
    // Find news by ID
    const newsItem = news.find(n => n.id === parseInt(id));
    
    if (!newsItem) {
      return res.status(404).json({
        success: false,
        error: 'Legal news not found'
      });
    }
    
    return res.json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    console.error('Error in getLegalNewsById:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch legal news'
    });
  }
};

// Search legal news
const searchLegalNews = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // Fetch legal news
    const news = await fetchRealLegalNews();
    
    // Filter by category if specified
    let filteredNews = news;
    if (category && category !== 'all') {
      filteredNews = news.filter(newsItem => 
        newsItem.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Search by query in title and summary
    const searchResults = filteredNews.filter(newsItem => 
      newsItem.title.toLowerCase().includes(query.toLowerCase()) ||
      newsItem.summary.toLowerCase().includes(query.toLowerCase()) ||
      newsItem.content.toLowerCase().includes(query.toLowerCase())
    );
    
    // Sort by relevance (in a real implementation, we would use a proper search engine)
    searchResults.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const aSummaryMatch = a.summary.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const aContentMatch = a.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bSummaryMatch = b.summary.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bContentMatch = b.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      
      const aScore = aTitleMatch * 3 + aSummaryMatch * 2 + aContentMatch;
      const bScore = bTitleMatch * 3 + bSummaryMatch * 2 + bContentMatch;
      
      return bScore - aScore;
    });
    
    return res.json({
      success: true,
      data: searchResults,
      total: searchResults.length
    });
  } catch (error) {
    console.error('Error in searchLegalNews:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search legal news'
    });
  }
};

// Get legal news categories
const getLegalNewsCategories = async (req, res) => {
  try {
    // Fetch legal news
    const news = await fetchRealLegalNews();
    
    // Extract unique categories
    const categories = [...new Set(news.map(newsItem => newsItem.category))];
    
    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in getLegalNewsCategories:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch legal news categories'
    });
  }
};

module.exports = {
  getLegalNews,
  getLegalNewsById,
  searchLegalNews,
  getLegalNewsCategories
};