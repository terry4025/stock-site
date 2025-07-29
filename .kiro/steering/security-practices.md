---
inclusion: always
---

# Security Best Practices

## Environment Variables
- Never commit API keys or secrets to version control
- Use `.env.local` for local development secrets
- Validate environment variables at startup
- Use different keys for development and production

## API Security
```typescript
// API key validation
const validateApiKey = (key: string | undefined): boolean => {
  if (!key || key.length < 10) {
    throw new Error('Invalid API key configuration');
  }
  return true;
};
```

## Input Validation
- Sanitize all user inputs before processing
- Validate stock symbols against known patterns
- Implement rate limiting for user actions
- Use TypeScript for compile-time type checking

## Authentication Security
- Use Supabase Auth for secure authentication
- Implement proper session management
- Use HTTPS for all API communications
- Validate user permissions for all operations

## Data Protection
- Implement Row Level Security (RLS) in Supabase
- Encrypt sensitive data at rest
- Use secure headers in API responses
- Implement proper CORS policies

## Client-Side Security
```typescript
// Secure API client configuration
const createSecureClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
};
```

## Error Handling Security
- Never expose sensitive information in error messages
- Log security events for monitoring
- Implement proper error boundaries
- Use generic error messages for users

## Content Security Policy
- Implement CSP headers to prevent XSS
- Validate and sanitize all dynamic content
- Use trusted sources for external resources
- Implement proper iframe security