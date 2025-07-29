---
inclusion: always
---

# Testing Guidelines

## Testing Strategy
- Write unit tests for utility functions and hooks
- Implement integration tests for API interactions
- Use end-to-end tests for critical user flows
- Test error scenarios and edge cases

## Component Testing
```typescript
// Example component test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { StockChart } from '@/components/charts/StockChart';

describe('StockChart', () => {
  it('renders chart with provided data', () => {
    const mockData = [/* test data */];
    render(<StockChart data={mockData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
```

## API Testing
- Mock external API calls in tests
- Test API error handling scenarios
- Validate data transformation logic
- Test rate limiting and caching behavior

## AI Integration Testing
```typescript
// Mock AI responses for testing
const mockAIAnalysis = {
  recommendation: 'BUY' as const,
  confidence: 85,
  reasoning: 'Test reasoning',
  riskLevel: 'MEDIUM' as const,
  timeframe: '3-6 months'
};
```

## Database Testing
- Use test database for integration tests
- Test RLS policies and permissions
- Validate data migrations
- Test real-time subscription behavior

## Performance Testing
- Test component rendering performance
- Monitor API response times
- Test with large datasets
- Validate memory usage patterns

## Accessibility Testing
- Test keyboard navigation
- Validate screen reader compatibility
- Check color contrast ratios
- Test with assistive technologies