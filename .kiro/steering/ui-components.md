---
inclusion: always
---

# UI Components and Design System

## shadcn/ui Integration
- Use shadcn/ui components as the foundation
- Customize components through CSS variables in globals.css
- Follow the established design tokens for consistency
- Extend components when needed, don't modify core files

## Component Architecture
```typescript
// Standard component structure
interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component logic
  return (
    <div className="component-styles">
      {/* Component JSX */}
    </div>
  );
};
```

## Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theme colors
- Implement dark/light mode support
- Keep consistent spacing using Tailwind scale

## Chart Components Standards
```typescript
// Chart component structure
interface ChartProps {
  data: ChartData[];
  height?: number;
  showGrid?: boolean;
  responsive?: boolean;
}

export const StockChart: React.FC<ChartProps> = ({
  data,
  height = 400,
  showGrid = true,
  responsive = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        {/* Chart configuration */}
      </LineChart>
    </ResponsiveContainer>
  );
};
```

## Loading States
- Use consistent loading skeletons
- Implement proper loading indicators
- Show progress for long operations
- Provide meaningful loading messages

## Error States
- Display user-friendly error messages
- Provide retry mechanisms where appropriate
- Use consistent error UI patterns
- Log errors for debugging

## Accessibility Standards
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast ratios
- Support screen readers

## Internationalization (i18n)
- Support Korean and English languages
- Use proper text direction handling
- Format numbers and dates according to locale
- Implement language switching functionality