const { createClient } = require('@supabase/supabase-js');

// Service Role 키로 연결 (모든 권한)
const supabaseUrl = 'https://nzcsyflhkpcugbcewzcj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Y3N5Zmxoa3BjdWdiY2V3emNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTE3NjY5NCwiZXhwIjoyMDY2NzUyNjk0fQ.ChoiiH3R9IRk0yrftZiDRTkAq5S1lmJ9OxXOK4tMQek';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function createTables() {
  console.log('🔧 Service Role 키로 테이블 생성 시작...');

  try {
    // 1. 뉴스 기사 테이블 생성
    console.log('📰 news_articles 테이블 생성 중...');
    const { error: newsTableError } = await supabase.rpc('sql', {
      query: `
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

        CREATE INDEX IF NOT EXISTS idx_news_articles_url ON news_articles(url);
        CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
        CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
        CREATE INDEX IF NOT EXISTS idx_news_articles_language ON news_articles(language);

        ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Enable read access for all users" ON news_articles;
        CREATE POLICY "Enable read access for all users" ON news_articles
          FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Enable insert access for all users" ON news_articles;
        CREATE POLICY "Enable insert access for all users" ON news_articles
          FOR INSERT WITH CHECK (true);
      `
    });

    if (newsTableError) {
      console.error('❌ news_articles 테이블 생성 실패:', newsTableError);
    } else {
      console.log('✅ news_articles 테이블 생성 성공');
    }

    // 2. 사용자 설정 테이블 생성
    console.log('👤 user_preferences 테이블 생성 중...');
    const { error: userPrefError } = await supabase.rpc('sql', {
      query: `
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

        ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all access for user_preferences" ON user_preferences FOR ALL USING (true) WITH CHECK (true);
      `
    });

    if (userPrefError) {
      console.error('❌ user_preferences 테이블 생성 실패:', userPrefError);
    } else {
      console.log('✅ user_preferences 테이블 생성 성공');
    }

    // 3. 즐겨찾기 종목 테이블 생성
    console.log('⭐ favorite_stocks 테이블 생성 중...');
    const { error: favStocksError } = await supabase.rpc('sql', {
      query: `
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

        ALTER TABLE favorite_stocks ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all access for favorite_stocks" ON favorite_stocks FOR ALL USING (true) WITH CHECK (true);
      `
    });

    if (favStocksError) {
      console.error('❌ favorite_stocks 테이블 생성 실패:', favStocksError);
    } else {
      console.log('✅ favorite_stocks 테이블 생성 성공');
    }

    // 4. 기본 데이터 삽입
    console.log('📊 기본 데이터 삽입 중...');
    
    // 기본 사용자 설정
    const { error: insertUserError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: 'default_user',
        language: 'kr',
        theme: 'dark',
        default_market: 'KRX',
        favorite_stocks: ['TSLA', 'AAPL', 'NVDA', '005930.KS']
      });

    if (insertUserError) {
      console.error('❌ 기본 사용자 설정 삽입 실패:', insertUserError);
    } else {
      console.log('✅ 기본 사용자 설정 삽입 성공');
    }

    // 기본 즐겨찾기 종목
    const favoriteStocks = [
      { ticker_symbol: 'TSLA', stock_name: 'Tesla Inc', market: 'NASDAQ', sort_order: 1 },
      { ticker_symbol: 'AAPL', stock_name: 'Apple Inc', market: 'NASDAQ', sort_order: 2 },
      { ticker_symbol: 'NVDA', stock_name: 'NVIDIA Corporation', market: 'NASDAQ', sort_order: 3 },
      { ticker_symbol: '005930.KS', stock_name: '삼성전자', market: 'KRX', sort_order: 4 }
    ];

    const { error: insertStocksError } = await supabase
      .from('favorite_stocks')
      .upsert(favoriteStocks, { onConflict: 'user_id,ticker_symbol' });

    if (insertStocksError) {
      console.error('❌ 즐겨찾기 종목 삽입 실패:', insertStocksError);
    } else {
      console.log('✅ 즐겨찾기 종목 삽입 성공');
    }

    // 5. 테이블 목록 확인
    console.log('📋 생성된 테이블 확인 중...');
    const { data: tables, error: tablesError } = await supabase.rpc('sql', {
      query: "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    });

    if (tablesError) {
      console.error('❌ 테이블 목록 조회 실패:', tablesError);
    } else {
      console.log('📋 생성된 테이블들:', tables);
    }

    console.log('🎉 모든 테이블 생성 완료!');

  } catch (error) {
    console.error('❌ 테이블 생성 중 오류 발생:', error);
  }
}

createTables(); 