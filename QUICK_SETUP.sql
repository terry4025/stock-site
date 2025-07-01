-- 🚀 KRYPTOVISION 빠른 설정: user_settings 테이블 생성
-- Supabase 대시보드 → SQL Editor에서 이 코드를 복사해서 실행하세요

-- 1. user_settings 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'auto')),
    language TEXT DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
    default_view TEXT DEFAULT 'dashboard',
    refresh_interval INTEGER DEFAULT 30 CHECK (refresh_interval >= 10 AND refresh_interval <= 300),
    risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('conservative', 'medium', 'aggressive')),
    investment_goals TEXT DEFAULT 'growth' CHECK (investment_goals IN ('growth', 'income', 'balanced', 'preservation')),
    data_sync BOOLEAN DEFAULT TRUE,
    analytics BOOLEAN DEFAULT TRUE,
    auto_refresh BOOLEAN DEFAULT TRUE,
    notifications JSONB DEFAULT '{
        "email": true,
        "push": true,
        "analysis_complete": true,
        "price_alerts": true,
        "news_updates": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- 3. Row Level Security (RLS) 정책 활성화
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성 (사용자는 자신의 설정만 볼 수 있음)
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;

CREATE POLICY "Users can view own settings" ON public.user_settings 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 트리거 적용
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ✅ 완료! 이제 앱에서 설정 저장이 정상 작동합니다. 