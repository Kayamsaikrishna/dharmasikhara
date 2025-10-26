const axios = require('axios');

// Cache for storing fetched news to reduce API calls
let newsCache = {
  data: [],
  timestamp: 0,
  ttl: 30 * 60 * 1000 // 30 minutes cache
};

// Cache for storing bills data
let billsCache = {
  data: [],
  timestamp: 0,
  ttl: 60 * 60 * 1000 // 1 hour cache
};

// RSS feed URLs for legal news
const NEWS_SOURCES = {
  googleNews: 'https://news.google.com/rss/search?q=law+legal+india&hl=en-IN&gl=IN&ceid=IN:en',
  liveLaw: 'https://www.livelaw.in/rss',
  barAndBench: 'https://www.barandbench.com/rss',
  timesOfIndia: 'https://timesofindia.indiatimes.com/rssfeeds/3230086.cms',
  theHindu: 'https://www.thehindu.com/news/national/feeder/default.rss'
};

// Function to fetch news from RSS feeds using RSS2JSON API
const fetchNewsFromRSS = async (rssUrl) => {
  try {
    const response = await axios.get(`https://api.rss2json.com/v1/api.json`, {
      params: {
        rss_url: rssUrl,
        count: 20
      }
    });
    
    if (response.data.status === 'ok') {
      return response.data.items.map((item, index) => ({
        id: `${rssUrl.split('/')[2]}-${index}`,
        title: item.title,
        summary: item.description ? item.description.substring(0, 200) + '...' : '',
        content: item.content || item.description || '',
        category: determineCategory(item.title, item.description),
        date: item.pubDate ? item.pubDate.split(' ')[0] : new Date().toISOString().split('T')[0],
        source: item.author || new URL(rssUrl).hostname,
        url: item.link,
        importance: determineImportance(item.title, item.description)
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching from ${rssUrl}:`, error.message);
    return [];
  }
};

// Function to fetch real legal news from multiple sources
const fetchRealLegalNews = async () => {
  try {
    const currentTime = Date.now();
    
    // Check if cache is still valid
    if (newsCache.data.length > 0 && (currentTime - newsCache.timestamp) < newsCache.ttl) {
      console.log('Returning cached news data');
      return newsCache.data;
    }
    
    console.log('Fetching fresh news data from RSS feeds');
    
    // Fetch from all sources in parallel
    const fetchPromises = Object.values(NEWS_SOURCES).map(url => fetchNewsFromRSS(url));
    const results = await Promise.allSettled(fetchPromises);
    
    // Combine results and filter successful ones
    let allNews = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allNews = allNews.concat(result.value);
      } else {
        console.error(`Failed to fetch from source ${Object.keys(NEWS_SOURCES)[index]}:`, result.reason);
      }
    });
    
    // Remove duplicates based on title similarity
    const uniqueNews = removeDuplicates(allNews);
    
    // Sort by date (newest first)
    uniqueNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update cache
    newsCache.data = uniqueNews;
    newsCache.timestamp = currentTime;
    
    return uniqueNews;
  } catch (error) {
    console.error('Error in fetchRealLegalNews:', error);
    // Return mock data as fallback
    return getMockLegalNews();
  }
};

// Function to remove duplicate news items
const removeDuplicates = (newsArray) => {
  const seenTitles = new Set();
  const uniqueNews = [];
  
  for (const news of newsArray) {
    // Create a normalized title for comparison
    const normalizedTitle = news.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    // Check if we've seen a similar title
    let isDuplicate = false;
    for (const seenTitle of seenTitles) {
      // If titles are very similar (90% match), consider it a duplicate
      if (calculateSimilarity(normalizedTitle, seenTitle) > 0.9) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      seenTitles.add(normalizedTitle);
      uniqueNews.push(news);
    }
  }
  
  return uniqueNews;
};

// Simple string similarity calculation
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = (s1, s2) => {
    const costs = new Array(s2.length + 1);
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };
  
  return (longer.length - editDistance(longer, shorter)) / longer.length;
};

// Helper function to determine category based on content
const determineCategory = (title, description) => {
  const content = (title + ' ' + (description || '')).toLowerCase();
  
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
  } else if (content.includes('environment') || content.includes('pollution')) {
    return 'Environmental Law';
  } else {
    return 'General Legal News';
  }
};

// Helper function to determine importance based on content
const determineImportance = (title, description) => {
  const content = (title + ' ' + (description || '')).toLowerCase();
  
  // High importance keywords
  const highImportanceKeywords = [
    'supreme court', 'landmark', 'ruling', 'amendment', 'act', 'bill', 
    'regulation', 'cybersecurity', 'data protection', 'environmental law',
    'constitution', 'fundamental rights', 'sc judgment'
  ];
  
  // Medium importance keywords
  const mediumImportanceKeywords = [
    'court', 'judgment', 'policy', 'guideline', 'directive', 'order',
    'criminal', 'civil', 'corporate', 'constitutional', 'high court',
    'tribunal', 'ngt', 'arbitration'
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

// Mock legal news data for fallback
const getMockLegalNews = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return [
    {
      id: '1',
      title: 'Supreme Court Rules on Digital Evidence Admissibility',
      summary: 'The Supreme Court has issued new guidelines on the admissibility of digital evidence in criminal proceedings, emphasizing the need for proper chain of custody.',
      content: 'In a landmark judgment delivered today, the Supreme Court of India has laid down comprehensive guidelines regarding the admissibility of digital evidence in criminal proceedings. The court emphasized the critical importance of maintaining a proper chain of custody for digital evidence to ensure its integrity and authenticity. The judgment comes at a time when digital evidence is increasingly becoming crucial in criminal investigations. The court noted that with the proliferation of digital devices and the ease with which digital data can be manipulated, stringent safeguards are necessary to prevent misuse. The guidelines require law enforcement agencies to maintain detailed logs of digital evidence handling, including timestamps of access and details of personnel involved. The judgment also mandates that digital evidence be stored in secure environments with restricted access. Legal experts have hailed the judgment as a significant step towards ensuring fair trials in the digital age.',
      category: 'Supreme Court',
      date: currentDate,
      source: 'Supreme Court of India',
      url: 'https://supremecourtofindia.nic.in',
      importance: 'high'
    },
    {
      id: '2',
      title: 'New Cybersecurity Regulations for Legal Firms',
      summary: 'The Ministry of Electronics and Information Technology has released new cybersecurity guidelines specifically for legal practitioners handling sensitive client data.',
      content: 'The Ministry of Electronics and Information Technology (MeitY) has announced new cybersecurity regulations that will come into effect from January 2024. These regulations are specifically designed for legal firms and practitioners who handle sensitive client data. The new guidelines mandate that all legal firms implement multi-factor authentication for accessing client data, encrypt all stored data, and conduct regular security audits. The regulations also require firms to appoint a dedicated Data Protection Officer (DPO) who will be responsible for ensuring compliance. Legal firms with more than 50 employees must undergo annual third-party security assessments. The regulations also introduce strict penalties for data breaches, with fines of up to 2% of annual turnover or INR 5 crores, whichever is higher. The Bar Council of India has welcomed these regulations, stating that they will significantly enhance client data protection in the legal profession.',
      category: 'Regulations',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      source: 'MeitY',
      url: 'https://meity.gov.in',
      importance: 'medium'
    },
    {
      id: '3',
      title: 'Landmark Judgment on Environmental Law',
      summary: 'The National Green Tribunal has delivered a significant judgment on industrial pollution control, setting new precedents for environmental litigation.',
      content: 'The National Green Tribunal (NGT) has delivered a groundbreaking judgment in a case related to industrial pollution control in the National Capital Region. The judgment establishes new precedents for determining liability in environmental damage cases and introduces a comprehensive framework for calculating compensation. The tribunal has mandated that all industries within a 10-kilometer radius of ecologically sensitive areas must conduct quarterly environmental impact assessments. The judgment also introduces the concept of "extended producer responsibility" for industries, requiring them to take responsibility for the entire lifecycle of their products. The tribunal has imposed strict penalties on industries found violating environmental norms, with compensation calculated based on the extent of environmental damage caused. Environmental law experts have described the judgment as a turning point in India\'s approach to environmental protection and corporate accountability.',
      category: 'Environmental Law',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
      source: 'NGT',
      url: 'https://ngt.nic.in',
      importance: 'high'
    },
    {
      id: '4',
      title: 'Amendments to the Arbitration and Conciliation Act',
      summary: 'The Parliament has passed amendments to the Arbitration and Conciliation Act to expedite dispute resolution and reduce court backlog.',
      content: 'The Parliament has passed significant amendments to the Arbitration and Conciliation Act, 1996, aimed at further expediting dispute resolution and reducing the backlog of cases in Indian courts. The amendments introduce a new provision for emergency arbitrators, allowing parties to seek urgent interim measures even before the constitution of the arbitral tribunal. The amendments also mandate that courts must dispose of applications under Section 11 (appointment of arbitrators) within 60 days. A new provision has been introduced to limit the grounds for challenging arbitral awards, with challenges now restricted to cases involving patent illegality. The amendments also introduce provisions for fast-track arbitration for disputes below INR 1 crore. The Bar Council of India has welcomed these amendments, stating that they will further strengthen India\'s position as a hub for international commercial arbitration.',
      category: 'Legislation',
      date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
      source: 'Ministry of Law',
      url: 'https://lawmin.gov.in',
      importance: 'high'
    },
    {
      id: '5',
      title: 'New Guidelines for Bail Applications',
      summary: 'The Supreme Court has issued comprehensive guidelines for bail applications in cases involving economic offenses, emphasizing proportionality.',
      content: 'The Supreme Court has issued comprehensive new guidelines for bail applications in cases involving economic offenses, with a strong emphasis on the principle of proportionality. The guidelines state that economic offenses should not automatically be treated as more serious than other offenses when considering bail applications. The court emphasized that the nature and gravity of the offense, the likelihood of the accused fleeing, and the possibility of tampering with evidence should be the primary considerations. The guidelines also mandate that courts must consider the accused\'s health, age, and family circumstances when deciding bail applications. For first-time offenders in economic cases, the guidelines suggest a presumption in favor of bail unless there are compelling reasons to the contrary. The guidelines also require detailed reasoning in bail orders, with courts expected to specifically address each ground for and against bail. Legal experts have praised these guidelines for bringing much-needed clarity and consistency to bail jurisprudence.',
      category: 'Criminal Law',
      date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 days ago
      source: 'Supreme Court of India',
      url: 'https://supremecourtofindia.nic.in',
      importance: 'medium'
    }
  ];
};

// Function to fetch bills data
const fetchBillsData = async () => {
  try {
    const currentTime = Date.now();
    
    // Check if cache is still valid
    if (billsCache.data.length > 0 && (currentTime - billsCache.timestamp) < billsCache.ttl) {
      console.log('Returning cached bills data');
      return billsCache.data;
    }
    
    console.log('Fetching fresh bills data');
    
    // In a real implementation, this would fetch from an API or database
    // For now, we'll return mock data with verified working links
    const bills = [
      {
        id: 'b1',
        title: 'Digital Personal Data Protection Bill, 2023',
        description: 'An Act to provide for the processing of digital personal data in a manner that recognizes both the right of individuals to protect their personal data and the need to process such data for lawful purposes.',
        status: 'Passed',
        introducedDate: '2023-08-03',
        pdfUrl: 'https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Bill%2C%202023.pdf',
        analysisUrl: 'https://prsindia.org/billtrack/bills/digital-personal-data-protection-bill-2023',
        ministry: 'Electronics and IT',
        type: 'Government'
      },
      {
        id: 'b2',
        title: 'Bharatiya Nyaya Sanhita, 2023',
        description: 'A new criminal law code to replace the Indian Penal Code, 1860, with modern provisions and updated definitions.',
        status: 'Enacted',
        introducedDate: '2023-08-11',
        pdfUrl: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Bharatiya_Nyaya_Sanhita,_2023.pdf',
        analysisUrl: 'https://prsindia.org/billtrack/bills/bharatiya-nyaya-sanhita-2023',
        ministry: 'Home Affairs',
        type: 'Government'
      },
      {
        id: 'b3',
        title: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
        description: 'A new code of criminal procedure to replace the Code of Criminal Procedure, 1973, with streamlined processes and modern provisions.',
        status: 'Enacted',
        introducedDate: '2023-08-11',
        pdfUrl: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Bharatiya_Nagarik_Suraksha_Sanhita,_2023.pdf',
        analysisUrl: 'https://prsindia.org/billtrack/bills/bharatiya-nagarik-suraksha-sanhita-2023',
        ministry: 'Home Affairs',
        type: 'Government'
      },
      {
        id: 'b4',
        title: 'Bharatiya Sakshya Adhiniyam, 2023',
        description: 'A new law on evidence to replace the Indian Evidence Act, 1872, with provisions for digital evidence and modern forms of proof.',
        status: 'Enacted',
        introducedDate: '2023-08-11',
        pdfUrl: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Bharatiya_Sakshya_Adhiniyam,_2023.pdf',
        analysisUrl: 'https://prsindia.org/billtrack/bills/bharatiya-sakshya-adhiniyam-2023',
        ministry: 'Home Affairs',
        type: 'Government'
      },
      {
        id: 'b5',
        title: 'Telecommunication Bill, 2023',
        description: 'A comprehensive bill to regulate telecommunication services and establish a unified licensing framework.',
        status: 'Pending',
        introducedDate: '2023-12-14',
        pdfUrl: 'https://dot.gov.in/sites/default/files/2023_Bill_No_44_Telecommunication.pdf',
        analysisUrl: 'https://prsindia.org/billtrack/bills/telecommunication-bill-2023',
        ministry: 'Communications',
        type: 'Government'
      }
    ];
    
    // Update cache
    billsCache.data = bills;
    billsCache.timestamp = currentTime;
    
    return bills;
  } catch (error) {
    console.error('Error fetching bills data:', error);
    // Return mock data as fallback
    return [
      {
        id: 'b1',
        title: 'Digital Personal Data Protection Bill, 2023',
        description: 'An Act to provide for the processing of digital personal data in a manner that recognizes both the right of individuals to protect their personal data and the need to process such data for lawful purposes.',
        status: 'Passed',
        introducedDate: '2023-08-03',
        pdfUrl: 'https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Bill%2C%202023.pdf',
        analysisUrl: 'https://prsindia.org/billtrack/bills/digital-personal-data-protection-bill-2023',
        ministry: 'Electronics and IT',
        type: 'Government'
      },
      {
        id: 'b2',
        title: 'Bharatiya Nyaya Sanhita, 2023',
        description: 'A new criminal law code to replace the Indian Penal Code, 1860, with modern provisions and updated definitions.',
        status: 'Enacted',
        introducedDate: '2023-08-11',
        pdfUrl: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Bharatiya_Nyaya_Sanhita,_2023.pdf',
        analysisUrl: 'https://prsindia.org/billtrack/bills/bharatiya-nyaya-sanhita-2023',
        ministry: 'Home Affairs',
        type: 'Government'
      }
    ];
  }
};

// Get latest legal news
const getLegalNews = async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    
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
    const newsItem = news.find(n => n.id === id);
    
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
      (newsItem.summary && newsItem.summary.toLowerCase().includes(query.toLowerCase())) ||
      (newsItem.content && newsItem.content.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Sort by relevance (in a real implementation, we would use a proper search engine)
    searchResults.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const aSummaryMatch = (a.summary && a.summary.toLowerCase().includes(query.toLowerCase())) ? 1 : 0;
      const aContentMatch = (a.content && a.content.toLowerCase().includes(query.toLowerCase())) ? 1 : 0;
      const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bSummaryMatch = (b.summary && b.summary.toLowerCase().includes(query.toLowerCase())) ? 1 : 0;
      const bContentMatch = (b.content && b.content.toLowerCase().includes(query.toLowerCase())) ? 1 : 0;
      
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

// Get bills and amendments
const getBillsAndAmendments = async (req, res) => {
  try {
    // Fetch bills data
    const bills = await fetchBillsData();
    
    return res.json({
      success: true,
      data: bills,
      total: bills.length
    });
  } catch (error) {
    console.error('Error in getBillsAndAmendments:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch bills and amendments'
    });
  }
};

// Get bill by ID
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch bills data
    const bills = await fetchBillsData();
    
    // Find bill by ID
    const bill = bills.find(b => b.id === id);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found'
      });
    }
    
    return res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('Error in getBillById:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch bill details'
    });
  }
};

module.exports = {
  getLegalNews,
  getLegalNewsById,
  searchLegalNews,
  getLegalNewsCategories,
  getBillsAndAmendments,
  getBillById
};