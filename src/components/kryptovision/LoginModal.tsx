"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Eye, EyeOff, Mail, Lock, User, ArrowRight, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsEmailConfirmation(false);

    try {
      const { error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        // 이메일 인증 확인 처리 (한국어 메시지에 맞게 수정)
        if (signInError.message && (
          signInError.message.includes("이메일 인증") || 
          signInError.message.toLowerCase().includes("email not confirmed")
        )) {
          setNeedsEmailConfirmation(true);
          setError("이메일 인증이 필요합니다. 이메일을 확인하거나 인증 메일을 재전송하세요.");
        } else {
          setError(signInError.message || "로그인에 실패했습니다.");
        }
      } else {
        onOpenChange(false);
        setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setResendingEmail(true);
    setError(null);

    try {
      const { error: resendError } = await resendConfirmation(formData.email);
      
      if (resendError) {
        setError(resendError.message || "이메일 재전송에 실패했습니다.");
      } else {
        setError(null);
        alert("인증 이메일이 재전송되었습니다. 이메일을 확인해주세요.");
        setNeedsEmailConfirmation(false);
      }
    } catch (err) {
      setError("이메일 재전송 중 오류가 발생했습니다.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
      });
      
      if (signUpError) {
        setError(signUpError.message || "회원가입에 실패했습니다.");
      } else {
        setError(null);
        setActiveTab("signin");
        alert("회원가입이 완료되었습니다! 이메일을 확인해주세요.");
        setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-slate-900/95 border-slate-700 backdrop-blur-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                학썜의리딩방
              </DialogTitle>
              <span className="text-sm text-slate-400 -mt-1">
                AI 투자 분석 플랫폼
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 text-center">
            투자의 새로운 시각을 제공하는 학썜의 리딩 AI 금융 대시보드
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="signin" className="data-[state=active]:bg-blue-600">
              로그인
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600">
              회원가입
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg text-slate-100">계정에 로그인</CardTitle>
                <CardDescription className="text-slate-400">
                  이메일과 비밀번호로 학썜의리딩방에 접속하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-slate-200">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-slate-200">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-slate-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="bg-red-900/20 border-red-800 text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {needsEmailConfirmation && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendConfirmation}
                        disabled={resendingEmail}
                        className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600/10"
                      >
                        {resendingEmail ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                            <span>전송 중...</span>
                          </div>
                        ) : (
                          "인증 이메일 재전송"
                        )}
                      </Button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>로그인 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>로그인</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg text-slate-100">새 계정 만들기</CardTitle>
                <CardDescription className="text-slate-400">
                  학썜의리딩방에 가입하여 개인화된 투자 분석을 받아보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-slate-200">이름</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="홍길동"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-200">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-200">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="최소 6자 이상"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-slate-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-slate-200">비밀번호 확인</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert className="bg-red-900/20 border-red-800 text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>가입 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>회원가입</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="bg-slate-700" />

        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Badge variant="outline" className="border-blue-500/30 text-blue-400">
            AI 기반
          </Badge>
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            실시간 데이터
          </Badge>
          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
            개인화
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
} 