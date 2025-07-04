"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Monitor, 
  Zap,
  Save,
  RefreshCw,
  Brain,
  Sparkles,
  FileText,
  History,
  Trash2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSettings, updateUserSettings, UserSettings } from "@/lib/supabase-helpers";
import { saveSettingsToLocal, loadSettingsFromLocal, getDefaultSettings } from "@/lib/local-settings";
import { initializeSupabase } from "@/lib/supabase-test";
import { 
  getUserSystemPrompt, 
  saveUserSystemPrompt, 
  getUserPromptHistory,
  deleteUserSystemPrompt,
  activateSystemPrompt,
  DEFAULT_SYSTEM_PROMPT,
  SYSTEM_PROMPT_TEMPLATES
} from "@/lib/system-prompts";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  // AI 시스템 프롬프트 상태
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [promptName, setPromptName] = useState('');
  const [promptHistory, setPromptHistory] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [savingPrompt, setSavingPrompt] = useState(false);
  
  const [settings, setSettings] = useState({
    // 대시보드 설정
    theme: "dark",
    language: "ko",
    refresh_interval: 30,
    default_view: "dashboard",
    
    // 개인화 설정
    risk_tolerance: "medium",
    investment_goals: "growth",
    
    // 고급 설정
    data_sync: true,
    analytics: true,
    auto_refresh: true,
    
    // 알림 설정
    notifications: {
      email: true,
      push: true,
      analysis_complete: true,
      price_alerts: true,
      news_updates: false,
    },
  });

  // Supabase 초기화 및 사용자 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id || !open) return;
      
      setSettingsLoading(true);
      try {
        console.log('📖 [SettingsModal] Loading settings for user:', user.id);

        // 0. Supabase 초기화 확인
        console.log('🔧 [SettingsModal] Checking Supabase initialization...');
        const initResult = await initializeSupabase();
        console.log('🔧 [SettingsModal] Supabase init result:', initResult);

        // 1. 먼저 DB에서 설정 로드 시도 (초기화 성공한 경우만)
        if (initResult.success) {
          const userSettings = await getUserSettings(user.id);
          if (userSettings) {
            console.log('✅ [SettingsModal] Settings loaded from database');
            setSettings({
              theme: userSettings.theme,
              language: userSettings.language,
              refresh_interval: userSettings.refresh_interval,
              default_view: userSettings.default_view,
              risk_tolerance: userSettings.risk_tolerance,
              investment_goals: userSettings.investment_goals,
              data_sync: userSettings.data_sync,
              analytics: userSettings.analytics,
              auto_refresh: userSettings.auto_refresh,
              notifications: userSettings.notifications || {
                email: true,
                push: true,
                analysis_complete: true,
                price_alerts: true,
                news_updates: false,
              },
            });
            return;
          }
        }

        // 2. DB 실패 시 로컬 스토리지에서 로드
        console.log('⚠️ [SettingsModal] DB load failed, trying localStorage');
        const localSettings = loadSettingsFromLocal(user.id);
        if (localSettings) {
          console.log('✅ [SettingsModal] Settings loaded from localStorage');
          setSettings(localSettings);
          return;
        }

        // 3. 모든 방법이 실패하면 기본값 사용
        console.log('ℹ️ [SettingsModal] Using default settings');
        setSettings(getDefaultSettings());

      } catch (error) {
        console.error('❌ [SettingsModal] Error loading settings:', error);
        // 최후 수단으로 기본값 사용
        setSettings(getDefaultSettings());
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, [user?.id, open]);

  // 시스템 프롬프트 로드
  useEffect(() => {
    const loadPrompts = async () => {
      if (!user?.id || !open) return;
      
      try {
        // 현재 활성 프롬프트 로드
        const { prompt, isCustom } = await getUserSystemPrompt(user.id);
        setSystemPrompt(prompt);
        
        // 프롬프트 히스토리 로드
        const history = await getUserPromptHistory(user.id);
        setPromptHistory(history);
        
        console.log('🤖 [SettingsModal] System prompts loaded');
      } catch (error) {
        console.error('❌ [SettingsModal] Error loading prompts:', error);
      }
    };

    loadPrompts();
  }, [user?.id, open]);

  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSelect = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSlider = (key: string, value: number[]) => {
    setSettings(prev => ({ ...prev, [key]: value[0] }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!user?.id) {
      setMessage("로그인이 필요합니다.");
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      console.log('💾 [SettingsModal] Saving settings for user:', user.id);
      console.log('🔧 [SettingsModal] Settings to save:', settings);

      const settingsToSave = {
        theme: settings.theme,
        language: settings.language,
        refresh_interval: settings.refresh_interval,
        default_view: settings.default_view,
        risk_tolerance: settings.risk_tolerance,
        investment_goals: settings.investment_goals,
        data_sync: settings.data_sync,
        analytics: settings.analytics,
        auto_refresh: settings.auto_refresh,
        notifications: settings.notifications,
      };

      // 🎯 일단 로컬 스토리지에 저장 (즉시 적용)
      const localSuccess = saveSettingsToLocal(user.id, settings);
      
      if (localSuccess) {
        console.log('✅ [SettingsModal] Settings saved to localStorage');
        setMessage("설정이 성공적으로 저장되었습니다.");
        
        // 🔄 설정 즉시 적용: 새로고침 간격 및 자동 새로고침 업데이트
        console.log(`🔄 [SettingsModal] Applying auto refresh: ${settings.auto_refresh}, interval: ${settings.refresh_interval} seconds`);
        
        // 전역 설정 업데이트 이벤트 발생
        window.dispatchEvent(new CustomEvent('refreshIntervalChanged', {
          detail: { 
            interval: settings.refresh_interval,
            auto_refresh: settings.auto_refresh
          }
        }));
        
        // 🎨 테마 즉시 적용
        if (settings.theme !== 'auto') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(settings.theme);
          console.log(`🎨 [SettingsModal] Applied theme: ${settings.theme}`);
        }
        
        // 🌍 언어 설정 즉시 적용 (필요시)
        if (settings.language) {
          console.log(`🌍 [SettingsModal] Language set to: ${settings.language}`);
          localStorage.setItem('kryptovision_language', settings.language);
        }
        
        // 백그라운드에서 DB 저장 시도 (실패해도 무시)
        updateUserSettings(user.id, settingsToSave)
          .then(dbSuccess => {
            if (dbSuccess) {
              console.log('✅ [SettingsModal] Background DB save successful');
            } else {
              console.warn('⚠️ [SettingsModal] Background DB save failed (ignored)');
            }
          })
          .catch(error => {
            console.warn('⚠️ [SettingsModal] Background DB save error (ignored):', error);
          });
        
        return;
      } else {
        console.error('❌ [SettingsModal] localStorage save failed');
        setMessage("설정 저장에 실패했습니다. 브라우저 설정을 확인해주세요.");
      }

    } catch (error) {
      console.error('❌ [SettingsModal] Settings save error:', error);
      const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
      setMessage(`설정 저장에 실패했습니다: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      theme: "dark",
      language: "ko",
      refresh_interval: 30,
      default_view: "dashboard",
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
    });
    setMessage("기본 설정으로 복원되었습니다.");
  };

  if (settingsLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-slate-900/95 border-slate-700 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              설정
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900/95 border-slate-700 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            설정
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600">
              <Monitor className="w-4 h-4 mr-2" />
              대시보드
            </TabsTrigger>
            <TabsTrigger value="personalization" className="data-[state=active]:bg-purple-600">
              <Zap className="w-4 h-4 mr-2" />
              개인화
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              고급
            </TabsTrigger>
            <TabsTrigger value="ai-prompt" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              AI 프롬프트
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100">대시보드 설정</CardTitle>
                <CardDescription className="text-slate-400">
                  대시보드의 모양과 동작을 설정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">테마</Label>
                    <Select value={settings.theme} onValueChange={(value) => handleSelect("theme", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="dark">다크</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">언어</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSelect("language", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">기본 화면</Label>
                  <Select value={settings.default_view} onValueChange={(value) => handleSelect("default_view", value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="dashboard">대시보드</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-200">자동 새로고침 간격 (초)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.refresh_interval]}
                      onValueChange={(value) => handleSlider("refresh_interval", value)}
                      max={300}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <div className="text-sm text-slate-400 text-center">
                      {settings.refresh_interval}초마다 새로고침
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personalization" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100">개인화 설정</CardTitle>
                <CardDescription className="text-slate-400">
                  투자 성향과 관심사를 설정하여 맞춤형 분석을 받아보세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">위험 성향</Label>
                    <Select value={settings.risk_tolerance} onValueChange={(value) => handleSelect("risk_tolerance", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="conservative">보수적</SelectItem>
                        <SelectItem value="medium">중간</SelectItem>
                        <SelectItem value="aggressive">공격적</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">투자 목표</Label>
                    <Select value={settings.investment_goals} onValueChange={(value) => handleSelect("investment_goals", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="growth">성장</SelectItem>
                        <SelectItem value="income">수익</SelectItem>
                        <SelectItem value="balanced">균형</SelectItem>
                        <SelectItem value="preservation">보존</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100">고급 설정</CardTitle>
                <CardDescription className="text-slate-400">
                  고급 사용자를 위한 설정입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-200">데이터 동기화</Label>
                    <p className="text-sm text-slate-400">클라우드와 실시간 동기화</p>
                  </div>
                  <Switch
                    checked={settings.data_sync}
                    onCheckedChange={(checked) => handleToggle("data_sync", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-200">사용 통계</Label>
                    <p className="text-sm text-slate-400">서비스 개선을 위한 익명 통계 수집</p>
                  </div>
                  <Switch
                    checked={settings.analytics}
                    onCheckedChange={(checked) => handleToggle("analytics", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-200">자동 새로고침</Label>
                    <p className="text-sm text-slate-400">백그라운드에서 자동으로 데이터 업데이트</p>
                  </div>
                  <Switch
                    checked={settings.auto_refresh}
                    onCheckedChange={(checked) => handleToggle("auto_refresh", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-prompt" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  AI 시스템 프롬프트
                </CardTitle>
                <CardDescription className="text-slate-400">
                  AI 분석의 성격과 스타일을 설정하세요. 투자 전략가의 페르소나를 정의합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 템플릿 선택 */}
                <div className="space-y-2">
                  <Label className="text-slate-200">템플릿 선택</Label>
                  <Select value={selectedTemplate} onValueChange={(value) => {
                    setSelectedTemplate(value);
                    if (value === 'default') {
                      setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
                    } else if (value in SYSTEM_PROMPT_TEMPLATES) {
                      const template = SYSTEM_PROMPT_TEMPLATES[value as keyof typeof SYSTEM_PROMPT_TEMPLATES];
                      setSystemPrompt(template.prompt);
                    }
                  }}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="custom">사용자 정의</SelectItem>
                      <SelectItem value="default">기본 프롬프트</SelectItem>
                      <SelectItem value="aggressive">공격적 투자자</SelectItem>
                      <SelectItem value="conservative">보수적 투자자</SelectItem>
                      <SelectItem value="balanced">균형 투자자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 프롬프트 이름 */}
                <div className="space-y-2">
                  <Label className="text-slate-200">프롬프트 이름 (선택사항)</Label>
                  <input
                    type="text"
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                    placeholder="예: 성장주 전문가, 가치투자 분석가..."
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500"
                  />
                </div>

                {/* 프롬프트 편집기 */}
                <div className="space-y-2">
                  <Label className="text-slate-200">시스템 프롬프트</Label>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="AI의 성격과 분석 스타일을 정의하세요..."
                    className="min-h-[300px] bg-slate-700/50 border-slate-600 text-slate-200 placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-500">
                    {systemPrompt.length} / 10000 자
                  </p>
                </div>

                {/* 저장 버튼 */}
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      if (!user?.id) {
                        setMessage('로그인이 필요합니다.');
                        return;
                      }
                      
                      setSavingPrompt(true);
                      try {
                        const result = await saveUserSystemPrompt(
                          user.id, 
                          systemPrompt, 
                          promptName || 'Custom Prompt'
                        );
                        
                        if (result.success) {
                          setMessage('AI 프롬프트가 저장되었습니다.');
                          // 히스토리 새로고침
                          const history = await getUserPromptHistory(user.id);
                          setPromptHistory(history);
                        } else {
                          setMessage('프롬프트 저장에 실패했습니다.');
                        }
                      } catch (error) {
                        console.error('프롬프트 저장 오류:', error);
                        setMessage('프롬프트 저장 중 오류가 발생했습니다.');
                      } finally {
                        setSavingPrompt(false);
                      }
                    }}
                    disabled={savingPrompt || !systemPrompt}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {savingPrompt ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>저장 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>프롬프트 저장</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* 프롬프트 히스토리 */}
                {promptHistory.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-slate-200 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      저장된 프롬프트
                    </Label>
                    <ScrollArea className="h-[200px] w-full rounded-md border border-slate-700 p-4">
                      <div className="space-y-2">
                        {promptHistory.map((item) => (
                          <div 
                            key={item.id} 
                            className={`p-3 rounded-lg bg-slate-800/50 border ${
                              item.is_active ? 'border-purple-500' : 'border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-slate-200">
                                  {item.name}
                                  {item.is_active && (
                                    <span className="ml-2 text-xs text-purple-400">(활성)</span>
                                  )}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {!item.is_active && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={async () => {
                                      const result = await activateSystemPrompt(user!.id, item.id);
                                      if (result.success) {
                                        setMessage('프롬프트가 활성화되었습니다.');
                                        const history = await getUserPromptHistory(user!.id);
                                        setPromptHistory(history);
                                        setSystemPrompt(item.prompt);
                                      }
                                    }}
                                    className="text-green-400 hover:text-green-300"
                                  >
                                    활성화
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={async () => {
                                    if (confirm('이 프롬프트를 삭제하시겠습니까?')) {
                                      const result = await deleteUserSystemPrompt(user!.id, item.id);
                                      if (result.success) {
                                        setMessage('프롬프트가 삭제되었습니다.');
                                        const history = await getUserPromptHistory(user!.id);
                                        setPromptHistory(history);
                                      }
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {message && (
          <Alert className={`${message.includes('성공') ? 'bg-green-900/20 border-green-800 text-green-200' : 'bg-red-900/20 border-red-800 text-red-200'}`}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            기본값 복원
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>저장 중...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>저장</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 