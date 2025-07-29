---
inclusion: always
---

# AI Integration Guidelines

## Gemini 2.5 Pro Integration Standards

### API Configuration
- Always use environment variables for API keys (`GEMINI_API_KEY`)
- Implement proper error handling for AI API calls
- Use structured prompts for consistent AI responses
- Implement rate limiting to avoid API quota issues

### AI Analysis Structure
```typescript
interface AIAnalysisResult {
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence: number; // 0-100
  reasoning: string;
  targetPrice?: {
    short: number;
    long: number;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: string;
}
```

### Prompt Engineering Best Practices
- Use clear, structured prompts with specific instructions
- Include market context and current data in prompts
- Request structured JSON responses for consistency
- Implement fallback responses for API failures

### News Sentiment Analysis
```typescript
interface NewsSentiment {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
  summary: string;
  keyPoints: string[];
}
```

### Error Handling for AI Services
- Implement graceful degradation when AI services fail
- Provide cached or fallback analysis results
- Log AI service errors for monitoring
- Show appropriate user messages for AI service issues

### Performance Optimization
- Cache AI analysis results to reduce API calls
- Implement request debouncing for user interactions
- Use streaming responses where possible
- Batch multiple requests when appropriate