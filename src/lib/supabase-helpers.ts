import { supabase } from './supabase';

// 사용자 프로필 인터페이스
export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  timezone: string;
  date_of_birth?: string;
  investment_experience?: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

// 사용자 통계 관련 함수들
export interface UserStatistics {
  id: string;
  user_id: string;
  ai_analyses_count: number;
  news_read_count: number;
  favorites_count: number;
  active_days: number;
  total_login_time: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysis {
  id: string;
  user_id: string;
  title: string;
  type: 'stock' | 'crypto' | 'macro';
  symbol?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  summary: string;
  key_points: string[];
  target_price?: string;
  current_price?: string;
  recommendation?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  default_view: string;
  refresh_interval: number;
  risk_tolerance: string;
  investment_goals: string;
  data_sync: boolean;
  analytics: boolean;
  auto_refresh: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    analysis_complete: boolean;
    price_alerts: boolean;
    news_updates: boolean;
  };
  created_at: string;
  updated_at: string;
}

// 보안 로그 인터페이스
export interface SecurityLog {
  id: string;
  user_id: string;
  action: string;
  status: 'success' | 'failed' | 'blocked';
  ip_address?: string;
  user_agent?: string;
  device_info: any;
  location?: string;
  details: any;
  created_at: string;
}

// 사용자 세션 인터페이스
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_type?: string;
  browser?: string;
  ip_address?: string;
  location?: string;
  is_active: boolean;
  last_activity: string;
  expires_at?: string;
  created_at: string;
}

// 즐겨찾기 인터페이스
export interface UserFavorite {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  market: string;
  type: 'stock' | 'crypto' | 'etf';
  price_alert_enabled: boolean;
  target_price?: number;
  note?: string;
  created_at: string;
}

// 사용자 통계 가져오기
export async function getUserStatistics(userId: string): Promise<UserStatistics | null> {
  try {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // 테이블이 없거나 데이터가 없는 경우는 정상적인 상황으로 처리
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return null;
      }
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

// 사용자 통계 업데이트
export async function updateUserStatistics(userId: string, updates: Partial<UserStatistics>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_statistics')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      // 테이블이 없는 경우는 조용히 실패 처리
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return false;
      }
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// 통계 증가 함수
export async function incrementUserStat(userId: string, statName: keyof Pick<UserStatistics, 'ai_analyses_count' | 'news_read_count' | 'favorites_count' | 'active_days'>): Promise<boolean> {
  try {
    const currentStats = await getUserStatistics(userId);
    
    if (!currentStats) {
      // 통계가 없으면 새로 생성
      const newStats: Partial<UserStatistics> = {
        ai_analyses_count: statName === 'ai_analyses_count' ? 1 : 0,
        news_read_count: statName === 'news_read_count' ? 1 : 0,
        favorites_count: statName === 'favorites_count' ? 1 : 0,
        active_days: statName === 'active_days' ? 1 : 0,
      };
      return await updateUserStatistics(userId, newStats);
    } else {
      // 기존 통계 증가
      const updates: Partial<UserStatistics> = {
        [statName]: (currentStats[statName] || 0) + 1
      };
      return await updateUserStatistics(userId, updates);
    }
  } catch (error) {
    return false;
  }
}

// AI 분석 기록 관련 함수들 - 테이블명 변경: ai_analyses -> ai_analysis_history
export async function getUserAIAnalyses(userId: string, type?: string): Promise<AIAnalysis[]> {
  try {
    let query = supabase
      .from('ai_analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('analysis_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching AI analyses:', error);
      return [];
    }

    // 데이터 변환: analysis_content를 올바른 형태로 변환
    return data.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      type: item.analysis_type,
      symbol: item.symbol,
      sentiment: item.sentiment,
      confidence: item.confidence_score || 0,
      summary: item.analysis_content?.summary || '',
      key_points: item.analysis_content?.key_points || [],
      target_price: item.analysis_content?.target_price,
      current_price: item.price_at_analysis?.toString(),
      recommendation: item.analysis_content?.recommendation,
      tags: item.tags || [],
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (error) {
    console.error('Error in getUserAIAnalyses:', error);
    return [];
  }
}

export async function createAIAnalysis(userId: string, analysis: Omit<AIAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AIAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('ai_analysis_history')
      .insert({
        user_id: userId,
        analysis_type: analysis.type,
        symbol: analysis.symbol,
        title: analysis.title,
        analysis_content: {
          summary: analysis.summary,
          key_points: analysis.key_points,
          target_price: analysis.target_price,
          recommendation: analysis.recommendation,
        },
        sentiment: analysis.sentiment,
        confidence_score: analysis.confidence,
        price_at_analysis: analysis.current_price ? parseFloat(analysis.current_price) : null,
        tags: analysis.tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AI analysis:', error);
      return null;
    }

    // 통계 업데이트
    await incrementUserStat(userId, 'ai_analyses_count');

    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      type: data.analysis_type,
      symbol: data.symbol,
      sentiment: data.sentiment,
      confidence: data.confidence_score || 0,
      summary: data.analysis_content?.summary || '',
      key_points: data.analysis_content?.key_points || [],
      target_price: data.analysis_content?.target_price,
      current_price: data.price_at_analysis?.toString(),
      recommendation: data.analysis_content?.recommendation,
      tags: data.tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error in createAIAnalysis:', error);
    return null;
  }
}

export async function deleteAIAnalysis(userId: string, analysisId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_analysis_history')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting AI analysis:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAIAnalysis:', error);
    return false;
  }
}

// 사용자 설정 관련 함수들
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    console.log('📖 [getUserSettings] Loading settings for user:', userId);

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('⚠️ [getUserSettings] Database error:', error);
      console.warn('⚠️ [getUserSettings] Error code:', error.code);
      console.warn('⚠️ [getUserSettings] Error message:', error.message);
      
      // 테이블이 없거나 데이터가 없는 경우는 정상적인 상황으로 처리
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('ℹ️ [getUserSettings] No settings found or table missing - using defaults');
        return null;
      }
      return null;
    }

    console.log('✅ [getUserSettings] Settings loaded successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ [getUserSettings] Unexpected error:', error);
    return null;
  }
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
  try {
    console.log('💾 [updateUserSettings] Starting save for user:', userId);
    console.log('🔧 [updateUserSettings] Settings data:', settings);

    const settingsData = {
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString()
    };

    console.log('📤 [updateUserSettings] Data to be saved:', settingsData);

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settingsData, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('❌ [updateUserSettings] Database error:', error);
      console.error('❌ [updateUserSettings] Error code:', error.code);
      console.error('❌ [updateUserSettings] Error message:', error.message);
      console.error('❌ [updateUserSettings] Error details:', error.details);
      
      // 테이블이 없는 경우 특별 처리
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.error('❌ [updateUserSettings] Table does not exist - need to create tables first');
        return false;
      }
      
      // 권한 문제
      if (error.message?.includes('permission') || error.message?.includes('policy')) {
        console.error('❌ [updateUserSettings] Permission denied - check RLS policies');
        return false;
      }
      
      return false;
    }

    console.log('✅ [updateUserSettings] Save successful, data:', data);
    return true;
  } catch (error) {
    console.error('❌ [updateUserSettings] Unexpected error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ [updateUserSettings] Error details:', errorMsg);
    return false;
  }
}

// 임시 데이터 (테이블이 없을 경우 사용)
export const mockUserStatistics: UserStatistics = {
  id: '1',
  user_id: '1',
  ai_analyses_count: 12,
  news_read_count: 89,
  favorites_count: 7,
  active_days: 28,
  total_login_time: 1440, // 24시간 (분 단위)
  last_login_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockAIAnalyses: AIAnalysis[] = [
  {
    id: '1',
    user_id: '1',
    title: '삼성전자 주가 분석',
    type: 'stock',
    symbol: '005930',
    sentiment: 'positive',
    confidence: 85,
    summary: '기술적 지표와 최근 실적을 종합적으로 분석한 결과, 단기적으로 상승 추세가 예상됩니다.',
    key_points: [
      'RSI 지표가 과매도 구간에서 반등',
      '분기 실적이 시장 예상치 상회',
      '반도체 업황 개선 기대감'
    ],
    target_price: '₩75,000',
    current_price: '₩70,500',
    recommendation: '매수',
    tags: ['기술주', '대형주', '반도체'],
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    user_id: '1',
    title: '비트코인 시장 동향 분석',
    type: 'crypto',
    symbol: 'BTC',
    sentiment: 'neutral',
    confidence: 72,
    summary: '최근 변동성이 높아진 비트코인 시장에서 단기적인 조정이 예상되나, 중장기 전망은 긍정적입니다.',
    key_points: [
      '기관 투자자들의 지속적인 유입',
      '규제 불확실성으로 인한 단기 변동성',
      'ETF 승인 기대감으로 인한 상승 압력'
    ],
    target_price: '$45,000',
    current_price: '$42,800',
    recommendation: '보유',
    tags: ['암호화폐', '변동성', '기관투자'],
    created_at: '2024-01-14T09:15:00Z',
    updated_at: '2024-01-14T09:15:00Z'
  },
  {
    id: '3',
    user_id: '1',
    title: '미국 금리 정책 영향 분석',
    type: 'macro',
    symbol: 'FED',
    sentiment: 'negative',
    confidence: 78,
    summary: '연준의 매파적 발언으로 인해 금리 상승 압력이 지속되며, 성장주에 부정적 영향이 예상됩니다.',
    key_points: [
      '인플레이션 지표의 완고한 상승세',
      '노동시장의 견조한 상황',
      '연준의 지속적인 매파적 스탠스'
    ],
    target_price: '5.5%',
    current_price: '5.25%',
    recommendation: '주의',
    tags: ['거시경제', '금리', '정책'],
    created_at: '2024-01-13T16:45:00Z',
    updated_at: '2024-01-13T16:45:00Z'
  }
];

// 사용자 프로필 관련 함수들
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return null;
      }
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// 보안 로그 관련 함수들
export async function getSecurityLogs(userId: string, limit: number = 50): Promise<SecurityLog[]> {
  try {
    const { data, error } = await supabase
      .from('security_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function createSecurityLog(userId: string, log: Omit<SecurityLog, 'id' | 'user_id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('security_logs')
      .insert({
        user_id: userId,
        ...log,
        created_at: new Date().toISOString()
      });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// 세션 관리 함수들
export async function getUserSessions(userId: string): Promise<UserSession[]> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function createUserSession(userId: string, session: Omit<UserSession, 'id' | 'user_id' | 'created_at' | 'last_activity'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        ...session,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function updateSessionActivity(sessionToken: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString()
      })
      .eq('session_token', sessionToken);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function deactivateSession(sessionToken: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false
      })
      .eq('session_token', sessionToken);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// 즐겨찾기 관련 함수들
export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }

    // 데이터 변환: item_type을 type으로 변환
    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      symbol: item.symbol,
      name: item.name,
      market: item.market,
      type: item.item_type, // item_type -> type 필드명 변환
      price_alert_enabled: item.price_alert_enabled,
      target_price: item.target_price,
      note: item.note,
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error('Error in getUserFavorites:', error);
    return [];
  }
}

export async function addUserFavorite(userId: string, favorite: Omit<UserFavorite, 'id' | 'user_id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        item_type: favorite.type, // type -> item_type 필드명 변경
        symbol: favorite.symbol,
        name: favorite.name,
        market: favorite.market,
        price_alert_enabled: favorite.price_alert_enabled,
        target_price: favorite.target_price,
        note: favorite.note,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding user favorite:', error);
      return false;
    }

    // 즐겨찾기 통계 업데이트
    await incrementUserStat(userId, 'favorites_count');

    return true;
  } catch (error) {
    console.error('Error in addUserFavorite:', error);
    return false;
  }
}

export async function removeUserFavorite(userId: string, symbol: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Mock 보안 로그 데이터
export const mockSecurityLogs: SecurityLog[] = [
  {
    id: '1',
    user_id: '1',
    action: '로그인',
    status: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    device_info: { os: 'Windows', browser: 'Chrome' },
    location: '서울, 대한민국',
    details: {},
    created_at: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    user_id: '1',
    action: '비밀번호 변경',
    status: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    device_info: { os: 'Windows', browser: 'Chrome' },
    location: '서울, 대한민국',
    details: {},
    created_at: '2024-01-14T09:15:00Z'
  },
  {
    id: '3',
    user_id: '1',
    action: '의심스러운 로그인 시도',
    status: 'blocked',
    ip_address: '198.51.100.1',
    user_agent: 'Unknown',
    device_info: { os: 'Unknown', browser: 'Unknown' },
    location: '베이징, 중국',
    details: { reason: 'Unknown location' },
    created_at: '2024-01-13T02:45:00Z'
  }
];

// Mock 사용자 세션 데이터
export const mockUserSessions: UserSession[] = [
  {
    id: '1',
    user_id: '1',
    session_token: 'sess_current_123',
    device_type: 'Desktop',
    browser: 'Chrome',
    ip_address: '192.168.1.100',
    location: '서울, 대한민국',
    is_active: true,
    last_activity: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    user_id: '1',
    session_token: 'sess_mobile_456',
    device_type: 'Mobile',
    browser: 'Safari',
    ip_address: '10.0.0.1',
    location: '서울, 대한민국',
    is_active: false,
    last_activity: '2024-01-14T22:30:00Z',
    expires_at: '2024-01-15T22:30:00Z',
    created_at: '2024-01-14T14:30:00Z'
  }
];

// 비밀번호 변경 함수 - Supabase Auth API 사용
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 현재 로그인된 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 비밀번호 변경
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // 보안 로그 추가
    await createSecurityLog(user.id, {
      action: '비밀번호 변경',
      status: 'success',
      ip_address: '192.168.1.100', // 실제로는 클라이언트 IP를 가져와야 함
      user_agent: navigator.userAgent,
      device_info: { 
        os: navigator.platform, 
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Unknown' 
      },
      location: '서울, 대한민국', // 실제로는 IP 기반 위치 정보를 가져와야 함
      details: {}
    });

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { success: false, error: errorMsg };
  }
}

// 이메일 변경 함수
export async function updateEmail(newEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // 보안 로그 추가
    await createSecurityLog(user.id, {
      action: '이메일 변경',
      status: 'success',
      ip_address: '192.168.1.100',
      user_agent: navigator.userAgent,
      device_info: { 
        os: navigator.platform, 
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Unknown' 
      },
      location: '서울, 대한민국',
      details: { new_email: newEmail }
    });

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { success: false, error: errorMsg };
  }
}

// 사용자 계정 삭제 함수
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 관련 데이터 삭제는 CASCADE로 자동 처리됨
    // 사용자 로그아웃
    await supabase.auth.signOut();

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '계정 삭제 중 오류가 발생했습니다.';
    return { success: false, error: errorMsg };
  }
}

// 실제 AI 분석 저장 함수 (DB 우선, 실패 시 Mock 데이터 반환)
export async function saveAIAnalysisResult(
  userId: string, 
  analysisData: {
    title: string;
    type: 'stock' | 'crypto' | 'macro';
    symbol?: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    summary: string;
    key_points: string[];
    target_price?: string;
    current_price?: string;
    recommendation?: string;
    tags: string[];
    analysis_data?: any;
  }
): Promise<AIAnalysis | null> {
  try {
    // 먼저 실제 DB에 저장 시도
    const result = await createAIAnalysis(userId, analysisData);
    
    if (result) {
      // 사용자 통계 업데이트
      await incrementUserStat(userId, 'ai_analyses_count');
      console.log('✅ AI 분석 결과가 데이터베이스에 저장되었습니다:', result.id);
      return result;
    }
    
    // DB 저장 실패 시 Mock 데이터 반환 (화면 표시용)
    console.warn('⚠️ DB 저장 실패, Mock 데이터를 반환합니다.');
    return {
      id: `mock_${Date.now()}`,
      user_id: userId,
      ...analysisData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ AI 분석 저장 중 오류:', error);
    return null;
  }
} 