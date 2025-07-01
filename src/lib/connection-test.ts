import { supabase } from './supabase';

// 🔍 Supabase 연결 및 테이블 상태 종합 테스트
export async function checkConnectionStatus() {
  console.log('🔍 =========================');
  console.log('🔍 Supabase 연결 상태 확인 시작');
  console.log('🔍 =========================');

  const results = {
    connection: false,
    userSettingsTable: false,
    permissions: false,
    details: {} as any
  };

  // 1. 기본 연결 테스트
  try {
    console.log('🔗 [1/4] Supabase 기본 연결 테스트...');
    
    const { data, error } = await supabase
      .from('auth.users')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('❌ 연결 실패:', error.message);
      results.details.connectionError = error.message;
    } else {
      console.log('✅ Supabase 연결 성공');
      results.connection = true;
      results.details.connectionSuccess = true;
    }
  } catch (error) {
    console.error('❌ 연결 테스트 오류:', error);
    results.details.connectionError = error;
  }

  // 2. user_settings 테이블 존재 확인
  try {
    console.log('📋 [2/4] user_settings 테이블 확인...');
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.error('❌ user_settings 테이블이 존재하지 않습니다');
        results.details.tableError = 'Table does not exist';
      } else {
        console.error('❌ 테이블 접근 오류:', error.message);
        results.details.tableError = error.message;
      }
    } else {
      console.log('✅ user_settings 테이블 존재 확인');
      results.userSettingsTable = true;
      results.details.tableSuccess = true;
    }
  } catch (error) {
    console.error('❌ 테이블 확인 오류:', error);
    results.details.tableError = error;
  }

  // 3. 현재 인증 상태 확인
  try {
    console.log('🔐 [3/4] 사용자 인증 상태 확인...');
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.warn('⚠️ 인증 확인 오류:', error.message);
      results.details.authError = error.message;
    } else if (!user) {
      console.log('ℹ️ 현재 로그인하지 않은 상태');
      results.details.authStatus = 'not_logged_in';
    } else {
      console.log('✅ 로그인된 사용자:', user.id);
      results.details.authStatus = 'logged_in';
      results.details.userId = user.id;
    }
  } catch (error) {
    console.error('❌ 인증 확인 오류:', error);
    results.details.authError = error;
  }

  // 4. user_settings 테이블 권한 테스트 (로그인된 경우)
  if (results.userSettingsTable && results.details.userId) {
    try {
      console.log('🔒 [4/4] user_settings 테이블 권한 테스트...');
      
      // 테스트 데이터 삽입 시도
      const testData = {
        user_id: results.details.userId,
        theme: 'dark',
        language: 'ko',
        refresh_interval: 30
      };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert([testData], { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('❌ 권한 테스트 실패:', error.message);
        results.details.permissionError = error.message;
      } else {
        console.log('✅ user_settings 테이블 읽기/쓰기 권한 정상');
        results.permissions = true;
        results.details.permissionSuccess = true;
        results.details.testRecord = data;
      }
    } catch (error) {
      console.error('❌ 권한 테스트 오류:', error);
      results.details.permissionError = error;
    }
  } else {
    console.log('⚠️ 권한 테스트 건너뜀 (테이블 없음 또는 미로그인)');
  }

  // 결과 요약
  console.log('📊 =========================');
  console.log('📊 연결 상태 요약:');
  console.log('📊 =========================');
  console.log(`🔗 Supabase 연결: ${results.connection ? '✅ 정상' : '❌ 실패'}`);
  console.log(`📋 user_settings 테이블: ${results.userSettingsTable ? '✅ 존재' : '❌ 없음'}`);
  console.log(`🔒 테이블 권한: ${results.permissions ? '✅ 정상' : '❌ 문제'}`);
  console.log('📊 =========================');

  return results;
}

// 브라우저에서 호출할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).checkSupabaseConnection = checkConnectionStatus;
} 