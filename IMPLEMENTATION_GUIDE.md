# DharmaSikhara Implementation Guide

## Legal Research Feature - Real Data Implementation

### Current Status
The legal research feature currently uses mock data for demonstration purposes. This guide explains how to implement real data fetching from legal databases and web sources.

### Architecture Overview
```
Frontend (React/TypeScript) ↔ Backend API (Node.js/Express) ↔ Legal Databases & Web Sources
```

### Implementation Steps

#### 1. Backend Implementation

##### Dependencies to Install
```bash
npm install puppeteer cheerio axios express-rate-limit
```

##### Web Scraping Implementation
For sources without APIs (Indian Kanoon, Google Scholar):
```javascript
// Example implementation for Indian Kanoon
const puppeteer = require('puppeteer');

async function scrapeIndianKanoon(query) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://indiankanoon.org/search/');
        await page.type('#search-box', query);
        await page.click('#search-button');
        await page.waitForSelector('.results');
        
        const results = await page.evaluate(() => {
            // Extract data from the page
            // Implementation details would depend on the site structure
        });
        
        return results;
    } finally {
        await browser.close();
    }
}
```

##### API Integration
For sources with APIs (SCC Online, NewsAPI):
```javascript
// Example implementation for SCC Online API
async function searchSCCOnlineAPI(query) {
    const response = await axios.get('https://api.scconline.com/search', {
        params: { q: query },
        headers: { 
            'Authorization': `Bearer ${process.env.SCC_ONLINE_API_KEY}` 
        }
    });
    return response.data;
}
```

#### 2. Frontend Implementation

##### Real-time Updates
```typescript
const [isSearching, setIsSearching] = useState(false);
const [searchProgress, setSearchProgress] = useState(0);

const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate progress updates
    const interval = setInterval(() => {
        setSearchProgress(prev => Math.min(prev + 10, 90));
    }, 500);
    
    try {
        const response = await fetch('/api/legal-research/search');
        const data = await response.json();
        setSearchResults(data);
    } finally {
        clearInterval(interval);
        setSearchProgress(100);
        setIsSearching(false);
    }
};
```

#### 3. Rate Limiting and Error Handling

##### API Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const legalResearchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per window
    message: "Too many legal research requests. Please try again later."
});
```

##### Retry Logic
```javascript
async function withRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** i)); // Exponential backoff
        }
    }
}
```

### Data Sources Integration

#### Legal Databases
1. **Indian Kanoon** - Web scraping with Puppeteer
2. **SCC Online** - Official API (subscription required)
3. **Google Scholar** - Web scraping with Cheerio
4. **Manupatra** - Official API
5. **Westlaw** - Official API

#### News Sources
1. **NewsAPI.org** - General news API
2. **Legal News APIs** - Specialized legal news services
3. **RSS Feeds** - Direct RSS feed parsing

#### Academic Sources
1. **JSTOR** - Official API
2. **HeinOnline** - Official API
3. **Semantic Scholar** - Public API

### Security Considerations

1. **API Keys** - Store in environment variables
2. **Rate Limiting** - Prevent abuse of external services
3. **Input Validation** - Sanitize user inputs
4. **CORS** - Configure appropriate CORS policies
5. **Authentication** - Ensure only authenticated users can access

### Performance Optimization

1. **Caching** - Cache results with Redis or in-memory store
2. **Pagination** - Implement pagination for large result sets
3. **Parallel Processing** - Use Promise.all for concurrent requests
4. **Connection Pooling** - Reuse browser instances for Puppeteer
5. **Database Indexing** - Optimize database queries

### Testing Strategy

1. **Unit Tests** - Test individual scraping functions
2. **Integration Tests** - Test end-to-end search flow
3. **Mock Services** - Mock external APIs for testing
4. **Error Scenarios** - Test various error conditions
5. **Performance Tests** - Test under load conditions

### Deployment Considerations

1. **Environment Variables** - Configure API keys and settings
2. **Scraping Infrastructure** - Consider using headless browser services
3. **Monitoring** - Implement logging and monitoring
4. **Scaling** - Plan for increased load
5. **Compliance** - Ensure compliance with website terms of service

### Future Enhancements

1. **Natural Language Processing** - Improve search relevance with NLP
2. **Machine Learning** - Recommend relevant cases based on user history
3. **Document Analysis** - Extract insights from case documents
4. **Alerts** - Notify users of new relevant cases
5. **Advanced Filtering** - More sophisticated search filters
6. **Case Comparison** - Compare similar cases side-by-side
7. **Trend Analysis** - Analyze legal trends over time