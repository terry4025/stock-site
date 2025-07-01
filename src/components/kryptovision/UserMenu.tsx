"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  LogOut, 
  Settings, 
  Crown, 
  Brain, 
  Shield,
  LogIn
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { LoginModal } from "./LoginModal";
import ProfileModal from "./ProfileModal";
import { SettingsModal } from "./SettingsModal";
import AIAnalysisHistoryModal from "./AIAnalysisHistoryModal";
import { SecurityModal } from "./SecurityModal";
import { performSecureLogout } from "@/lib/user-menu-helpers";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnalysisHistoryModal, setShowAnalysisHistoryModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  // 프로필 업데이트 이벤트 리스닝
  const [userProfile, setUserProfile] = useState({
    avatar_url: user?.user_metadata?.avatar_url,
    display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0]
  });

  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      setUserProfile(prev => ({
        ...prev,
        ...event.detail
      }));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    // 로컬 스토리지에서 표시 이름 로드
    const savedDisplayName = localStorage.getItem('kryptovision_display_name');
    if (savedDisplayName) {
      setUserProfile(prev => ({
        ...prev,
        display_name: savedDisplayName
      }));
    }
  }, []);

  const handleSignOut = async () => {
    try {
      if (user?.id) {
        // 보안 로그아웃 (이벤트 로깅 포함)
        await performSecureLogout(user.id);
      } else {
        // 일반 로그아웃
        await signOut();
      }
    } catch (error) {
      // 로그아웃 에러는 조용히 처리
      console.error('로그아웃 중 오류:', error);
      await signOut();
    }
  };

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <>
        <Button
          onClick={() => setShowLoginModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <LogIn className="w-4 h-4 mr-2" />
          로그인
        </Button>
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </>
    );
  }

  // 로그인한 경우
  const displayName = userProfile.display_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-800/50">
            <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
              <AvatarImage 
                src={userProfile.avatar_url} 
                alt={displayName} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-900" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64 bg-slate-900/95 border-slate-700 backdrop-blur-xl" 
          align="end"
        >
          <DropdownMenuLabel className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={userProfile.avatar_url} 
                  alt={displayName} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {displayName}
                  </p>
                  <Badge 
                    variant="outline" 
                    className="border-blue-500/30 text-blue-400 text-xs"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {user.email}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">온라인</span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          <DropdownMenuItem 
            className="focus:bg-slate-800/50 text-slate-200 cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          >
            <User className="mr-3 h-4 w-4 text-blue-400" />
            <div className="flex-1">
              <div className="text-sm">내 프로필</div>
              <div className="text-xs text-slate-400">개인 정보 관리</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="focus:bg-slate-800/50 text-slate-200 cursor-pointer"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="mr-3 h-4 w-4 text-purple-400" />
            <div className="flex-1">
              <div className="text-sm">설정</div>
              <div className="text-xs text-slate-400">대시보드 및 알림 설정</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="focus:bg-slate-800/50 text-slate-200 cursor-pointer"
            onClick={() => setShowAnalysisHistoryModal(true)}
          >
            <Brain className="mr-3 h-4 w-4 text-yellow-400" />
            <div className="flex-1">
              <div className="text-sm">AI 분석 기록</div>
              <div className="text-xs text-slate-400">이전 분석 결과 보기</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          <DropdownMenuItem 
            className="focus:bg-slate-800/50 text-slate-200 cursor-pointer"
            onClick={() => setShowSecurityModal(true)}
          >
            <Shield className="mr-3 h-4 w-4 text-green-400" />
            <div className="flex-1">
              <div className="text-sm">보안</div>
              <div className="text-xs text-slate-400">비밀번호 및 2FA 관리</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          <DropdownMenuItem 
            className="focus:bg-red-900/20 text-red-300 cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <div className="text-sm">로그아웃</div>
              <div className="text-xs text-red-400/70">계정에서 안전하게 로그아웃</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 모든 모달들 */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      <SettingsModal 
        open={showSettingsModal} 
        onOpenChange={setShowSettingsModal} 
      />
      <AIAnalysisHistoryModal
        isOpen={showAnalysisHistoryModal}
        onClose={() => setShowAnalysisHistoryModal(false)}
      />
      <SecurityModal 
        open={showSecurityModal} 
        onOpenChange={setShowSecurityModal} 
      />
    </>
  );
} 