# Market Indicators and Fear & Greed Index Guidelines

## Fear & Greed Index Implementation
- Support multiple data sources for reliability
- Implement fallback mechanisms when primary sources fail
- Update index every 5 minutes during market hours
- Provide historical trend data when available

## Fear & Greed Data Sources
```typescript
interface FearGreedSource {
  name: string;
  url: string;
  priority: number;
  parser: (response: any) => FearGreedData;
  timeout: number;
}

const fearGreedSources: FearGreedSource[] = [
  {
    name: 'CNN Fear & Greed Index',
    url: 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
    priority: 1,
    parser: parseCNNData,
    timeout: 10000
  },
  {
    name: 'Alternative.me Crypto Fear & Greed',
    url: 'https://api.alternative.me/fng/',
    priority: 2,
    parser: parseAlternativeData,
    timeout: 8000
  }
];
```

## Fear & Greed Index Structure
```typescript
interface FearGreedData {
  value: number; // 0-100
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  lastUpdated: string;
  source: string;
  trend?: 'up' | 'down' | 'stable';
  historicalData?: Array<{
    date: string;
    value: number;
  }>;
}

const classifyFearGreed = (value: number): FearGreedData['classification'] => {
  if (value <= 25) return 'Extreme Fear';
  if (value <= 45) return 'Fear';
  if (value <= 55) return 'Neutral';
  if (value <= 75) return 'Greed';
  return 'Extreme Greed';
};
```

## VIX-based Fear & Greed Calculation
```typescript
const calculateVIXBasedFearGreed = (vixValue: number): number => {
  // VIX typically ranges from 10-80, normalize to 0-100 scale
  // Higher VIX = more fear (lower score)
  const normalizedVIX = Math.min(Math.max(vixValue, 10), 80);
  const fearGreedScore = 100 - ((normalizedVIX - 10) / 70) * 100;
  return Math.round(fearGreedScore);
};
```

## Global Market Indices
```typescript
interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  currency: string;
  market: 'US' | 'KR' | 'EU' | 'ASIA';
  isOpen: boolean;
  lastUpdated: string;
}

const majorIndices: MarketIndex[] = [
  { symbol: '^GSPC', name: 'S&P 500', market: 'US' },
  { symbol: '^IXIC', name: 'NASDAQ', market: 'US' },
  { symbol: '^DJI', name: 'Dow Jones', market: 'US' },
  { symbol: '^KS11', name: 'KOSPI', market: 'KR' },
  { symbol: '^KQ11', name: 'KOSDAQ', market: 'KR' }
];
```

## Market Status Indicators
```typescript
const getMarketStatus = (market: string): 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS' => {
  const now = new Date();
  const marketTimes = {
    US: { open: 9.5, close: 16 }, // 9:30 AM - 4:00 PM EST
    KR: { open: 9, close: 15.5 }  // 9:00 AM - 3:30 PM KST
  };
  
  // Implementation for market status logic
  return 'OPEN'; // Simplified
};
```

## Indicator Visualization Components
```typescript
const FearGreedGauge: React.FC<{ data: FearGreedData }> = ({ data }) => {
  const getColor = (value: number) => {
    if (value <= 25) return '#dc2626'; // red-600
    if (value <= 45) return '#ea580c'; // orange-600
    if (value <= 55) return '#65a30d'; // lime-600
    if (value <= 75) return '#16a34a'; // green-600
    return '#059669'; // emerald-600
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16">
        {/* Gauge implementation */}
      </div>
      <div className="text-center mt-2">
        <div className="text-2xl font-bold">{data.value}</div>
        <div className="text-sm text-gray-600">{data.classification}</div>
      </div>
    </div>
  );
};
```

## Market Calendar Integration
- Display upcoming earnings announcements
- Show economic indicator release dates
- Include market holidays and closures
- Highlight high-impact events

## Performance Monitoring
- Track API response times for all sources
- Monitor data freshness and accuracy
- Implement alerts for stale data
- Log failed requests for debugging