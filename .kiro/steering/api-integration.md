---
inclusion: always
---

# API Integration Standards

## Real-time Data Sources
- Implement multi-source API strategy for reliability
- Use fallback mechanisms when primary APIs fail
- Handle rate limiting gracefully
- Cache responses to minimize API calls

## Stock Data APIs
```typescript
interface StockData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  high52Week?: number;
  low52Week?: number;
  dividendYield?: number;
  beta?: number;
}
```

## Market Indices Structure
```typescript
interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}
```

## Fear & Greed Index
```typescript
interface FearGreedIndex {
  value: number; // 0-100
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  lastUpdated: string;
  source: string;
}
```

## News Data Structure
```typescript
interface NewsItem {
  title: string;
  summary?: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment?: NewsSentiment;
}
```

## API Error Handling
- Implement exponential backoff for retries
- Use circuit breaker pattern for failing APIs
- Provide meaningful error messages to users
- Log API failures for monitoring

## Rate Limiting Strategy
- Implement request queuing for high-frequency updates
- Use different intervals for different data types
- Respect API rate limits and quotas
- Implement user-configurable refresh intervals

## Data Validation
- Validate all API responses before processing
- Use TypeScript type guards for runtime validation
- Handle malformed or incomplete data gracefully
- Sanitize data before displaying to users

## Caching Strategy
- Cache static data (company info, historical data)
- Use short-term caching for real-time data
- Implement cache invalidation strategies
- Use browser storage for user preferences