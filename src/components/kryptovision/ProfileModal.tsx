"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { getUserProfile, upsertUserProfile, type UserProfile } from "@/lib/user-menu-helpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Globe, TrendingUp, DollarSign, Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user?.id || "",
    display_name: "",
    first_name: "",
    last_name: "",
    bio: "",
    phone: "",
    country: "",
    timezone: "",
    investment_experience: "beginner",
    preferred_markets: [],
    investment_budget_range: "under_1k",
    avatar_url: ""
  });

  // 프로필 데이터 로드
  useEffect(() => {
    if (isOpen && user?.id) {
      loadProfile();
    }
  }, [isOpen, user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await getUserProfile(user.id);
      
      if (result.success && result.data) {
        setProfile(result.data);
        console.log('👤 [ProfileModal] Profile loaded successfully');
      } else {
        // 새 사용자의 경우 기본값 설정
        setProfile(prev => ({
          ...prev,
          user_id: user.id,
          display_name: user.email?.split('@')[0] || ""
        }));
        console.log('👤 [ProfileModal] New user, using default profile');
      }
    } catch (error) {
      console.error('❌ [ProfileModal] Error loading profile:', error);
      setMessage("프로필을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setMessage("로그인이 필요합니다.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      console.log('🔄 [ProfileModal] Attempting to save profile...');
      
      const result = await upsertUserProfile({
        ...profile,
        user_id: user.id
      });
      
      console.log('📝 [ProfileModal] Upsert result:', result);
      
      if (result.success) {
        setMessage("프로필이 성공적으로 저장되었습니다.");
        
        // 프로필 이미지가 변경된 경우 즉시 적용
        if (profile.avatar_url) {
          // 전역 이벤트 발생으로 헤더의 아바타 업데이트
          window.dispatchEvent(new CustomEvent('profileUpdated', {
            detail: { 
              avatar_url: profile.avatar_url,
              display_name: profile.display_name 
            }
          }));
        }
        
        // 사용자 이름이 변경된 경우 로컬 스토리지도 업데이트
        if (profile.display_name) {
          localStorage.setItem('kryptovision_display_name', profile.display_name);
        }
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        console.error('❌ [ProfileModal] Profile save failed:', result.error);
        
        // 에러 타입에 따른 구체적인 메시지
        let errorMessage = "프로필 저장에 실패했습니다.";
        
        if (result.error?.code === '42P01') {
          errorMessage = "데이터베이스 테이블이 준비되지 않았습니다. 관리자에게 문의하세요.";
        } else if (result.error?.code === '23505') {
          errorMessage = "이미 존재하는 프로필입니다.";
        } else if (result.error?.message?.includes('permission')) {
          errorMessage = "프로필 저장 권한이 없습니다. 로그인을 다시 시도해주세요.";
        } else if (result.error?.message) {
          errorMessage = `저장 오류: ${result.error.message}`;
        }
        
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('❌ [ProfileModal] Unexpected error saving profile:', error);
      setMessage("프로필 저장 중 예상치 못한 오류가 발생했습니다. 페이지를 새로고침 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarketToggle = (market: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferred_markets: checked 
        ? [...(prev.preferred_markets || []), market]
        : (prev.preferred_markets || []).filter(m => m !== market)
    }));
  };

  const marketOptions = [
    { value: 'stocks', label: '주식' },
    { value: 'crypto', label: '암호화폐' },
    { value: 'forex', label: '외환' },
    { value: 'commodities', label: '원자재' },
    { value: 'bonds', label: '채권' },
    { value: 'etf', label: 'ETF' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            내 프로필
          </DialogTitle>
          <DialogDescription>
            개인 정보와 투자 선호도를 관리하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 프로필 사진 & 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 프로필 사진 */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">프로필 이미지 URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="avatar_url"
                      placeholder="https://example.com/avatar.jpg"
                      value={profile.avatar_url || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, avatar_url: e.target.value }))}
                    />
                    <Button size="sm" variant="outline">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">이름</Label>
                  <Input
                    id="first_name"
                    placeholder="홍"
                    value={profile.first_name || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">성</Label>
                  <Input
                    id="last_name"
                    placeholder="길동"
                    value={profile.last_name || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">표시 이름</Label>
                <Input
                  id="display_name"
                  placeholder="홍길동"
                  value={profile.display_name || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  placeholder="투자에 관심이 많은 개발자입니다..."
                  value={profile.bio || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 연락 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-4 w-4" />
                연락 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  placeholder="+82 10-1234-5678"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">국가</Label>
                  <Select
                    value={profile.country || ""}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="국가 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KR">대한민국</SelectItem>
                      <SelectItem value="US">미국</SelectItem>
                      <SelectItem value="JP">일본</SelectItem>
                      <SelectItem value="CN">중국</SelectItem>
                      <SelectItem value="EU">유럽</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <Select
                    value={profile.timezone || ""}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="시간대 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">KST (한국 표준시)</SelectItem>
                      <SelectItem value="America/New_York">EST (동부 표준시)</SelectItem>
                      <SelectItem value="America/Los_Angeles">PST (태평양 표준시)</SelectItem>
                      <SelectItem value="Europe/London">GMT (그리니치 표준시)</SelectItem>
                      <SelectItem value="Asia/Tokyo">JST (일본 표준시)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 투자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                투자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investment_experience">투자 경험</Label>
                <Select
                  value={profile.investment_experience || "beginner"}
                  onValueChange={(value: any) => setProfile(prev => ({ ...prev, investment_experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">초보자 (1년 미만)</SelectItem>
                    <SelectItem value="intermediate">중급자 (1-5년)</SelectItem>
                    <SelectItem value="advanced">고급자 (5년 이상)</SelectItem>
                    <SelectItem value="professional">전문가 (10년 이상)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>관심 시장</Label>
                <div className="grid grid-cols-2 gap-2">
                  {marketOptions.map((market) => (
                    <div key={market.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={market.value}
                        checked={(profile.preferred_markets || []).includes(market.value)}
                        onCheckedChange={(checked) => handleMarketToggle(market.value, checked as boolean)}
                      />
                      <Label htmlFor={market.value} className="text-sm">{market.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment_budget_range">투자 예산 범위</Label>
                <Select
                  value={profile.investment_budget_range || "under_1k"}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, investment_budget_range: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_1k">100만원 미만</SelectItem>
                    <SelectItem value="1k_10k">100만원 - 1,000만원</SelectItem>
                    <SelectItem value="10k_100k">1,000만원 - 1억원</SelectItem>
                    <SelectItem value="over_100k">1억원 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 메시지 표시 */}
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 