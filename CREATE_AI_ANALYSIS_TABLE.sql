-- AI 분석 기록 테이블 생성
-- 이 파일을 Supabase 대시보드의 SQL Editor에서 실행하세요

-- AI 분석 기록 테이블 생성
CREATE TABLE IF NOT EXISTS ai_analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('stock', 'crypto', 'macro', 'news')),
  symbol TEXT,
  title TEXT NOT NULL,
  analysis_content JSONB NOT NULL,
  sentiment TEXT,
  confidence_score DECIMAL(3,2),
  price_at_analysis DECIMAL(15,4),
  market_data JSONB,
  news_sources TEXT[],
  news_count INTEGER DEFAULT 0,
  analysis_duration_ms INTEGER,
  model_used TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_user_id ON ai_analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_created_at ON ai_analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_analysis_type ON ai_analysis_history(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_symbol ON ai_analysis_history(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_is_favorite ON ai_analysis_history(is_favorite);

-- RLS 정책 활성화
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 분석 기록만 볼 수 있음
CREATE POLICY "Users can view own analysis history" ON ai_analysis_history
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 분석 기록만 삽입할 수 있음
CREATE POLICY "Users can insert own analysis history" ON ai_analysis_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 분석 기록만 업데이트할 수 있음
CREATE POLICY "Users can update own analysis history" ON ai_analysis_history
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 분석 기록만 삭제할 수 있음
CREATE POLICY "Users can delete own analysis history" ON ai_analysis_history
  FOR DELETE USING (auth.uid() = user_id);

-- 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_ai_analysis_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_analysis_history_updated_at
  BEFORE UPDATE ON ai_analysis_history
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_analysis_history_updated_at();

-- 테이블 생성 완료 확인
SELECT 'AI 분석 기록 테이블이 성공적으로 생성되었습니다!' as status; 