# Supabase 대시보드 SQL 실행 가이드

## 🎯 목표
MCP 권한 문제를 우회하여 UI 테이블들을 직접 생성

## 📝 단계별 실행

### 1단계: Supabase 대시보드 접속
1. 브라우저에서 https://supabase.com/dashboard 방문
2. 로그인 후 프로젝트 **`nzcsyflhkpcugbcewzcj`** 선택

### 2단계: SQL Editor 열기
1. 좌측 사이드바에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭
3. 새로운 SQL 쿼리 창이 열림

### 3단계: 뉴스 테이블 생성 (우선)
아래 SQL을 복사해서 붙여넣고 **"Run"** 클릭:

```sql
-- 뉴스 기사 테이블 생성
CREATE TABLE IF NOT EXISTS news_articles (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    url TEXT UNIQUE,
    source TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    language VARCHAR(10) DEFAULT 'kr'
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_news_articles_url ON news_articles(url);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_language ON news_articles(language);

-- RLS 활성화
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- 공개 정책 생성
DROP POLICY IF EXISTS "Enable read access for all users" ON news_articles;
CREATE POLICY "Enable read access for all users" ON news_articles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON news_articles;
CREATE POLICY "Enable insert access for all users" ON news_articles
    FOR INSERT WITH CHECK (true);
```

### 4단계: UI 테이블들 생성
새로운 쿼리 창에서 아래 SQL 실행:

```sql
-- 1. 사용자 설정 테이블
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL DEFAULT 'default_user',
    language VARCHAR(10) DEFAULT 'kr',
    theme VARCHAR(20) DEFAULT 'dark',
    default_market VARCHAR(10) DEFAULT 'KRX',
    auto_refresh BOOLEAN DEFAULT true,
    refresh_interval INTEGER DEFAULT 30,
    favorite_stocks TEXT[] DEFAULT '{}',
    dashboard_layout JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{"news": true, "price_alerts": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 대시보드 위젯 설정 테이블
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    widget_type VARCHAR(50) NOT NULL,
    widget_config JSONB NOT NULL DEFAULT '{}',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 3,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 즐겨찾기 종목 테이블
CREATE TABLE IF NOT EXISTS favorite_stocks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    ticker_symbol VARCHAR(20) NOT NULL,
    stock_name TEXT,
    market VARCHAR(10),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    sort_order INTEGER DEFAULT 0,
    price_alert_enabled BOOLEAN DEFAULT false,
    target_price DECIMAL(12,4),
    alert_type VARCHAR(20) DEFAULT 'above',
    UNIQUE(user_id, ticker_symbol)
);

-- RLS 설정
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_stocks ENABLE ROW LEVEL SECURITY;

-- 공개 정책
CREATE POLICY "Enable all access for user_preferences" ON user_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for dashboard_widgets" ON dashboard_widgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for favorite_stocks" ON favorite_stocks FOR ALL USING (true) WITH CHECK (true);
```

### 5단계: 기본 데이터 삽입
```sql
-- 기본 사용자 설정
INSERT INTO user_preferences (user_id, language, theme, default_market, favorite_stocks)
VALUES ('default_user', 'kr', 'dark', 'KRX', '{"TSLA", "AAPL", "NVDA", "005930.KS"}')
ON CONFLICT (user_id) DO NOTHING;

-- 기본 즐겨찾기 종목
INSERT INTO favorite_stocks (user_id, ticker_symbol, stock_name, market, sort_order) VALUES
('default_user', 'TSLA', 'Tesla Inc', 'NASDAQ', 1),
('default_user', 'AAPL', 'Apple Inc', 'NASDAQ', 2),
('default_user', 'NVDA', 'NVIDIA Corporation', 'NASDAQ', 3),
('default_user', '005930.KS', '삼성전자', 'KRX', 4)
ON CONFLICT (user_id, ticker_symbol) DO NOTHING;
```

### 6단계: 생성 확인
```sql
-- 테이블 목록 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 데이터 확인
SELECT * FROM user_preferences;
SELECT * FROM favorite_stocks;
```

## ✅ 완료 후 확인사항

1. **뉴스 저장 오류 해결됨**
2. **UI 설정 저장 가능**
3. **즐겨찾기 기능 동작**

## 🔄 이후 작업

테이블 생성 완료 후 애플리케이션에서 UI 데이터베이스 연동 함수들을 구현하겠습니다. 