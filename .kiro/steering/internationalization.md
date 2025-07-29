# Internationalization (i18n) Guidelines

## Language Support Strategy
- Primary languages: Korean (ko) and English (en)
- Default language: Korean
- Fallback to English for missing translations
- Store user language preference in database and localStorage

## Translation Structure
```typescript
interface Translations {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
  };
  stock: {
    currentPrice: string;
    change: string;
    volume: string;
    marketCap: string;
    peRatio: string;
  };
  ai: {
    analyzing: string;
    recommendation: string;
    confidence: string;
    reasoning: string;
  };
  news: {
    sentiment: string;
    positive: string;
    negative: string;
    neutral: string;
  };
}

const translations: Record<'ko' | 'en', Translations> = {
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
      cancel: '취소',
      confirm: '확인'
    },
    // ... more translations
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm'
    },
    // ... more translations
  }
};
```

## Language Context Implementation
```typescript
interface LanguageContextType {
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
```

## AI Response Localization
- Configure AI prompts based on user language
- Request AI responses in user's preferred language
- Implement fallback translation for AI responses
- Handle mixed-language content appropriately

## Number and Date Formatting
```typescript
const formatCurrency = (amount: number, language: 'ko' | 'en') => {
  const locale = language === 'ko' ? 'ko-KR' : 'en-US';
  const currency = language === 'ko' ? 'KRW' : 'USD';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (date: Date, language: 'ko' | 'en') => {
  const locale = language === 'ko' ? 'ko-KR' : 'en-US';
  return new Intl.DateTimeFormat(locale).format(date);
};
```

## Language Switching
- Provide prominent language switcher in header
- Persist language preference across sessions
- Update all UI elements immediately on language change
- Handle RTL languages if needed in future

## Content Localization Best Practices
- Use translation keys instead of hardcoded strings
- Keep translations contextually appropriate
- Consider cultural differences in financial terminology
- Validate translations with native speakers

## SEO and URL Localization
- Implement language-specific URLs if needed
- Use hreflang tags for search engines
- Localize meta descriptions and titles
- Consider separate domains for different languages