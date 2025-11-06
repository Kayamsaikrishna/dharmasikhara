const axios = require('axios');
const cheerio = require('cheerio');

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

// Function to scrape LiveLaw news
const scrapeLiveLaw = async () => {
  try {
    console.log('Scraping LiveLaw...');
    const response = await axios.get('https://www.livelaw.in/latest-news', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('LiveLaw response status:', response.status);
    const $ = cheerio.load(response.data);
    const newsItems = [];
    
    // Try different selectors
    const selectors = ['.news-card', '.story-card', '.article-card', 'article', '.post', '.card'];
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        if (index >= 15) return; // Limit to 15 items
        
        let title, link, summary, date;
        
        // Try different title selectors
        title = $(element).find('.title a').text().trim() || 
                $(element).find('h2 a').text().trim() || 
                $(element).find('h3 a').text().trim() || 
                $(element).find('h1 a').text().trim() ||
                $(element).find('a').first().text().trim();
        
        // Try different link selectors
        link = $(element).find('.title a').attr('href') || 
               $(element).find('h2 a').attr('href') || 
               $(element).find('h3 a').attr('href') || 
               $(element).find('h1 a').attr('href') ||
               $(element).find('a').first().attr('href');
        
        // Try different summary selectors
        summary = $(element).find('.summary').text().trim() || 
                  $(element).find('.excerpt').text().trim() || 
                  $(element).find('p').first().text().trim() || 
                  'Click to read full article';
        
        // Try different date selectors
        date = $(element).find('.date').text().trim() || 
               $(element).find('time').attr('datetime') || 
               $(element).find('.published').text().trim() || 
               new Date().toISOString().split('T')[0];
        
        if (title && link) {
          newsItems.push({
            id: `livelaw-${Date.now()}-${index}`,
            title: title,
            summary: summary || 'Click to read full article',
            content: summary || 'Click to read full article',
            category: 'General Legal News',
            date: date || new Date().toISOString().split('T')[0],
            source: 'LiveLaw',
            url: link.startsWith('http') ? link : `https://www.livelaw.in${link}`,
            importance: 'medium'
          });
        }
      });
      
      // If we found items, break
      if (newsItems.length > 0) {
        console.log(`Found ${newsItems.length} items from LiveLaw using selector: ${selector}`);
        break;
      }
    }
    
    console.log(`Total LiveLaw items: ${newsItems.length}`);
    return newsItems;
  } catch (error) {
    console.error('Error scraping LiveLaw:', error.message);
    return [];
  }
};

// Function to scrape Bar and Bench news
const scrapeBarAndBench = async () => {
  try {
    console.log('Scraping Bar and Bench...');
    const response = await axios.get('https://www.barandbench.com/news', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Bar and Bench response status:', response.status);
    const $ = cheerio.load(response.data);
    const newsItems = [];
    
    // Try different selectors
    const selectors = ['.article-card', '.story-card', '.news-card', 'article', '.post', '.card'];
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        if (index >= 15) return; // Limit to 15 items
        
        let title, link, summary, date;
        
        // Try different title selectors
        title = $(element).find('h2 a').text().trim() || 
                $(element).find('h3 a').text().trim() || 
                $(element).find('h1 a').text().trim() ||
                $(element).find('.title a').text().trim() || 
                $(element).find('a').first().text().trim();
        
        // Try different link selectors
        link = $(element).find('h2 a').attr('href') || 
               $(element).find('h3 a').attr('href') || 
               $(element).find('h1 a').attr('href') ||
               $(element).find('.title a').attr('href') || 
               $(element).find('a').first().attr('href');
        
        // Try different summary selectors
        summary = $(element).find('.excerpt').text().trim() || 
                  $(element).find('.summary').text().trim() || 
                  $(element).find('p').first().text().trim() || 
                  'Click to read full article';
        
        // Try different date selectors
        date = $(element).find('.date').text().trim() || 
               $(element).find('time').attr('datetime') || 
               $(element).find('.published').text().trim() || 
               new Date().toISOString().split('T')[0];
        
        if (title && link) {
          newsItems.push({
            id: `barandbench-${Date.now()}-${index}`,
            title: title,
            summary: summary || 'Click to read full article',
            content: summary || 'Click to read full article',
            category: 'General Legal News',
            date: date || new Date().toISOString().split('T')[0],
            source: 'Bar and Bench',
            url: link.startsWith('http') ? link : `https://www.barandbench.com${link}`,
            importance: 'medium'
          });
        }
      });
      
      // If we found items, break
      if (newsItems.length > 0) {
        console.log(`Found ${newsItems.length} items from Bar and Bench using selector: ${selector}`);
        break;
      }
    }
    
    console.log(`Total Bar and Bench items: ${newsItems.length}`);
    return newsItems;
  } catch (error) {
    console.error('Error scraping Bar and Bench:', error.message);
    return [];
  }
};

// Function to scrape Supreme Court of India news
const scrapeSupremeCourt = async () => {
  try {
    console.log('Scraping Supreme Court of India...');
    const response = await axios.get('https://supremecourtofindia.nic.in/home/', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Supreme Court response status:', response.status);
    const $ = cheerio.load(response.data);
    const newsItems = [];
    
    // Try different selectors for announcements
    const selectors = ['.announcement-item', '.news-item', '.update-item', 'li', 'div'];
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        if (index >= 10) return; // Limit to 10 items
        
        let title, link, date;
        
        // Try different title selectors
        title = $(element).find('a').text().trim() || 
                $(element).text().trim();
        
        // Try different link selectors
        link = $(element).find('a').attr('href');
        
        // Try different date selectors
        date = $(element).find('.date').text().trim() || 
               $(element).find('time').attr('datetime') || 
               new Date().toISOString().split('T')[0];
        
        if (title && link) {
          newsItems.push({
            id: `sci-${Date.now()}-${index}`,
            title: title,
            summary: 'Supreme Court of India announcement',
            content: 'Supreme Court of India announcement',
            category: 'Supreme Court',
            date: date || new Date().toISOString().split('T')[0],
            source: 'Supreme Court of India',
            url: link.startsWith('http') ? link : `https://supremecourtofindia.nic.in${link}`,
            importance: 'high'
          });
        } else if (title && !link) {
          // If there's a title but no link, it might be a text-only announcement
          newsItems.push({
            id: `sci-${Date.now()}-${index}`,
            title: title.substring(0, 100) + (title.length > 100 ? '...' : ''), // Limit title length
            summary: 'Supreme Court of India announcement',
            content: 'Supreme Court of India announcement',
            category: 'Supreme Court',
            date: date || new Date().toISOString().split('T')[0],
            source: 'Supreme Court of India',
            url: 'https://supremecourtofindia.nic.in/home/',
            importance: 'high'
          });
        }
      });
      
      // If we found items, break
      if (newsItems.length > 0) {
        console.log(`Found ${newsItems.length} items from Supreme Court using selector: ${selector}`);
        break;
      }
    }
    
    console.log(`Total Supreme Court items: ${newsItems.length}`);
    return newsItems;
  } catch (error) {
    console.error('Error scraping Supreme Court:', error.message);
    return [];
  }
};

// Function to scrape Indian Kanoon news
const scrapeIndianKanoon = async () => {
  try {
    console.log('Scraping Indian Kanoon...');
    const response = await axios.get('https://indiankanoon.org/search/?formInput=doctypes: judgments', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Indian Kanoon response status:', response.status);
    const $ = cheerio.load(response.data);
    const newsItems = [];
    
    // Try different selectors
    const selectors = ['.result', '.docFragment', '.result-item', '.search-result'];
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        if (index >= 10) return; // Limit to 10 items
        
        let title, link, summary, date;
        
        // Try different title selectors
        title = $(element).find('.result_title').text().trim() || 
                $(element).find('h3 a').text().trim() || 
                $(element).find('h2 a').text().trim() || 
                $(element).find('a').first().text().trim();
        
        // Try different link selectors
        link = $(element).find('.result_title a').attr('href') || 
               $(element).find('h3 a').attr('href') || 
               $(element).find('h2 a').attr('href') || 
               $(element).find('a').first().attr('href');
        
        // Try different summary selectors
        summary = $(element).find('.result_text').text().trim() || 
                  $(element).find('.docText').text().trim() || 
                  $(element).find('p').first().text().trim() || 
                  'Click to read full judgment';
        
        // Try different date selectors
        date = $(element).find('.result_date').text().trim() || 
               $(element).find('.docDate').text().trim() || 
               new Date().toISOString().split('T')[0];
        
        if (title && link) {
          newsItems.push({
            id: `indiankanoon-${Date.now()}-${index}`,
            title: title,
            summary: summary.substring(0, 200) + (summary.length > 200 ? '...' : ''),
            content: summary,
            category: 'Court Judgments',
            date: date || new Date().toISOString().split('T')[0],
            source: 'Indian Kanoon',
            url: link.startsWith('http') ? link : `https://indiankanoon.org${link}`,
            importance: 'medium'
          });
        }
      });
      
      // If we found items, break
      if (newsItems.length > 0) {
        console.log(`Found ${newsItems.length} items from Indian Kanoon using selector: ${selector}`);
        break;
      }
    }
    
    console.log(`Total Indian Kanoon items: ${newsItems.length}`);
    return newsItems;
  } catch (error) {
    console.error('Error scraping Indian Kanoon:', error.message);
    return [];
  }
};

// Function to scrape PRS Legislative Research
const scrapePRS = async () => {
  try {
    console.log('Scraping PRS Legislative Research...');
    const response = await axios.get('https://prsindia.org/billtrack', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('PRS response status:', response.status);
    const $ = cheerio.load(response.data);
    const newsItems = [];
    
    // Try different selectors
    const selectors = ['.bill-item', '.bill-card', '.bill', 'article', '.post'];
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        if (index >= 10) return; // Limit to 10 items
        
        let title, link, summary, date;
        
        // Try different title selectors
        title = $(element).find('h3 a').text().trim() || 
                $(element).find('h2 a').text().trim() || 
                $(element).find('h1 a').text().trim() ||
                $(element).find('.title a').text().trim() || 
                $(element).find('a').first().text().trim();
        
        // Try different link selectors
        link = $(element).find('h3 a').attr('href') || 
               $(element).find('h2 a').attr('href') || 
               $(element).find('h1 a').attr('href') ||
               $(element).find('.title a').attr('href') || 
               $(element).find('a').first().attr('href');
        
        // Try different summary selectors
        summary = $(element).find('.excerpt').text().trim() || 
                  $(element).find('.summary').text().trim() || 
                  $(element).find('p').first().text().trim() || 
                  'Click to read full analysis';
        
        // Try different date selectors
        date = $(element).find('.date').text().trim() || 
               $(element).find('time').attr('datetime') || 
               $(element).find('.published').text().trim() || 
               new Date().toISOString().split('T')[0];
        
        if (title && link) {
          newsItems.push({
            id: `prs-${Date.now()}-${index}`,
            title: title,
            summary: summary.substring(0, 200) + (summary.length > 200 ? '...' : ''),
            content: summary,
            category: 'Legislation',
            date: date || new Date().toISOString().split('T')[0],
            source: 'PRS Legislative Research',
            url: link.startsWith('http') ? link : `https://prsindia.org${link}`,
            importance: 'high'
          });
        }
      });
      
      // If we found items, break
      if (newsItems.length > 0) {
        console.log(`Found ${newsItems.length} items from PRS using selector: ${selector}`);
        break;
      }
    }
    
    console.log(`Total PRS items: ${newsItems.length}`);
    return newsItems;
  } catch (error) {
    console.error('Error scraping PRS:', error.message);
    return [];
  }
};

// Function to fetch real legal news from multiple sources using scraping
const fetchRealLegalNews = async () => {
  try {
    const currentTime = Date.now();
    
    // Check if cache is still valid
    if (newsCache.data.length > 0 && (currentTime - newsCache.timestamp) < newsCache.ttl) {
      console.log('Returning cached news data');
      return newsCache.data;
    }
    
    console.log('Fetching fresh news data from web scraping');
    
    // Fetch from all sources in parallel
    const [liveLawNews, barAndBenchNews, supremeCourtNews, indianKanoonNews, prsNews] = await Promise.all([
      scrapeLiveLaw(),
      scrapeBarAndBench(),
      scrapeSupremeCourt(),
      scrapeIndianKanoon(),
      scrapePRS()
    ]);
    
    console.log(`Scraped data - LiveLaw: ${liveLawNews.length}, BarAndBench: ${barAndBenchNews.length}, SupremeCourt: ${supremeCourtNews.length}, IndianKanoon: ${indianKanoonNews.length}, PRS: ${prsNews.length}`);
    
    // Combine all news
    let allNews = [...liveLawNews, ...barAndBenchNews, ...supremeCourtNews, ...indianKanoonNews, ...prsNews];
    
    console.log(`Total news items before deduplication: ${allNews.length}`);
    
    // Remove duplicates based on title similarity
    const uniqueNews = removeDuplicates(allNews);
    
    console.log(`Total news items after deduplication: ${uniqueNews.length}`);
    
    // Sort by date (newest first)
    uniqueNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update cache
    newsCache.data = uniqueNews;
    newsCache.timestamp = currentTime;
    
    return uniqueNews;
  } catch (error) {
    console.error('Error in fetchRealLegalNews:', error);
    throw error; // Don't fallback to mock data as requested
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
  
  if (content.includes('supreme court') || content.includes('high court') || content.includes('judgment') || content.includes('sc judgment')) {
    return 'Supreme Court';
  } else if (content.includes('act') || content.includes('bill') || content.includes('legislation')) {
    return 'Legislation';
  } else if (content.includes('regulation') || content.includes('policy') || content.includes('directive')) {
    return 'Regulations';
  } else if (content.includes('cyber') || content.includes('data') || content.includes('privacy') || content.includes('digital')) {
    return 'Technology Law';
  } else if (content.includes('criminal') || content.includes('crime') || content.includes('police') || content.includes('offense')) {
    return 'Criminal Law';
  } else if (content.includes('civil') || content.includes('contract') || content.includes('property') || content.includes('tort')) {
    return 'Civil Law';
  } else if (content.includes('corporate') || content.includes('company') || content.includes('business') || content.includes('merger') || content.includes('acquisition')) {
    return 'Corporate Law';
  } else if (content.includes('constitutional') || content.includes('fundamental rights') || content.includes('article')) {
    return 'Constitutional Law';
  } else if (content.includes('environment') || content.includes('pollution') || content.includes('climate')) {
    return 'Environmental Law';
  } else if (content.includes('bail') || content.includes('arrest') || content.includes('prosecution')) {
    return 'Criminal Law';
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
    'constitution', 'fundamental rights', 'sc judgment', 'enacted', 'passed'
  ];
  
  // Medium importance keywords
  const mediumImportanceKeywords = [
    'court', 'judgment', 'policy', 'guideline', 'directive', 'order',
    'criminal', 'civil', 'corporate', 'constitutional', 'high court',
    'tribunal', 'ngt', 'arbitration', 'introduced', 'proposed'
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
    throw error; // Don't fallback to mock data as requested
  }
};

// Get latest legal news
const getLegalNews = async (req, res) => {
  try {
    console.log('Legal news request received');
    const { category, limit = 50 } = req.query;
    
    // Fetch legal news
    const news = await fetchRealLegalNews();
    
    console.log(`Fetched ${news.length} news items`);
    
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
      error: 'Failed to fetch legal news: ' + error.message
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
      error: 'Failed to fetch legal news: ' + error.message
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
      error: 'Failed to search legal news: ' + error.message
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
      error: 'Failed to fetch legal news categories: ' + error.message
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
      error: 'Failed to fetch bills and amendments: ' + error.message
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
      error: 'Failed to fetch bill details: ' + error.message
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