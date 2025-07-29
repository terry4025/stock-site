# Chart Visualization Guidelines

## Chart Library Standards
- Use Recharts as the primary charting library
- Implement responsive design with ResponsiveContainer
- Follow consistent color schemes across all charts
- Support both light and dark themes

## Candlestick Chart Implementation
```typescript
interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const CandlestickChart: React.FC<{
  data: CandlestickData[];
  height?: number;
}> = ({ data, height = 400 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="volume" fill="#8884d8" opacity={0.3} />
        {/* Custom candlestick implementation */}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
```

## Technical Indicators
- Implement moving averages (20-day, 50-day, 200-day)
- Add RSI (Relative Strength Index) calculations
- Support Bollinger Bands visualization
- Include volume-based indicators

## Chart Interaction Features
- Zoom and pan functionality
- Crosshair cursor for precise data reading
- Time range selectors (1D, 1W, 1M, 3M, 1Y)
- Toggle technical indicators on/off

## Volume Chart Integration
```typescript
const VolumeChart: React.FC<{ data: CandlestickData[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data}>
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Bar dataKey="volume" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

## Chart Performance Optimization
- Implement data sampling for large datasets
- Use virtualization for smooth scrolling
- Debounce zoom and pan operations
- Cache calculated technical indicators

## Accessibility for Charts
- Provide alternative text descriptions
- Support keyboard navigation
- Include data tables as fallback
- Use high contrast colors for better visibility

## Mobile Responsiveness
- Optimize touch interactions for mobile devices
- Implement gesture-based zoom and pan
- Adjust chart dimensions for small screens
- Provide simplified mobile chart views