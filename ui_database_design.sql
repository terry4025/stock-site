-- ==============================================
-- UI 데이터베이스 설계 및 테이블 생성
-- ==============================================

-- 1. 사용자 설정 테이블 (User Preferences)
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL DEFAULT 'default_user',
    language VARCHAR(10) DEFAULT 'kr',
    theme VARCHAR(20) DEFAULT 'dark',
    default_market VARCHAR(10) DEFAULT 'KRX',
    auto_refresh BOOLEAN DEFAULT true,
    refresh_interval INTEGER DEFAULT 30, -- seconds
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
    widget_type VARCHAR(50) NOT NULL, -- 'stock_chart', 'news_feed', 'market_summary', etc.
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

-- 3. 사용자 즐겨찾기 종목 테이블
CREATE TABLE IF NOT EXISTS favorite_stocks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    ticker_symbol VARCHAR(20) NOT NULL,
    stock_name TEXT,
    market VARCHAR(10), -- 'KRX', 'NASDAQ', 'NYSE', etc.
    added_at TIMESTAMPTZ DEFAULT NOW(),
    sort_order INTEGER DEFAULT 0,
    price_alert_enabled BOOLEAN DEFAULT false,
    target_price DECIMAL(12,4),
    alert_type VARCHAR(20) DEFAULT 'above', -- 'above', 'below', 'both'
    UNIQUE(user_id, ticker_symbol)
);

-- 4. UI 테마 및 커스터마이제이션 테이블
CREATE TABLE IF NOT EXISTS ui_themes (
    id BIGSERIAL PRIMARY KEY,
    theme_name VARCHAR(50) UNIQUE NOT NULL,
    theme_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_custom BOOLEAN DEFAULT false,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 사용자 활동 로그 테이블 (UI 사용 패턴 분석용)
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    action_type VARCHAR(50) NOT NULL, -- 'page_view', 'widget_click', 'search', etc.
    action_data JSONB DEFAULT '{}',
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 알림 설정 및 히스토리 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    notification_type VARCHAR(50) NOT NULL, -- 'price_alert', 'news_alert', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 저장된 차트 설정 테이블
CREATE TABLE IF NOT EXISTS saved_charts (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    chart_name VARCHAR(100) NOT NULL,
    ticker_symbol VARCHAR(20) NOT NULL,
    chart_type VARCHAR(30) DEFAULT 'candlestick', -- 'line', 'candlestick', 'area'
    time_range VARCHAR(20) DEFAULT '1D', -- '1D', '1W', '1M', '3M', '1Y'
    indicators JSONB DEFAULT '[]', -- MA, RSI, MACD, etc.
    chart_config JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 인덱스 생성 (성능 최적화)
-- ==============================================

-- user_preferences 인덱스
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- dashboard_widgets 인덱스
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_visible ON dashboard_widgets(is_visible);

-- favorite_stocks 인덱스
CREATE INDEX IF NOT EXISTS idx_favorite_stocks_user_id ON favorite_stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stocks_ticker ON favorite_stocks(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_favorite_stocks_market ON favorite_stocks(market);

-- ui_themes 인덱스
CREATE INDEX IF NOT EXISTS idx_ui_themes_name ON ui_themes(theme_name);
CREATE INDEX IF NOT EXISTS idx_ui_themes_default ON ui_themes(is_default);

-- user_activity_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action_type ON user_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity_logs(timestamp);

-- notifications 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- saved_charts 인덱스
CREATE INDEX IF NOT EXISTS idx_saved_charts_user_id ON saved_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_charts_ticker ON saved_charts(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_saved_charts_public ON saved_charts(is_public);

-- ==============================================
-- RLS (Row Level Security) 설정
-- ==============================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_charts ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS 정책 생성 (모든 사용자 접근 허용 - 개발용)
-- ==============================================

-- user_preferences 정책
DROP POLICY IF EXISTS "Enable all access for user_preferences" ON user_preferences;
CREATE POLICY "Enable all access for user_preferences" ON user_preferences
    FOR ALL USING (true) WITH CHECK (true);

-- dashboard_widgets 정책
DROP POLICY IF EXISTS "Enable all access for dashboard_widgets" ON dashboard_widgets;
CREATE POLICY "Enable all access for dashboard_widgets" ON dashboard_widgets
    FOR ALL USING (true) WITH CHECK (true);

-- favorite_stocks 정책
DROP POLICY IF EXISTS "Enable all access for favorite_stocks" ON favorite_stocks;
CREATE POLICY "Enable all access for favorite_stocks" ON favorite_stocks
    FOR ALL USING (true) WITH CHECK (true);

-- ui_themes 정책
DROP POLICY IF EXISTS "Enable all access for ui_themes" ON ui_themes;
CREATE POLICY "Enable all access for ui_themes" ON ui_themes
    FOR ALL USING (true) WITH CHECK (true);

-- user_activity_logs 정책
DROP POLICY IF EXISTS "Enable all access for user_activity_logs" ON user_activity_logs;
CREATE POLICY "Enable all access for user_activity_logs" ON user_activity_logs
    FOR ALL USING (true) WITH CHECK (true);

-- notifications 정책
DROP POLICY IF EXISTS "Enable all access for notifications" ON notifications;
CREATE POLICY "Enable all access for notifications" ON notifications
    FOR ALL USING (true) WITH CHECK (true);

-- saved_charts 정책
DROP POLICY IF EXISTS "Enable all access for saved_charts" ON saved_charts;
CREATE POLICY "Enable all access for saved_charts" ON saved_charts
    FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- 기본 데이터 삽입
-- ==============================================

-- 기본 사용자 설정
INSERT INTO user_preferences (user_id, language, theme, default_market, favorite_stocks)
VALUES ('default_user', 'kr', 'dark', 'KRX', '{"TSLA", "AAPL", "NVDA", "005930.KS"}')
ON CONFLICT (user_id) DO NOTHING;

-- 기본 테마 설정
INSERT INTO ui_themes (theme_name, theme_config, is_default, is_custom, created_by) VALUES
('dark', '{"primary": "#1a1a1a", "secondary": "#2d2d2d", "accent": "#3b82f6", "text": "#ffffff"}', true, false, 'system'),
('light', '{"primary": "#ffffff", "secondary": "#f5f5f5", "accent": "#3b82f6", "text": "#000000"}', false, false, 'system'),
('blue', '{"primary": "#1e3a8a", "secondary": "#3b82f6", "accent": "#60a5fa", "text": "#ffffff"}', false, false, 'system')
ON CONFLICT (theme_name) DO NOTHING;

-- 기본 대시보드 위젯
INSERT INTO dashboard_widgets (user_id, widget_type, widget_config, position_x, position_y, width, height, sort_order) VALUES
('default_user', 'market_summary', '{"markets": ["KRX", "NASDAQ", "NYSE"]}', 0, 0, 12, 2, 1),
('default_user', 'favorite_stocks', '{"display_count": 10}', 0, 2, 6, 4, 2),
('default_user', 'news_feed', '{"sources": ["all"], "max_items": 5}', 6, 2, 6, 4, 3),
('default_user', 'fear_greed_index', '{"show_history": true}', 0, 6, 4, 3, 4),
('default_user', 'global_indices', '{"indices": ["SP500", "NASDAQ", "KOSPI"]}', 4, 6, 4, 3, 5),
('default_user', 'ai_analysis', '{"analysis_type": "market_sentiment"}', 8, 6, 4, 3, 6)
ON CONFLICT DO NOTHING;

-- ==============================================
-- 테이블 생성 확인 쿼리
-- ==============================================

SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE '%user_%' 
    OR tablename LIKE '%dashboard_%' 
    OR tablename LIKE '%favorite_%' 
    OR tablename LIKE '%ui_%' 
    OR tablename LIKE '%notification%' 
    OR tablename LIKE '%saved_%'
ORDER BY tablename; 