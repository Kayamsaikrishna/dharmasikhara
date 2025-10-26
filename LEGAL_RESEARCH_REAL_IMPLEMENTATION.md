# Legal Research Real Data Implementation Guide

## Overview

The current legal research feature uses mock data for demonstration purposes. This document outlines how to implement real data fetching from legal databases and web sources.

## Current Implementation

The legal research feature is structured with:
- Frontend: React/TypeScript component in `LegalResearch.tsx`
- Backend: Node.js/Express controller in `legalResearchController.js`
- Routes: Protected API endpoints in `legalResearch.js`

## Real Data Sources

### 1. Legal Databases

#### Indian Kanoon
- **Status**: No official API
- **Implementation**: Web scraping required
- **Libraries**: Puppeteer or Cheerio
- **URL**: https://indiankanoon.org/

#### SCC Online
- **Status**: Official API available (subscription required)
- **Implementation**: API integration
- **Documentation**: https://www.scconline.com/api

#### Google Scholar
- **Status**: No official API
- **Implementation**: Web scraping required
- **Libraries**: Puppeteer or Cheerio
- **URL**: https://scholar.google.com/

### 2. News Sources

#### Legal News APIs
- NewsAPI.org
- Reuters API
- Bloomberg Law API

### 3. Academic Sources

#### Legal Research Databases
- JSTOR
- HeinOnline
- Westlaw
- LexisNexis

## Implementation Steps

### 1. Backend Implementation

#### Install Required Dependencies
```bash
npm install puppeteer cheerio axios
```

#### Update LegalResearchController.js

##### Add Web Scraping Function for Indian Kanoon
```javascript
async searchIndianKanoonReal(query, searchType, jurisdiction, limit) {
    try {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Navigate to Indian Kanoon
        await page.goto('https://indiankanoon.org/search/');
        
        // Fill search form
        await page.type('#search-box', query);
        await page.click('#search-button');
        
        // Wait for results
        await page.waitForSelector('.result');
        
        // Extract results
        const results = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('.result').forEach(item => {
                items.push({
                    title: item.querySelector('.title').textContent,
                    citation: item.querySelector('.citation').textContent,
                    court: item.querySelector('.court').textContent,
                    date: item.querySelector('.date').textContent,
                    summary: item.querySelector('.summary').textContent,
                    url: item.querySelector('a').href
                });
            });
            return items;
        });
        
        await browser.close();
        return results.slice(0, limit);
    } catch (error) {
        console.error('Indian Kanoon search error:', error);
        return [];
    }
}
```

##### Add API Integration for SCC Online
```javascript
async searchSCCOnlineReal(query, searchType, jurisdiction, limit) {
    try {
        const response = await axios.get('https://www.scconline.com/api/search', {
            params: {
                query: query,
                type: searchType,
                jurisdiction: jurisdiction,
                limit: limit
            },
            headers: {
                'Authorization': `Bearer ${process.env.SCC_ONLINE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data.results;
    } catch (error) {
        console.error('SCC Online search error:', error);
        return [];
    }
}
```

##### Update Search Function
```javascript
async searchSimilarCases(req, res) {
    try {
        const { query, searchType = 'keywords', jurisdiction = 'all-courts', limit = 50 } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        // Use real data sources instead of mock data
        const results = await Promise.allSettled([
            this.searchIndianKanoonReal(query, searchType, jurisdiction, limit),
            this.searchSCCOnlineReal(query, searchType, jurisdiction, limit),
            // Add other real data sources
        ]);
        
        // Combine and deduplicate results
        const combinedResults = this.combineSearchResults(results);
        
        res.json({
            success: true,
            data: {
                query,
                searchType,
                jurisdiction,
                results: combinedResults,
                totalResults: combinedResults.length,
                sources: ['Indian Kanoon', 'SCC Online', 'Google Scholar', 'News Sources', 'Academic Sources']
            }
        });
    } catch (error) {
        console.error('Legal research error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search for similar cases',
            error: error.message
        });
    }
}
```

### 2. Frontend Implementation

#### Update LegalResearch.tsx
Add real-time loading indicators and error handling:

```typescript
const LegalResearch: React.FC = () => {
    
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // ... existing authentication check ...
        
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchError('');
        // ... rest of existing code ...
        
        try {
            const response = await fetch('/api/legal-research/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    query: searchQuery,
                    searchType,
                    jurisdiction,
                    limit: 50
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setSearchResults({
                    cases: data.data.results,
                    documents: [],
                    citations: [],
                    news: [],
                    analysis: [],
                    timeline: [],
                    totalResults: data.data.results.length
                });
            } else {
                setSearchError(data.message || t('legalResearch.searchFailed'));
            }
        } catch (err) {
            setSearchError(t('legalResearch.connectionError'));
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };
    
    // ... rest of component ...
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* ... existing code ... */}
            
            {isSearching && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                        <p className="text-blue-700 dark:text-blue-300">
                            Searching legal databases in real-time... This may take a few moments.
                        </p>
                    </div>
                </div>
            )}
            
            {searchError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 dark:text-red-300">{searchError}</p>
                    </div>
                </div>
            )}
            
            {/* ... rest of existing code ... */}
        </div>
    );
};
```

## Rate Limiting and Error Handling

### Implement Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const legalResearchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many legal research requests from this IP, please try again later."
});

router.post('/search', legalResearchLimiter, authenticateToken, legalResearchController.searchSimilarCases);
```

### Error Handling
```javascript
// Add retry logic for failed requests
async function withRetry(fn, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
}
```

## Security Considerations

1. **API Keys**: Store in environment variables
2. **Rate Limiting**: Prevent abuse of scraping
3. **Caching**: Cache results to reduce requests
4. **User Authentication**: Ensure only authenticated users can access

## Performance Optimization

1. **Caching**: Use Redis or in-memory caching
2. **Pagination**: Implement pagination for large result sets
3. **Parallel Requests**: Use Promise.all for concurrent requests
4. **Connection Pooling**: Reuse browser instances for Puppeteer

## Testing

1. **Unit Tests**: Test individual search functions
2. **Integration Tests**: Test end-to-end search flow
3. **Mock Services**: Mock external APIs for testing
4. **Error Scenarios**: Test various error conditions

## Deployment Considerations

1. **Environment Variables**: Configure API keys and settings
2. **Scraping Infrastructure**: Consider using headless browser services
3. **Monitoring**: Implement logging and monitoring
4. **Scaling**: Plan for increased load

## Future Enhancements

1. **Natural Language Processing**: Improve search relevance
2. **Machine Learning**: Recommend relevant cases
3. **Document Analysis**: Extract insights from case documents
4. **Alerts**: Notify users of new relevant cases