---
inclusion: always
---

# Deployment and Operations

## Build Configuration
- Use Next.js production build optimizations
- Implement proper environment variable handling
- Configure build-time optimizations
- Use static generation where appropriate

## Environment Management
```typescript
// Environment validation
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const;

const validateEnvironment = () => {
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });
};
```

## Performance Monitoring
- Monitor API response times
- Track user interaction metrics
- Monitor error rates and types
- Implement proper logging strategies

## Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API keys validated
- [ ] Build process completed successfully
- [ ] Security headers configured
- [ ] Performance metrics baseline established

## Error Monitoring
- Implement error tracking and reporting
- Monitor AI service availability
- Track database performance
- Set up alerts for critical failures

## Backup and Recovery
- Regular database backups
- Environment configuration backups
- Disaster recovery procedures
- Data retention policies

## Scaling Considerations
- API rate limiting strategies
- Database connection pooling
- CDN configuration for static assets
- Caching strategies for improved performance