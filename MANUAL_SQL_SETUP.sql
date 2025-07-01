-- =============================================
-- 🚀 Supabase 수동 테이블 생성 스크립트
-- 복사해서 SQL Editor에 붙여넣고 "Run" 클릭
-- =============================================

-- 1. 뉴스 기사 테이블 생성
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

-- 뉴스 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_news_articles_url ON news_articles(url);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_language ON news_articles(language);

-- 2. 사용자 설정 테이블 생성
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

-- 3. 즐겨찾기 종목 테이블 생성
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

-- 4. 대시보드 위젯 설정 테이블
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

-- 5. UI 테마 테이블
CREATE TABLE IF NOT EXISTS ui_themes (
    id BIGSERIAL PRIMARY KEY,
    theme_name VARCHAR(50) UNIQUE NOT NULL,
    theme_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_custom BOOLEAN DEFAULT false,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    notification_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS (Row Level Security) 활성화
-- =============================================

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 공개 정책 생성 (모든 사용자 접근 허용)
-- =============================================

-- news_articles 정책
DROP POLICY IF EXISTS "Enable all access for news_articles" ON news_articles;
CREATE POLICY "Enable all access for news_articles" ON news_articles
    FOR ALL USING (true) WITH CHECK (true);

-- user_preferences 정책
DROP POLICY IF EXISTS "Enable all access for user_preferences" ON user_preferences;
CREATE POLICY "Enable all access for user_preferences" ON user_preferences
    FOR ALL USING (true) WITH CHECK (true);

-- favorite_stocks 정책
DROP POLICY IF EXISTS "Enable all access for favorite_stocks" ON favorite_stocks;
CREATE POLICY "Enable all access for favorite_stocks" ON favorite_stocks
    FOR ALL USING (true) WITH CHECK (true);

-- dashboard_widgets 정책
DROP POLICY IF EXISTS "Enable all access for dashboard_widgets" ON dashboard_widgets;
CREATE POLICY "Enable all access for dashboard_widgets" ON dashboard_widgets
    FOR ALL USING (true) WITH CHECK (true);

-- ui_themes 정책
DROP POLICY IF EXISTS "Enable all access for ui_themes" ON ui_themes;
CREATE POLICY "Enable all access for ui_themes" ON ui_themes
    FOR ALL USING (true) WITH CHECK (true);

-- notifications 정책
DROP POLICY IF EXISTS "Enable all access for notifications" ON notifications;
CREATE POLICY "Enable all access for notifications" ON notifications
    FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 기본 데이터 삽입
-- =============================================

-- 기본 사용자 설정
INSERT INTO user_preferences (user_id, language, theme, default_market, favorite_stocks)
VALUES ('default_user', 'kr', 'dark', 'KRX', '{"TSLA", "AAPL", "NVDA", "005930.KS"}')
ON CONFLICT (user_id) DO NOTHING;

-- 기본 테마들
INSERT INTO ui_themes (theme_name, theme_config, is_default, is_custom, created_by) VALUES
('dark', '{"primary": "#1a1a1a", "secondary": "#2d2d2d", "accent": "#3b82f6", "text": "#ffffff"}', true, false, 'system'),
('light', '{"primary": "#ffffff", "secondary": "#f5f5f5", "accent": "#3b82f6", "text": "#000000"}', false, false, 'system'),
('blue', '{"primary": "#1e3a8a", "secondary": "#3b82f6", "accent": "#60a5fa", "text": "#ffffff"}', false, false, 'system')
ON CONFLICT (theme_name) DO NOTHING;

-- 기본 즐겨찾기 종목
INSERT INTO favorite_stocks (user_id, ticker_symbol, stock_name, market, sort_order) VALUES
('default_user', 'TSLA', 'Tesla Inc', 'NASDAQ', 1),
('default_user', 'AAPL', 'Apple Inc', 'NASDAQ', 2),
('default_user', 'NVDA', 'NVIDIA Corporation', 'NASDAQ', 3),
('default_user', '005930.KS', '삼성전자', 'KRX', 4)
ON CONFLICT (user_id, ticker_symbol) DO NOTHING;

-- 기본 대시보드 위젯
INSERT INTO dashboard_widgets (user_id, widget_type, widget_config, position_x, position_y, width, height, sort_order) VALUES
('default_user', 'market_summary', '{"markets": ["KRX", "NASDAQ", "NYSE"]}', 0, 0, 12, 2, 1),
('default_user', 'favorite_stocks', '{"display_count": 10}', 0, 2, 6, 4, 2),
('default_user', 'news_feed', '{"sources": ["all"], "max_items": 5}', 6, 2, 6, 4, 3),
('default_user', 'fear_greed_index', '{"show_history": true}', 0, 6, 4, 3, 4),
('default_user', 'global_indices', '{"indices": ["SP500", "NASDAQ", "KOSPI"]}', 4, 6, 4, 3, 5),
('default_user', 'ai_analysis', '{"analysis_type": "market_sentiment"}', 8, 6, 4, 3, 6)
ON CONFLICT DO NOTHING;

-- =============================================
-- 테이블 생성 확인
-- =============================================

SELECT 
    'Tables created successfully!' as status,
    count(*) as table_count
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('news_articles', 'user_preferences', 'favorite_stocks', 
                      'dashboard_widgets', 'ui_themes', 'notifications');

-- 테이블 목록 출력
SELECT tablename as created_tables 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 