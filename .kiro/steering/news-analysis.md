# News Analysis and Sentiment Guidelines

## News Data Collection Strategy
- Implement multi-source news aggregation
- Prioritize financial news sources (Reuters, Bloomberg, MarketWatch)
- Include Korean financial news sources (연합뉴스, 한국경제)
- Filter news by relevance to selected stocks

## News Data Structure
```typescript
interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  publishedAt: string;
  source: string;
  author?: string;
  category: 'market' | 'stock-specific' | 'wall-street-comments';
  symbols?: string[]; // Related stock symbols
  sentiment?: NewsSentiment;
  aiSummary?: string;
}

interface NewsSentiment {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number; // 0-100
  reasoning: string;
  keyPoints: string[];
  marketImpact: 'HIGH' | 'MEDIUM' | 'LOW';
}
```

## AI Sentiment Analysis Implementation
```typescript
const analyzeSentiment = async (article: NewsArticle): Promise<NewsSentiment> => {
  const prompt = `
    Analyze the sentiment of this financial news article:
    Title: ${article.title}
    Content: ${article.content || article.summary}
    
    Provide analysis in this format:
    - Sentiment: POSITIVE/NEGATIVE/NEUTRAL
    - Confidence: 0-100
    - Reasoning: Brief explanation
    - Key Points: Important takeaways
    - Market Impact: HIGH/MEDIUM/LOW
  `;
  
  // Use Gemini AI for sentiment analysis
  return await callGeminiAPI(prompt);
};
```

## Wall Street Comments Extraction
- Identify analyst recommendations and price targets
- Extract institutional investor comments
- Highlight earnings call transcripts
- Separate from general market news

## News Categorization System
```typescript
const categorizeNews = (article: NewsArticle): NewsArticle['category'] => {
  const title = article.title.toLowerCase();
  const source = article.source.toLowerCase();
  
  if (title.includes('analyst') || title.includes('price target') || 
      source.includes('wall street')) {
    return 'wall-street-comments';
  }
  
  if (article.symbols && article.symbols.length > 0) {
    return 'stock-specific';
  }
  
  return 'market';
};
```

## Real-time News Updates
- Implement WebSocket connections for live news feeds
- Use polling fallback with configurable intervals
- Notify users of breaking news relevant to their watchlist
- Cache news articles to prevent duplicate processing

## News Display Components
```typescript
const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-green-600';
      case 'NEGATIVE': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold">{article.title}</h3>
      <p className="text-sm text-gray-600">{article.source} • {article.publishedAt}</p>
      {article.sentiment && (
        <div className={`text-sm ${getSentimentColor(article.sentiment.sentiment)}`}>
          {article.sentiment.sentiment} ({article.sentiment.confidence}%)
        </div>
      )}
    </div>
  );
};
```

## AI News Summarization
- Generate concise summaries for long articles
- Extract key financial metrics and numbers
- Highlight market-moving information
- Provide context for non-expert users

## Performance Optimization
- Implement news article caching
- Use pagination for large news feeds
- Lazy load news images and content
- Debounce sentiment analysis requests