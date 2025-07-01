import { supabase } from './supabase';

// Supabase 연결 테스트
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🔍 [Supabase Test] Testing connection...');
    
    // 1. 기본 연결 테스트 (더 안전한 방법)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message !== "Auth session missing!") {
      console.error('❌ [Supabase Test] Connection failed:', error);
      return {
        success: false,
        message: 'Supabase 연결 실패',
        details: error
      };
    }

    console.log('✅ [Supabase Test] Connection successful');
    console.log('ℹ️ [Supabase Test] Auth status:', user ? `logged_in (${user.id})` : 'not_logged_in');
    
    return {
      success: true,
      message: 'Supabase 연결 성공',
      details: { user: user?.id || 'not_logged_in' }
    };
  } catch (error) {
    console.error('❌ [Supabase Test] Connection error:', error);
    return {
      success: false,
      message: '연결 테스트 중 오류 발생',
      details: error
    };
  }
}

// 테이블 존재 여부 확인
export async function checkTableExists(tableName: string): Promise<{ exists: boolean; message: string; details?: any }> {
  try {
    console.log(`🔍 [Table Check] Checking if table '${tableName}' exists...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn(`⚠️ [Table Check] Table '${tableName}' does not exist`);
        return {
          exists: false,
          message: `테이블 '${tableName}'이 존재하지 않습니다.`,
          details: error
        };
      }
      
      // 다른 종류의 에러 (권한 등)
      console.error(`❌ [Table Check] Error checking table '${tableName}':`, error);
      return {
        exists: false,
        message: `테이블 확인 중 오류: ${error.message}`,
        details: error
      };
    }

    console.log(`✅ [Table Check] Table '${tableName}' exists`);
    return {
      exists: true,
      message: `테이블 '${tableName}'이 존재합니다.`,
      details: data
    };
  } catch (error) {
    console.error(`❌ [Table Check] Unexpected error checking table '${tableName}':`, error);
    return {
      exists: false,
      message: '테이블 확인 중 예상치 못한 오류 발생',
      details: error
    };
  }
}

// user_settings 테이블 생성 (간단한 접근법)
export async function createUserSettingsTable(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🔧 [Table Creation] Attempting to create user_settings table...');
    
    // 테이블이 이미 존재하는지 확인하기 위해 간단한 쿼리 시도
    const testResult = await supabase
      .from('user_settings')
      .select('id')
      .limit(1);

    if (!testResult.error) {
      console.log('✅ [Table Creation] Table already exists');
      return {
        success: true,
        message: 'user_settings 테이블이 이미 존재합니다.',
        details: 'exists'
      };
    }

    // 테이블이 없으면 사용자에게 수동 생성 안내
    if (testResult.error.message?.includes('relation') || testResult.error.message?.includes('does not exist')) {
      console.warn('⚠️ [Table Creation] Table does not exist. Manual creation required.');
      return {
        success: false,
        message: 'user_settings 테이블이 존재하지 않습니다. Supabase 대시보드에서 수동으로 생성해주세요.',
        details: testResult.error
      };
    }

    return {
      success: false,
      message: '테이블 상태를 확인할 수 없습니다.',
      details: testResult.error
    };
  } catch (error) {
    console.error('❌ [Table Creation] Unexpected error:', error);
    return {
      success: false,
      message: '테이블 생성 확인 중 예상치 못한 오류 발생',
      details: error
    };
  }
}

// 종합 초기화 함수
export async function initializeSupabase(): Promise<{ success: boolean; message: string; steps: any[] }> {
  const steps = [];
  
  try {
    // 1. 연결 테스트
    const connectionTest = await testSupabaseConnection();
    steps.push({ step: 'connection', ...connectionTest });
    
    if (!connectionTest.success) {
      return {
        success: false,
        message: 'Supabase 연결 실패',
        steps
      };
    }

    // 2. 테이블 존재 확인
    const tableCheck = await checkTableExists('user_settings');
    steps.push({ step: 'table_check', ...tableCheck });

    if (!tableCheck.exists) {
      // 3. 테이블 생성
      const tableCreation = await createUserSettingsTable();
      steps.push({ step: 'table_creation', ...tableCreation });
      
      if (!tableCreation.success) {
        return {
          success: false,
          message: '테이블 생성 실패',
          steps
        };
      }
    }

    return {
      success: true,
      message: 'Supabase 초기화 완료',
      steps
    };
  } catch (error) {
    steps.push({ step: 'error', success: false, message: '초기화 중 오류 발생', details: error });
    return {
      success: false,
      message: '초기화 실패',
      steps
    };
  }
} 