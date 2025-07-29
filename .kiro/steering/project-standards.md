---
inclusion: always
---

# KryptoVision Project Standards

## Project Overview
KryptoVision is a real-time financial analysis platform powered by Gemini 2.5 Pro AI. This Next.js + Supabase application provides real-time stock and cryptocurrency market data visualization, AI-powered news analysis, and personalized dashboards.

## Technology Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **AI Integration**: Google Gemini 2.5 Pro, Genkit
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS with CSS variables for theming

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Use type guards for API responses
- Prefer `interface` over `type` for object definitions
- Use proper generic types for reusable components

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization where needed
- Follow the component composition pattern
- Keep components focused and single-responsibility

### File Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── charts/         # Chart components
├── lib/                # Utility functions and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

### Naming Conventions
- Components: PascalCase (e.g., `StockChart.tsx`)
- Files: kebab-case for utilities, PascalCase for components
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS classes: Follow Tailwind conventions

### Error Handling
- Implement proper error boundaries
- Use try-catch blocks for async operations
- Provide fallback UI for failed API calls
- Log errors appropriately for debugging
- Show user-friendly error messages

### Performance Guidelines
- Use React.lazy for code splitting
- Implement proper loading states
- Optimize API calls with caching
- Use proper dependency arrays in useEffect
- Minimize re-renders with useMemo and useCallback

## API Integration Standards
- Use environment variables for API keys
- Implement proper rate limiting
- Handle API failures gracefully with fallbacks
- Use TypeScript interfaces for API responses
- Implement proper loading and error states