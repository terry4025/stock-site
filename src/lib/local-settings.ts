// 로컬 스토리지 기반 설정 백업 시스템
interface LocalUserSettings {
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
}

const LOCAL_SETTINGS_KEY = 'kryptovision_user_settings';

export function saveSettingsToLocal(userId: string, settings: LocalUserSettings): boolean {
  try {
    const settingsWithUser = {
      userId,
      settings,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settingsWithUser));
    console.log('✅ [LocalSettings] Settings saved to localStorage for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ [LocalSettings] Failed to save to localStorage:', error);
    return false;
  }
}

export function loadSettingsFromLocal(userId: string): LocalUserSettings | null {
  try {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!saved) {
      console.log('ℹ️ [LocalSettings] No settings found in localStorage');
      return null;
    }

    const parsed = JSON.parse(saved);
    if (parsed.userId === userId) {
      console.log('✅ [LocalSettings] Settings loaded from localStorage for user:', userId);
      return parsed.settings;
    } else {
      console.log('ℹ️ [LocalSettings] Settings found but for different user');
      return null;
    }
  } catch (error) {
    console.error('❌ [LocalSettings] Failed to load from localStorage:', error);
    return null;
  }
}

export function clearLocalSettings(): void {
  try {
    localStorage.removeItem(LOCAL_SETTINGS_KEY);
    console.log('✅ [LocalSettings] Local settings cleared');
  } catch (error) {
    console.error('❌ [LocalSettings] Failed to clear local settings:', error);
  }
}

export function getDefaultSettings(): LocalUserSettings {
  return {
    theme: "dark",
    language: "ko",
    default_view: "dashboard",
    refresh_interval: 30,
    risk_tolerance: "medium",
    investment_goals: "growth",
    data_sync: true,
    analytics: true,
    auto_refresh: true,
    notifications: {
      email: true,
      push: true,
      analysis_complete: true,
      price_alerts: true,
      news_updates: false,
    },
  };
} 