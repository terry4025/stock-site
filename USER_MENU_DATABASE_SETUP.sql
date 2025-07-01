-- ============================================
-- KRYPTOVISION 사용자 메뉴 기능 데이터베이스 설정
-- 사용법: Supabase 대시보드의 SQL Editor에서 실행
-- ============================================

-- 1. 사용자 프로필 테이블 (내 프로필 기능)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 기본 정보
    display_name VARCHAR(100),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    
    -- 연락 정보
    phone VARCHAR(20),
    country VARCHAR(50),
    timezone VARCHAR(50),
    
    -- 투자 정보
    investment_experience VARCHAR(20) CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'professional')),
    preferred_markets TEXT[],
    investment_budget_range VARCHAR(20),
    
    -- 프로필 이미지
    avatar_url TEXT,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AI 분석 기록 테이블 (AI 분석 기록 기능)
CREATE TABLE IF NOT EXISTS ai_analysis_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 분석 정보
    analysis_type VARCHAR(20) NOT NULL CHECK (analysis_type IN ('stock', 'crypto', 'macro', 'news')),
    symbol VARCHAR(20),
    title VARCHAR(200) NOT NULL,
    
    -- 분석 결과
    analysis_content JSONB NOT NULL,
    sentiment VARCHAR(20),
    confidence_score DECIMAL(3,2),
    
    -- 시장 데이터
    price_at_analysis DECIMAL(12,4),
    market_data JSONB,
    
    -- 뉴스 데이터
    news_sources TEXT[],
    news_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    analysis_duration_ms INTEGER,
    model_used VARCHAR(50),
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 보안 설정 테이블 (보안 기능)
CREATE TABLE IF NOT EXISTS user_security (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 2FA 설정
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    backup_codes TEXT[],
    
    -- 비밀번호 정책
    password_changed_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login TIMESTAMP WITH TIME ZONE,
    
    -- 보안 알림
    login_notifications BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_security UNIQUE (user_id)
);

-- 4. 보안 이벤트 로그 테이블
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    event_type VARCHAR(30) NOT NULL,
    event_description TEXT,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analysis" ON ai_analysis_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own security" ON user_security
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_ai_analysis_user_id ON ai_analysis_history(user_id);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis_history(created_at DESC);
CREATE INDEX idx_user_security_user_id ON user_security(user_id);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);

-- 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analysis_updated_at 
    BEFORE UPDATE ON ai_analysis_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_security_updated_at 
    BEFORE UPDATE ON user_security 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 