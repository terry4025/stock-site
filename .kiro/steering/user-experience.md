# User Experience and Interface Guidelines

## Loading States and Skeleton UI
- Implement skeleton screens for all major components
- Use consistent loading animations across the platform
- Provide progress indicators for long-running operations
- Show meaningful loading messages for AI analysis

## Loading State Components
```typescript
const StockDataSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-full"></div>
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded"></div>
    <div className="flex space-x-2 mt-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);
```

## Error Handling and User Feedback
- Display user-friendly error messages
- Provide actionable error recovery options
- Use toast notifications for temporary messages
- Implement error boundaries for component failures

## Error State Components
```typescript
const ErrorState: React.FC<{
  title: string;
  message: string;
  onRetry?: () => void;
}> = ({ title, message, onRetry }) => (
  <div className="text-center py-8">
    <div className="text-red-500 mb-2">
      <ExclamationTriangleIcon className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        다시 시도
      </button>
    )}
  </div>
);
```

## Responsive Design Principles
- Mobile-first approach for all components
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface elements on mobile
- Optimize chart interactions for touch devices

## Accessibility Standards
```typescript
// Keyboard navigation support
const useKeyboardNavigation = (onEnter: () => void) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onEnter();
    }
  };

  return { onKeyDown: handleKeyDown, tabIndex: 0 };
};

// Screen reader support
const StockPrice: React.FC<{ price: number; change: number }> = ({ price, change }) => (
  <div>
    <span className="sr-only">현재 주가</span>
    <span aria-label={`${price}원`}>{price.toLocaleString()}</span>
    <span 
      className={change >= 0 ? 'text-green-600' : 'text-red-600'}
      aria-label={`${change >= 0 ? '상승' : '하락'} ${Math.abs(change)}원`}
    >
      {change >= 0 ? '+' : ''}{change.toLocaleString()}
    </span>
  </div>
);
```

## Theme and Dark Mode Support
- Implement system preference detection
- Provide manual theme toggle
- Use CSS variables for consistent theming
- Ensure proper contrast ratios in both themes

## Performance Optimization
```typescript
// Memoization for expensive calculations
const MemoizedChart = React.memo(StockChart, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data && 
         prevProps.symbol === nextProps.symbol;
});

// Lazy loading for heavy components
const LazyNewsAnalysis = React.lazy(() => import('./NewsAnalysis'));

// Virtual scrolling for large lists
const VirtualizedNewsList: React.FC<{ news: NewsArticle[] }> = ({ news }) => {
  // Implementation with react-window or similar
};
```

## User Onboarding and Help
- Provide contextual tooltips for complex features
- Implement guided tours for new users
- Include help documentation links
- Show feature announcements for updates

## Data Export and Sharing
```typescript
const ExportButton: React.FC<{ data: any; filename: string }> = ({ data, filename }) => {
  const handleExport = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      <DownloadIcon className="h-4 w-4" />
      <span>CSV 내보내기</span>
    </button>
  );
};
```

## Real-time Status Indicators
- Show connection status to users
- Display last update timestamps
- Provide manual refresh controls
- Indicate when data is stale or outdated

## User Preferences and Customization
- Save user settings in both localStorage and database
- Sync settings across devices when logged in
- Provide granular control over notifications
- Allow customization of dashboard layout