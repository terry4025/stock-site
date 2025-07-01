"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Copy,
  Check,
  AlertTriangle,
  Clock,
  MapPin,
  Monitor,
  Save,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getUserSecurity,
  updateUserSecurity,
  getSecurityEvents,
  logSecurityEvent,
  type UserSecurity
} from "@/lib/user-menu-helpers";
import { updatePassword } from "@/lib/supabase-helpers";

interface SecurityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SecurityModal({ open, onOpenChange }: SecurityModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [copied, setCopied] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
    deviceManagement: true,
    sessionTimeout: 30
  });

  // 실제 보안 데이터
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [userSecurity, setUserSecurity] = useState<UserSecurity | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // 보안 데이터 로드
  useEffect(() => {
    const loadSecurityData = async () => {
      if (!user?.id || !open) return;
      
      setDataLoading(true);
      try {
        // 보안 설정 로드
        const securityResult = await getUserSecurity(user.id);
        if (securityResult.success && securityResult.data) {
          setUserSecurity(securityResult.data);
          setSecuritySettings({
            twoFactorEnabled: securityResult.data.two_factor_enabled || false,
            loginAlerts: securityResult.data.login_notifications || true,
            suspiciousActivityAlerts: securityResult.data.security_alerts || true,
            deviceManagement: true,
            sessionTimeout: 30
          });
        }

        // 보안 이벤트 로드
        const eventsResult = await getSecurityEvents(user.id, 20);
        if (eventsResult.success) {
          setSecurityEvents(eventsResult.data || []);
        }
      } catch (error) {
        console.error('Error loading security data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadSecurityData();
  }, [user?.id, open]);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSecurityToggle = (key: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage("모든 필드를 입력해주세요.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 실제 비밀번호 변경 (Supabase Auth 사용)
      const result = await updatePassword(passwordForm.newPassword);
      
      if (result.success) {
        // 보안 이벤트 로깅
        if (user?.id) {
          await logSecurityEvent(
            user.id,
            'password_change',
            'Password changed successfully',
            true
          );
          
          // 보안 설정 업데이트
          await updateUserSecurity({
            user_id: user.id,
            password_changed_at: new Date().toISOString(),
            ...userSecurity
          });
        }
        
        setMessage("비밀번호가 성공적으로 변경되었습니다.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage(result.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      setMessage("비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = async () => {
    setLoading(true);
    try {
      // TODO: 2FA 설정 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
      setMessage(securitySettings.twoFactorEnabled ? "2FA가 비활성화되었습니다." : "2FA가 활성화되었습니다.");
    } catch (error) {
      setMessage("2FA 설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codes = ["ABC123", "DEF456", "GHI789", "JKL012", "MNO345"];
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "성공": return "text-green-400 bg-green-900/20 border-green-700";
      case "차단됨": return "text-red-400 bg-red-900/20 border-red-700";
      default: return "text-slate-400 bg-slate-900/20 border-slate-700";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900/95 border-slate-700 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            보안 설정
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="password" className="data-[state=active]:bg-green-600">
              <Key className="w-4 h-4 mr-2" />
              비밀번호
            </TabsTrigger>
            <TabsTrigger value="2fa" className="data-[state=active]:bg-green-600">
              <Smartphone className="w-4 h-4 mr-2" />
              2FA
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-green-600">
              <Eye className="w-4 h-4 mr-2" />
              활동 기록
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100">비밀번호 변경</CardTitle>
                <CardDescription className="text-slate-400">
                  보안을 위해 정기적으로 비밀번호를 변경하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-200">현재 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="현재 비밀번호를 입력하세요"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-slate-100 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("current")}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-200">새 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="새 비밀번호를 입력하세요"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-slate-100 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200">비밀번호 확인</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-slate-100 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-200 mb-2">비밀번호 요구사항:</h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• 최소 8자 이상</li>
                    <li>• 대문자와 소문자 포함</li>
                    <li>• 숫자 포함</li>
                    <li>• 특수문자 포함</li>
                  </ul>
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>변경 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>비밀번호 변경</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="2fa" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                  2단계 인증 (2FA)
                  {securitySettings.twoFactorEnabled && (
                    <Badge variant="outline" className="border-green-600 text-green-400">
                      <Shield className="w-3 h-3 mr-1" />
                      활성화됨
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  계정 보안을 강화하기 위해 2단계 인증을 설정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-200">2단계 인증</Label>
                    <p className="text-sm text-slate-400">로그인 시 추가 보안 코드 요구</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={handle2FASetup}
                    disabled={loading}
                  />
                </div>

                {securitySettings.twoFactorEnabled && (
                  <>
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-200 mb-3">백업 코드</h4>
                      <p className="text-xs text-slate-400 mb-3">
                        인증 앱에 접근할 수 없을 때 사용할 수 있는 일회용 백업 코드입니다.
                      </p>
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-600 font-mono text-sm text-slate-300">
                        ABC123   DEF456   GHI789<br/>
                        JKL012   MNO345
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyBackupCodes}
                        className="mt-3 border-slate-600 text-slate-300"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            복사
                          </>
                        )}
                      </Button>
                    </div>

                    <Alert className="bg-amber-900/20 border-amber-800 text-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        백업 코드를 안전한 곳에 보관하세요. 각 코드는 한 번만 사용할 수 있습니다.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-200">로그인 알림</Label>
                      <p className="text-sm text-slate-400">새로운 기기에서 로그인 시 이메일 알림</p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => handleSecurityToggle("loginAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-200">의심스러운 활동 알림</Label>
                      <p className="text-sm text-slate-400">비정상적인 접근 시도 시 알림</p>
                    </div>
                    <Switch
                      checked={securitySettings.suspiciousActivityAlerts}
                      onCheckedChange={(checked) => handleSecurityToggle("suspiciousActivityAlerts", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100">최근 활동</CardTitle>
                <CardDescription className="text-slate-400">
                  계정의 최근 로그인 및 보안 활동을 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-slate-300" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{activity.action}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-2">
                            <span>{activity.device_info?.browser || 'Unknown Device'}</span>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{activity.location || 'Unknown Location'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(activity.created_at).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  더 많은 활동 보기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {message && (
          <Alert className={message.includes("실패") ? "bg-red-900/20 border-red-800 text-red-200" : "bg-green-900/20 border-green-800 text-green-200"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
} 