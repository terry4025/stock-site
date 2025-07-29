---
inclusion: always
---

# Database Patterns and Supabase Integration

## Supabase Configuration
- Use environment variables for database connection
- Implement Row Level Security (RLS) for all tables
- Use Supabase client with proper TypeScript types
- Handle real-time subscriptions appropriately

## Database Schema Standards

### User Management
```sql
-- Users table extends Supabase auth.users
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  preferred_language TEXT DEFAULT 'ko',
  theme_preference TEXT DEFAULT 'system',
  refresh_interval INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Analysis History
```sql
CREATE TABLE ai_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  symbol TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Settings
```sql
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## TypeScript Database Types
```typescript
interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      ai_analysis: {
        Row: AIAnalysisRecord;
        Insert: Omit<AIAnalysisRecord, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}
```

## Data Access Patterns
- Use Supabase client with proper error handling
- Implement optimistic updates where appropriate
- Cache frequently accessed data
- Use real-time subscriptions for live data
- Implement proper pagination for large datasets

## Security Best Practices
- Enable RLS on all tables
- Use proper authentication checks
- Validate all user inputs
- Implement proper CORS settings
- Use environment variables for sensitive data