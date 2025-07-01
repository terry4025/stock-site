-- 학썸의리딩방 - Supabase 테이블 생성 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 사용자 통계 테이블
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  ai_analyses_count INTEGER DEFAULT 0,
  news_read_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  active_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AI 분석 기록 테이블
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock', 'crypto', 'macro')),
  symbol TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  summary TEXT,
  key_points TEXT[],
  target_price TEXT,
  current_price TEXT,
  recommendation TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 사용자 설정 테이블
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'ko',
  default_view TEXT DEFAULT 'dashboard',
  refresh_interval INTEGER DEFAULT 30,
  risk_tolerance TEXT DEFAULT 'medium',
  investment_goals TEXT DEFAULT 'growth',
  data_sync BOOLEAN DEFAULT true,
  analytics BOOLEAN DEFAULT true,
  auto_refresh BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS (Row Level Security) 정책 활성화
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 5. 사용자 통계 테이블 정책
CREATE POLICY "Users can view own statistics" ON user_statistics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own statistics" ON user_statistics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own statistics" ON user_statistics FOR UPDATE USING (auth.uid() = user_id);

-- 6. AI 분석 기록 테이블 정책
CREATE POLICY "Users can view own analyses" ON ai_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON ai_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON ai_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON ai_analyses FOR DELETE USING (auth.uid() = user_id);

-- 7. 사용자 설정 테이블 정책
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- 8. 통계 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION increment_user_stat(stat_name TEXT, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_statistics (user_id, ai_analyses_count, news_read_count, favorites_count, active_days)
  VALUES (user_id_param, 
    CASE WHEN stat_name = 'ai_analyses_count' THEN 1 ELSE 0 END,
    CASE WHEN stat_name = 'news_read_count' THEN 1 ELSE 0 END,
    CASE WHEN stat_name = 'favorites_count' THEN 1 ELSE 0 END,
    CASE WHEN stat_name = 'active_days' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    ai_analyses_count = user_statistics.ai_analyses_count + CASE WHEN stat_name = 'ai_analyses_count' THEN 1 ELSE 0 END,
    news_read_count = user_statistics.news_read_count + CASE WHEN stat_name = 'news_read_count' THEN 1 ELSE 0 END,
    favorites_count = user_statistics.favorites_count + CASE WHEN stat_name = 'favorites_count' THEN 1 ELSE 0 END,
    active_days = user_statistics.active_days + CASE WHEN stat_name = 'active_days' THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 사용자가 생성될 때 기본 설정과 통계 생성하는 함수
CREATE OR REPLACE FUNCTION create_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- 기본 통계 생성
  INSERT INTO user_statistics (user_id) VALUES (NEW.id);
  
  -- 기본 설정 생성
  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 사용자 생성 시 자동으로 기본값 설정하는 트리거
DROP TRIGGER IF EXISTS on_auth_user_created_defaults ON auth.users;
CREATE TRIGGER on_auth_user_created_defaults
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_defaults();

-- 설정 완료!
-- 이제 애플리케이션에서 실제 Supabase 데이터를 사용할 수 있습니다. 