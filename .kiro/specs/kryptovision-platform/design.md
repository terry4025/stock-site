# KryptoVision AI 기반 실시간 금융 분석 플랫폼 설계 문서

## 개요

KryptoVision은 Next.js 14 App Router와 Google Gemini 2.5 Pro AI를 활용한 실시간 금융 분석 플랫폼입니다. 사용자에게 실시간 주식 데이터, AI 기반 투자 분석, 뉴스 감정 분석, 기술적 차트 분석을 제공하여 데이터 기반의 투자 의사결정을 지원합니다.

## 아키텍처

### 전체 시스템 아키텍처

```mermaid
graph TB
    subgraph "Frontend (Next.js 14)"
        A[App Router Pages] --> B[React Components]
        B --> C[Client State Management]
        C --> D[UI Components (shadcn/ui)]
    end
    
    subgraph "Backend Services"
        E[Server Actions] --> F[AI Flows (Genkit)]
        E --> G[External APIs]
        E --> H[Supabase Client]
    end
    
    subgraph "External Services"
        I[Google Gemini 2.5 Pro]
        J[Yahoo Finance API]
        K[CNN Fear & Greed API]
        L[Alternative.me API]
        M[Supabase Database]
    end
    
    A --> E
    F --> I
    G --> J
    G --> K
    G --> L
    H --> M
```

### 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Framework**: Tailwind CSS, shadcn/ui, Radix UI
- **AI Integration**: Google Genkit, Gemini 2.5 Pro
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Data Fetching**: Server Actions, Multi-source APIs
- **Deployment**: Vercel (Edge Runtime)

## 컴포넌트 및 인터페이스

### 핵심 컴포넌트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지 (서버 컴포넌트)
│   ├── actions.ts         # 서버 액션들
│   └── providers.tsx      # Context 프로바이더
├── components/kryptovision/
│   ├── DashboardClient.tsx    # 메인 대시보드 (클라이언트)
│   ├── StockSearch.tsx        # 종목 검색
│   ├── StockDataTable.tsx     # 주식 데이터 테이블
│   ├── FinancialChart.tsx     # 캔들스틱 차트
│   ├── AiAnalysis.tsx         # AI 분석 컴포넌트
│   ├── NewsCards.tsx          # 뉴스 카드
│   ├── FearGreedIndex.tsx     # 공포탐욕지수
│   ├── GlobalIndices.tsx      # 글로벌 지수
│   └── ...
├── ai/
│   ├── flows/                 # AI 플로우들
│   │   ├── stock-analysis-summary.ts
│   │   ├── fear-greed-index.ts
│   │   ├── news-sentiment-analysis.ts
│   │   └── ...
│   ├── schemas.ts             # Zod 스키마
│   └── genkit.ts             # Genkit 설정
├── lib/
│   ├── types.ts              # TypeScript 타입 정의
│   ├── supabase.ts           # Supabase 클라이언트
│   ├── utils.ts              # 유틸리티 함수
│   └── translations.ts       # 다국어 지원
└── contexts/
    ├── AuthContext.tsx       # 인증 컨텍스트
    └── LanguageContext.tsx   # 언어 컨텍스트
```

### 주요 인터페이스

#### StockData 인터페이스
```typescript
interface StockData {
  ticker: string;
  name: string;
  exchange: string;
  currentPrice: number;
  dailyChange: {
    value: number;
    percentage: number;
  };
  volume: string;
  marketCap: string;
  peRatio: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  dividendYield: number | null;
  beta: number | null;
}
```

#### AI 분석 결과 인터페이스
```typescript
interface AiAnalysisResult {
  analysisSummary: string;
  recommendation: 'Buy' | 'Hold';
  confidenceScore: number;
  shortTermTarget?: number;
  longTermTarget?: number;
  buyPrice?: number;
  sellPrice?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}
```

#### 뉴스 기사 인터페이스
```typescript
interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  language?: 'kr' | 'en';
  summary?: string;
  content?: string;
  ticker?: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  wallStreetComments?: string[];
  schedule?: string[];
}
```

## 데이터 모델

### Supabase 데이터베이스 스키마

#### 사용자 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 사용자 설정 테이블
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'kr',
  refresh_interval INTEGER DEFAULT 30,
  auto_refresh BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### AI 분석 기록 테이블
```sql
CREATE TABLE ai_analysis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  symbol TEXT NOT NULL,
  title TEXT NOT NULL,
  analysis_content JSONB NOT NULL,
  sentiment TEXT,
  confidence_score DECIMAL,
  price_at_analysis DECIMAL,
  market_data JSONB,
  news_count INTEGER DEFAULT 0,
  analysis_duration_ms INTEGER,
  model_used TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 뉴스 기사 테이블
```sql
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  content TEXT,
  summary TEXT,
  source TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  language TEXT DEFAULT 'kr',
  ticker TEXT,
  category TEXT,
  sentiment TEXT,
  wall_street_comments TEXT[],
  schedule TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 에러 처리

### 다층 폴백 시스템

#### 1. 실시간 데이터 API 폴백
```typescript
const realDataSources = [
  { name: 'Yahoo Finance', timeout: 5000 },
  { name: 'Alpha Vantage', timeout: 7000 },
  { name: 'Finnhub', timeout: 7000 },
  { name: 'FMP', timeout: 10000 }
];

// 각 소스를 순차적으로 시도하고 실패 시 다음 소스로 폴백
// 모든 소스 실패 시 향상된 Mock 데이터 사용
```

#### 2. AI 분석 폴백
```typescript
// Gemini API 실패 시 폴백 분석 제공
const fallbackAnalysis = {
  analysisSummary: "기술적 지표 기반 기본 분석",
  recommendation: 'Hold',
  confidenceScore: 0.5
};
```

#### 3. Fear & Greed 지수 폴백
```typescript
const fearGreedSources = [
  'CNN DataViz API',
  'Alternative.me API', 
  'VIX 기반 계산',
  '실시간 시뮬레이션'
];
```

### 에러 로깅 및 모니터링

- 모든 API 호출에 타임아웃 설정
- 에러 발생 시 콘솔 로깅
- 사용자에게 친화적인 에러 메시지 표시
- 서비스 연속성을 위한 Graceful Degradation

## 테스팅 전략

### 단위 테스트
- AI 플로우 함수들의 입출력 검증
- 유틸리티 함수들의 로직 테스트
- 데이터 변환 함수들의 정확성 검증

### 통합 테스트
- 외부 API 연동 테스트
- Supabase 데이터베이스 연동 테스트
- AI 분석 파이프라인 전체 플로우 테스트

### E2E 테스트
- 사용자 시나리오 기반 테스트
- 종목 검색 → AI 분석 → 결과 표시 플로우
- 다국어 전환 및 설정 저장 테스트

### 성능 테스트
- 실시간 데이터 업데이트 성능
- AI 분석 응답 시간 측정
- 대량 뉴스 데이터 처리 성능

### 테스트 도구
- Jest: 단위 테스트
- React Testing Library: 컴포넌트 테스트
- Playwright: E2E 테스트
- Lighthouse: 성능 및 접근성 테스트

## 보안 고려사항

### API 키 관리
- 환경 변수를 통한 안전한 API 키 저장
- 클라이언트 사이드에서 민감한 키 노출 방지
- Vercel 환경 변수 암호화 활용

### 사용자 인증
- Supabase Auth를 통한 안전한 인증
- JWT 토큰 기반 세션 관리
- Row Level Security (RLS) 정책 적용

### 데이터 보호
- 사용자 개인 정보 암호화
- HTTPS 강제 사용
- CORS 정책 적용

### 입력 검증
- Zod 스키마를 통한 데이터 검증
- SQL 인젝션 방지
- XSS 공격 방지

## 성능 최적화

### 프론트엔드 최적화
- Next.js App Router의 서버 컴포넌트 활용
- 이미지 최적화 (Next.js Image 컴포넌트)
- 코드 스플리팅 및 지연 로딩
- Tailwind CSS 퍼지 최적화

### 데이터 페칭 최적화
- 병렬 데이터 로딩 (Promise.all)
- 적절한 타임아웃 설정
- 캐싱 전략 (SWR 패턴)
- 실시간 업데이트 최적화

### AI 처리 최적화
- Genkit 플로우 최적화
- 프롬프트 엔지니어링
- 응답 시간 단축을 위한 모델 설정 조정

### 데이터베이스 최적화
- 적절한 인덱스 설정
- 쿼리 최적화
- 연결 풀링
- 실시간 구독 최적화

## 배포 및 인프라

### Vercel 배포 설정
- Edge Runtime 활용
- 자동 배포 파이프라인
- 환경별 설정 관리
- 성능 모니터링

### 환경 변수 관리
```bash
# 필수 환경 변수
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PREFERRED_API=multisource
```

### 모니터링 및 로깅
- Vercel Analytics 활용
- 에러 추적 및 알림
- 성능 메트릭 모니터링
- 사용자 행동 분석

## 확장성 고려사항

### 수평적 확장
- Serverless 아키텍처 활용
- API 레이트 리미팅
- 캐시 레이어 추가 고려

### 기능 확장
- 새로운 AI 모델 통합 준비
- 추가 데이터 소스 연동 구조
- 플러그인 아키텍처 고려

### 다국가 지원
- 지역별 데이터 소스 추가
- 시간대 처리
- 통화 변환 기능