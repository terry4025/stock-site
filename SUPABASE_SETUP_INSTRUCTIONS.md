# Supabase 테이블 생성 지침

## 📋 문제 상황
현재 MCP를 통해 Supabase에 연결되었지만, `news_articles` 테이블이 아직 생성되지 않아서 뉴스 저장 시 오류가 발생합니다.

## 🛠️ 해결 방법

### 1. Supabase 대시보드 접속
1. [Supabase 대시보드](https://supabase.com/dashboard) 방문
2. 프로젝트 선택: `nzcsyflhkpcugbcewzcj`

### 2. SQL Editor에서 테이블 생성
**Table Editor** → **New Table** 또는 **SQL Editor**에서 다음 SQL 실행:

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
```

### 3. 테이블 생성 확인
```sql
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
```

## 🔧 현재 상태
- ✅ Supabase 클라이언트 연결 성공
- ✅ 안전한 오류 처리 구현 (테이블 없어도 앱 동작)
- ⚠️ `news_articles` 테이블 수동 생성 필요
- ✅ 뉴스 저장/조회 함수 준비 완료

## 📊 연결 정보
- **Project URL**: https://nzcsyflhkpcugbcewzcj.supabase.co
- **API URL**: https://nzcsyflhkpcugbcewzcj.supabase.co/rest/v1/
- **Auth URL**: https://nzcsyflhkpcugbcewzcj.supabase.co/auth/v1/

## 🎯 테이블 생성 후 예상 효과
1. **뉴스 중복 방지**: URL 기반 중복 체크
2. **AI 요약 향상**: DB에 저장된 전체 기사 내용 활용
3. **성능 최적화**: 인덱스를 통한 빠른 검색
4. **데이터 축적**: 시간별 뉴스 트렌드 분석 가능 