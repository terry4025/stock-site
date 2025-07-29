import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzcsyflhkpcugbcewzcj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Y3N5Zmxoa3BjdWdiY2V3emNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzY2OTQsImV4cCI6MjA2Njc1MjY5NH0.FdS0UsNIogYKspkry9PjI7yk2sIaC4VbWpzGVd3yrQc';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 뉴스 기사 타입 정의
export interface NewsArticleDB {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  url?: string;
  source?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  language: string;
}

// 뉴스 기사 저장 함수 (중복 URL 처리 포함)
export async function saveNewsArticle(article: {
  title: string;
  content?: string;
  summary?: string;
  url?: string;
  source?: string;
  published_at?: string;
  language?: string;
}): Promise<NewsArticleDB | null> {
  try {
    // 입력 검증
    if (!article || !article.title || article.title.trim().length === 0) {
      console.warn('[Supabase] ⚠️ Invalid article data - missing title');
      return null;
    }

    // 테이블 존재 여부 먼저 확인
    const { data: tableCheck, error: tableError } = await supabase
      .from('news_articles')
      .select('id')
      .limit(1);

    if (tableError) {
      console.warn('[Supabase] Table does not exist or no permission:', tableError.message || tableError);
      console.log('[Supabase] ⚠️ Skipping save - table not accessible');
      return null;
    }

    // 데이터 정리
    const cleanArticle = {
      title: article.title.trim(),
      content: article.content?.trim() || null,
      summary: article.summary?.trim() || null,
      url: article.url?.trim() || null,
      source: article.source?.trim() || null,
      published_at: article.published_at || null,
      language: article.language || 'kr'
    };

    // URL이 있는 경우 중복 확인
    if (cleanArticle.url) {
      const existingArticle = await findNewsArticleByUrl(cleanArticle.url);
      if (existingArticle) {
        console.log(`[Supabase] ✅ Article with URL already exists, returning existing (ID: ${existingArticle.id})`);
        return existingArticle;
      }
    }

    console.log(`[Supabase] Saving new article: "${article.title?.substring(0, 50)}..."`);
    
    // UPSERT를 사용하여 중복을 처리 (URL이 있는 경우)
    if (cleanArticle.url) {
      const { data, error } = await supabase
        .from('news_articles')
        .upsert([cleanArticle], { 
          onConflict: 'url',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('[Supabase] Error upserting article:', error.message || error);
        return null;
      }

      console.log(`[Supabase] ✅ Article upserted with ID: ${data.id}`);
      return data as NewsArticleDB;
    } else {
      // URL이 없는 경우 일반 INSERT
      const { data, error } = await supabase
        .from('news_articles')
        .insert([cleanArticle])
        .select()
        .single();

      if (error) {
        console.error('[Supabase] Error saving article:', error.message || error);
        return null;
      }

      console.log(`[Supabase] ✅ Article saved with ID: ${data.id}`);
      return data as NewsArticleDB;
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Supabase] Error in saveNewsArticle:', errorMsg);
    return null;
  }
}

// URL로 뉴스 기사 찾기
export async function findNewsArticleByUrl(url: string): Promise<NewsArticleDB | null> {
  try {
    // 테이블 존재 여부 먼저 확인
    const { data: tableCheck, error: tableError } = await supabase
      .from('news_articles')
      .select('id')
      .limit(1);

    if (tableError) {
      console.warn('[Supabase] Table not accessible for URL lookup:', tableError.message);
      return null;
    }

    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('url', url)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - 정상적인 경우
        return null;
      }
      console.error('[Supabase] Error finding article by URL:', error.message || error);
      return null;
    }

    return data as NewsArticleDB;
  } catch (error) {
    console.error('[Supabase] Error in findNewsArticleByUrl:', error);
    return null;
  }
}

// ID로 뉴스 기사 가져오기
export async function getNewsArticle(id: number): Promise<NewsArticleDB | null> {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Supabase] Error fetching article:', error.message || error);
      return null;
    }

    return data as NewsArticleDB;
  } catch (error) {
    console.error('[Supabase] Error in getNewsArticle:', error);
    return null;
  }
}

// 현재 사용자 가져오기
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // "Auth session missing!"은 정상적인 상황(로그인하지 않은 상태)이므로 에러 출력하지 않음
      if (error.message !== "Auth session missing!") {
        console.error('[Supabase] Error getting current user:', error.message);
      }
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('[Supabase] Error in getCurrentUser:', error);
    return null;
  }
}

// 사용자 로그인
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // 한국어 에러 메시지로 변환
      let koreanError = error.message;
      
      if (error.message === "Invalid login credentials") {
        koreanError = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else if (error.message.includes("Email not confirmed")) {
        koreanError = "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.";
      } else if (error.message.includes("Too many requests")) {
        koreanError = "너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes("Invalid email")) {
        koreanError = "올바른 이메일 형식이 아닙니다.";
      }
      
      return { user: null, error: { ...error, message: koreanError } };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: { message: "로그인 중 오류가 발생했습니다." } };
  }
}

// 이메일 확인 재전송
export async function resendConfirmation(email: string) {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      // 한국어 에러 메시지로 변환
      let koreanError = error.message;
      
      if (error.message.includes("For security purposes")) {
        koreanError = "보안상의 이유로 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes("Invalid email")) {
        koreanError = "올바른 이메일 형식이 아닙니다.";
      } else if (error.message.includes("User not found")) {
        koreanError = "등록되지 않은 이메일입니다.";
      }
      
      return { error: { ...error, message: koreanError } };
    }
    
    return { error: null };
  } catch (error) {
    return { error: { message: "이메일 재전송 중 오류가 발생했습니다." } };
  }
}

// 사용자 로그아웃
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: { message: "로그아웃 중 오류가 발생했습니다." } };
    }
    
    return { error: null };
  } catch (error) {
    return { error: { message: "로그아웃 중 오류가 발생했습니다." } };
  }
}

// 인증 상태 변화 리스너
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  } catch (error) {
    console.error('[Supabase] Error setting up auth state listener:', error);
    return null;
  }
}

// 사용자 회원가입
export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    });
    
    if (error) {
      // 한국어 에러 메시지로 변환
      let koreanError = error.message;
      
      if (error.message.includes("User already registered")) {
        koreanError = "이미 가입된 이메일입니다.";
      } else if (error.message.includes("Password should be at least")) {
        koreanError = "비밀번호는 최소 6자 이상이어야 합니다.";
      } else if (error.message.includes("Invalid email")) {
        koreanError = "올바른 이메일 형식이 아닙니다.";
      } else if (error.message.includes("Signup is disabled")) {
        koreanError = "현재 회원가입이 비활성화되어 있습니다.";
      }
      
      return { user: null, error: { ...error, message: koreanError } };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: { message: "회원가입 중 오류가 발생했습니다." } };
  }
}

// 데이터베이스 연결 테스트
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('[Supabase] Testing database connection...');
    
    const { data, error } = await supabase
      .from('news_articles')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('[Supabase] Database connection test failed:', error.message || error);
      return false;
    }

    console.log('[Supabase] ✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('[Supabase] Database connection test error:', error);
    return false;
  }
} 