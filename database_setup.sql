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

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_news_articles_url ON news_articles(url);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_language ON news_articles(language);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 생성
DROP POLICY IF EXISTS "Enable read access for all users" ON news_articles;
CREATE POLICY "Enable read access for all users" ON news_articles
    FOR SELECT USING (true);

-- 공개 삽입 정책 생성
DROP POLICY IF EXISTS "Enable insert access for all users" ON news_articles;
CREATE POLICY "Enable insert access for all users" ON news_articles
    FOR INSERT WITH CHECK (true);

-- 공개 업데이트 정책 생성  
DROP POLICY IF EXISTS "Enable update access for all users" ON news_articles;
CREATE POLICY "Enable update access for all users" ON news_articles
    FOR UPDATE USING (true);

-- 테스트 데이터 삽입
INSERT INTO news_articles (title, content, summary, source, language) 
VALUES 
    ('테스트 뉴스', '이것은 테스트 뉴스입니다.', '테스트 요약', '테스트 출처', 'kr')
ON CONFLICT (url) DO NOTHING;

-- 테이블 정보 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'news_articles' 
ORDER BY ordinal_position; 