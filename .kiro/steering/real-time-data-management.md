# Real-time Data Management Guidelines

## Real-time Update Strategy
- Implement configurable refresh intervals (default 30 seconds)
- Use WebSocket connections where possible for true real-time updates
- Implement graceful fallback to polling when WebSocket fails
- Provide user controls for enabling/disabling real-time updates

## Data Source Management
```typescript
interface DataSource {
  name: string;
  priority: number;
  endpoint: string;
  rateLimit: number;
  timeout: number;
  fallback?: DataSource;
}

const stockDataSources: DataSource[] = [
  {
    name: 'Yahoo Finance',
    priority: 1,
    endpoint: 'https://query1.finance.yahoo.com/v8/finance/chart/',
    rateLimit: 2000, // requests per hour
    timeout: 5000
  },
  {
    name: 'Alpha Vantage',
    priority: 2,
    endpoint: 'https://www.alphavantage.co/query',
    rateLimit: 500,
    timeout: 10000
  }
];
```

## Multi-source Fallback System
- Implement automatic failover between data sources
- Use circuit breaker pattern for failing APIs
- Cache last known good data for emergency fallback
- Provide status indicators for each data source

## Korean vs International Stock Handling
```typescript
const isKoreanStock = (symbol: string): boolean => {
  return symbol.endsWith('.KS') || symbol.endsWith('.KQ');
};

const getDataSource = (symbol: string): DataSource => {
  if (isKoreanStock(symbol)) {
    return koreanStockSources[0];
  }
  return internationalStockSources[0];
};
```

## Real-time Status Management
- Display connection status to users
- Show last update timestamp
- Provide manual refresh capability
- Implement retry logic with exponential backoff

## Performance Considerations
- Batch multiple symbol requests when possible
- Implement request queuing to respect rate limits
- Use efficient data structures for real-time updates
- Minimize re-renders with proper memoization

## Error Handling for Real-time Data
- Gracefully handle network interruptions
- Provide meaningful error messages to users
- Implement automatic reconnection logic
- Log errors for monitoring and debugging