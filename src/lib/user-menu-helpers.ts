import { supabase } from './supabase';
import { getUserSettings, getUserStatistics, updateUserStatistics, UserSettings } from './supabase-helpers';
import { saveSettingsToLocal, loadSettingsFromLocal, getDefaultSettings } from './local-settings';

// ============================================
// 사용자 프로필 관리 (내 프로필)
// ============================================

export interface UserProfile {
  id?: string;
  user_id: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  investment_experience?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferred_markets?: string[];
  investment_budget_range?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// 프로필 조회
export async function getUserProfile(userId: string): Promise<{ success: boolean; data?: UserProfile; error?: any }> {
  try {
    console.log('👤 [Profile] Getting profile for user:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ [Profile] Error getting profile:', error);
      return { success: false, error };
    }

    console.log('✅ [Profile] Profile retrieved successfully');
    return { success: true, data: data || null };
  } catch (error) {
    console.error('❌ [Profile] Unexpected error:', error);
    return { success: false, error };
  }
}

// 프로필 생성/업데이트
export async function upsertUserProfile(profile: UserProfile): Promise<{ success: boolean; data?: UserProfile; error?: any }> {
  try {
    console.log('👤 [Profile] Upserting profile for user:', profile.user_id);
    console.log('👤 [Profile] Profile data:', JSON.stringify(profile, null, 2));
    
    // 테이블 존재 여부 확인
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ [Profile] Table check failed:', tableError);
      
      // 테이블이 존재하지 않는 경우, 간단한 방법으로 생성 시도
      if (tableError.code === '42P01') {
        console.log('📝 [Profile] Table does not exist, attempting to create...');
        
        try {
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `
              CREATE TABLE IF NOT EXISTS user_profiles (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID NOT NULL UNIQUE,
                display_name TEXT,
                first_name TEXT,
                last_name TEXT,
                bio TEXT,
                phone TEXT,
                country TEXT,
                timezone TEXT DEFAULT 'Asia/Seoul',
                investment_experience TEXT,
                preferred_markets TEXT[],
                investment_budget_range TEXT,
                avatar_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              
              ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
              
              CREATE POLICY IF NOT EXISTS "Users can manage own profile" ON user_profiles
                FOR ALL USING (auth.uid()::text = user_id::text);
            `
          });
          
          if (createError) {
            console.error('❌ [Profile] Failed to create table:', createError);
          } else {
            console.log('✅ [Profile] Table created successfully');
          }
        } catch (createErr) {
          console.error('❌ [Profile] Table creation error:', createErr);
        }
      }
      
      return { success: false, error: tableError };
    }
    
    console.log('✅ [Profile] Table exists, proceeding with upsert');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [Profile] Error upserting profile:', error);
      console.error('❌ [Profile] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error };
    }

    console.log('✅ [Profile] Profile saved successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [Profile] Unexpected error:', error);
    return { success: false, error };
  }
}

// ============================================
// AI 분석 기록 관리 (AI 분석 기록)
// ============================================

export interface AIAnalysisRecord {
  id?: string;
  user_id: string;
  analysis_type: 'stock' | 'crypto' | 'macro' | 'news';
  symbol?: string;
  title: string;
  analysis_content: any;
  sentiment?: string;
  confidence_score?: number;
  price_at_analysis?: number;
  market_data?: any;
  news_sources?: string[];
  news_count?: number;
  analysis_duration_ms?: number;
  model_used?: string;
  is_favorite?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// AI 분석 기록 저장
export async function saveAnalysisRecord(analysis: AIAnalysisRecord): Promise<{ success: boolean; data?: AIAnalysisRecord; error?: any }> {
  try {
    console.log('🤖 [AI Analysis] Saving analysis record:', analysis.title);
    
    const { data, error } = await supabase
      .from('ai_analysis_history')
      .insert(analysis)
      .select()
      .single();

    if (error) {
      console.error('❌ [AI Analysis] Error saving analysis:', error);
      return { success: false, error };
    }

    console.log('✅ [AI Analysis] Analysis saved successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ [AI Analysis] Unexpected error:', error);
    return { success: false, error };
  }
}

// 사용자의 AI 분석 기록 조회
export async function getUserAnalysisHistory(
  userId: string, 
  options?: {
    limit?: number;
    offset?: number;
    analysis_type?: string;
    is_favorite?: boolean;
  }
): Promise<{ success: boolean; data?: AIAnalysisRecord[]; count?: number; error?: any }> {
  try {
    console.log('🤖 [AI Analysis] Getting analysis history for user:', userId);
    
    let query = supabase
      .from('ai_analysis_history')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.analysis_type) {
      query = query.eq('analysis_type', options.analysis_type);
    }

    if (options?.is_favorite !== undefined) {
      query = query.eq('is_favorite', options.is_favorite);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [AI Analysis] Error getting analysis history:', error);
      return { success: false, error };
    }

    console.log(`✅ [AI Analysis] Retrieved ${data?.length} analysis records`);
    return { success: true, data: data || [], count: count || 0 };
  } catch (error) {
    console.error('❌ [AI Analysis] Unexpected error:', error);
    return { success: false, error };
  }
}

// AI 분석 즐겨찾기 토글
export async function toggleAnalysisFavorite(analysisId: string, isFavorite: boolean): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('⭐ [AI Analysis] Toggling favorite for analysis:', analysisId);
    
    const { error } = await supabase
      .from('ai_analysis_history')
      .update({ is_favorite: isFavorite })
      .eq('id', analysisId);

    if (error) {
      console.error('❌ [AI Analysis] Error toggling favorite:', error);
      return { success: false, error };
    }

    console.log('✅ [AI Analysis] Favorite toggled successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ [AI Analysis] Unexpected error:', error);
    return { success: false, error };
  }
}

// ============================================
// 보안 설정 관리 (보안)
// ============================================

export interface UserSecurity {
  id?: string;
  user_id: string;
  two_factor_enabled?: boolean;
  two_factor_secret?: string;
  backup_codes?: string[];
  password_changed_at?: string;
  failed_login_attempts?: number;
  last_failed_login?: string;
  login_notifications?: boolean;
  security_alerts?: boolean;
  created_at?: string;
  updated_at?: string;
}

// 보안 설정 조회
export async function getUserSecurity(userId: string): Promise<{ success: boolean; data?: UserSecurity; error?: any }> {
  try {
    console.log('🔒 [Security] Getting security settings for user:', userId);
    
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [Security] Error getting security settings:', error);
      return { success: false, error };
    }

    console.log('✅ [Security] Security settings retrieved successfully');
    return { success: true, data: data || null };
  } catch (error) {
    console.error('❌ [Security] Unexpected error:', error);
    return { success: false, error };
  }
}

// 보안 설정 업데이트
export async function updateUserSecurity(security: UserSecurity): Promise<{ success: boolean; data?: UserSecurity; error?: any }> {
  try {
    console.log('🔒 [Security] Updating security settings for user:', security.user_id);
    
    const { data, error } = await supabase
      .from('user_security')
      .upsert(security, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [Security] Error updating security settings:', error);
      return { success: false, error };
    }

    console.log('✅ [Security] Security settings updated successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ [Security] Unexpected error:', error);
    return { success: false, error };
  }
}

// 보안 이벤트 로깅
export async function logSecurityEvent(
  userId: string,
  eventType: string,
  eventDescription: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('📝 [Security] Logging security event:', eventType);
    
    const { error } = await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_description: eventDescription,
        success,
        ip_address: ipAddress,
        user_agent: userAgent,
        failure_reason: failureReason
      });

    if (error) {
      console.error('❌ [Security] Error logging security event:', error);
      return { success: false, error };
    }

    console.log('✅ [Security] Security event logged successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ [Security] Unexpected error:', error);
    return { success: false, error };
  }
}

// 보안 이벤트 조회
export async function getSecurityEvents(
  userId: string,
  limit: number = 20
): Promise<{ success: boolean; data?: any[]; error?: any }> {
  try {
    console.log('📝 [Security] Getting security events for user:', userId);
    
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [Security] Error getting security events:', error);
      return { success: false, error };
    }

    console.log(`✅ [Security] Retrieved ${data?.length} security events`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ [Security] Unexpected error:', error);
    return { success: false, error };
  }
}

// ============================================
// 로그아웃 관리
// ============================================

// 안전한 로그아웃 (보안 이벤트 로깅 포함)
export async function performSecureLogout(userId: string): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('🚪 [Logout] Performing secure logout for user:', userId);
    
    // 1. 보안 이벤트 로깅
    await logSecurityEvent(
      userId,
      'logout',
      'User logged out successfully',
      true,
      undefined, // IP는 클라이언트에서 전달받아야 함
      navigator.userAgent
    );

    // 2. Supabase 세션 종료
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ [Logout] Error during logout:', error);
      return { success: false, error };
    }

    // 3. 로컬 스토리지 정리
    localStorage.removeItem('kryptovision_user_settings');
    localStorage.removeItem('kryptovision_language');
    
    console.log('✅ [Logout] Logout completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ [Logout] Unexpected error:', error);
    return { success: false, error };
  }
}

// ============================================
// 통합 초기화 함수
// ============================================

// 사용자 로그인 시 초기 설정 로드 및 적용
export async function initializeUserData(userId: string): Promise<{
  settings: UserSettings | null;
  profile: any;
  statistics: any;
}> {
  console.log('🚀 [UserMenuHelpers] Initializing user data for:', userId);
    
  try {
    // 병렬로 사용자 데이터 로드
    const [settings, statistics] = await Promise.all([
      getUserSettings(userId).catch(err => {
        console.warn('⚠️ [UserMenuHelpers] Failed to load settings from DB:', err);
        return null;
      }),
      getUserStatistics(userId).catch(err => {
        console.warn('⚠️ [UserMenuHelpers] Failed to load statistics from DB:', err);
        return null;
      })
    ]);

    // 기존 함수 사용
    const profile = await getUserProfile(userId).catch(err => {
      console.warn('⚠️ [UserMenuHelpers] Failed to load profile from DB:', err);
      return null;
    });

    // 설정이 DB에 없으면 로컬 스토리지에서 로드 시도
    let finalSettings = settings;
    if (!settings) {
      console.log('📱 [UserMenuHelpers] No DB settings found, trying localStorage');
      const localSettings = loadSettingsFromLocal(userId);
      if (localSettings) {
        console.log('✅ [UserMenuHelpers] Using localStorage settings');
        finalSettings = {
          id: '',
          user_id: userId,
          theme: localSettings.theme,
          language: localSettings.language,
          default_view: localSettings.default_view,
          refresh_interval: localSettings.refresh_interval,
          risk_tolerance: localSettings.risk_tolerance,
          investment_goals: localSettings.investment_goals,
          data_sync: localSettings.data_sync,
          analytics: localSettings.analytics,
          auto_refresh: localSettings.auto_refresh,
          notifications: localSettings.notifications,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        console.log('📋 [UserMenuHelpers] Using default settings');
        const defaultSettings = getDefaultSettings();
        finalSettings = {
          id: '',
          user_id: userId,
          ...defaultSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }

    console.log('✅ [UserMenuHelpers] User data initialized successfully');
    return {
      settings: finalSettings,
      profile,
      statistics
    };

  } catch (error) {
    console.error('❌ [UserMenuHelpers] Error initializing user data:', error);

    // 최후 수단으로 기본값 반환
    const defaultSettings = getDefaultSettings();
    return {
      settings: {
        id: '',
        user_id: userId,
        ...defaultSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      profile: null,
      statistics: null
    };
  }
}

// 사용자 설정을 전역적으로 적용
export function applyUserSettings(settings: UserSettings | null): void {
  if (!settings) return;

  console.log('🎨 [UserMenuHelpers] Applying user settings:', settings);

  try {
    // 테마 적용
    if (settings.theme && settings.theme !== 'auto') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(settings.theme);
      console.log(`🎨 [UserMenuHelpers] Applied theme: ${settings.theme}`);
    }

    // 언어 설정 저장
    if (settings.language) {
      localStorage.setItem('kryptovision_language', settings.language);
      console.log(`🌍 [UserMenuHelpers] Language set to: ${settings.language}`);
    }

    // 새로고침 간격 설정
    if (settings.auto_refresh && settings.refresh_interval) {
      window.dispatchEvent(new CustomEvent('refreshIntervalChanged', {
        detail: { 
          interval: settings.refresh_interval,
          auto_refresh: settings.auto_refresh
        }
      }));
      console.log(`🔄 [UserMenuHelpers] Refresh interval set to: ${settings.refresh_interval}s (auto: ${settings.auto_refresh})`);
    }

    console.log('✅ [UserMenuHelpers] Settings applied successfully');
  } catch (error) {
    console.error('❌ [UserMenuHelpers] Error applying settings:', error);
  }
}

// 로그인 활동 통계 업데이트
export async function updateLoginActivity(userId: string): Promise<void> {
  try {
    console.log('📊 [UserMenuHelpers] Updating login activity for:', userId);
    
    const now = new Date().toISOString();
    const updates = {
      last_login_at: now,
      total_login_time: 0, // 이 값은 별도 로직으로 관리
    };

    await updateUserStatistics(userId, updates);
    console.log('✅ [UserMenuHelpers] Login activity updated');
  } catch (error) {
    console.error('❌ [UserMenuHelpers] Error updating login activity:', error);
  }
}

// 세션 시작 시간 저장 (로그아웃 시 계산용)
export function startUserSession(userId: string): void {
  try {
    const sessionStart = Date.now();
    sessionStorage.setItem(`session_start_${userId}`, sessionStart.toString());
    console.log('⏰ [UserMenuHelpers] Session started at:', new Date(sessionStart));
  } catch (error) {
    console.error('❌ [UserMenuHelpers] Error starting session:', error);
  }
}

// 세션 종료 및 시간 업데이트
export async function endUserSession(userId: string): Promise<void> {
  try {
    const sessionStartStr = sessionStorage.getItem(`session_start_${userId}`);
    if (!sessionStartStr) return;

    const sessionStart = parseInt(sessionStartStr);
    const sessionEnd = Date.now();
    const sessionDuration = Math.round((sessionEnd - sessionStart) / 1000 / 60); // 분 단위

    console.log(`⏰ [UserMenuHelpers] Session duration: ${sessionDuration} minutes`);

    // 통계 업데이트
    const currentStats = await getUserStatistics(userId);
    if (currentStats) {
      const updates = {
        total_login_time: (currentStats.total_login_time || 0) + sessionDuration,
      };
      await updateUserStatistics(userId, updates);
    }

    // 세션 데이터 정리
    sessionStorage.removeItem(`session_start_${userId}`);
    console.log('✅ [UserMenuHelpers] Session ended and statistics updated');
  } catch (error) {
    console.error('❌ [UserMenuHelpers] Error ending session:', error);
  }
} 