"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Pause, Play, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface RealtimeStatusProps {
  isEnabled: boolean;
  lastUpdateTime: Date | null;
  onToggle: () => void;
  ticker: string;
}

export default function RealtimeStatus({ 
  isEnabled, 
  lastUpdateTime, 
  onToggle, 
  ticker 
}: RealtimeStatusProps) {
  const { t, language } = useLanguage();
  const [timeAgo, setTimeAgo] = useState<string>("");

  // 마지막 업데이트 시간으로부터 경과 시간 계산
  useEffect(() => {
    if (!lastUpdateTime) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds}${t('time_ago_seconds')}`);
      } else {
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${diffInMinutes}${t('time_ago_minutes')}`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdateTime, language]);

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
      {/* 실시간 상태 인디케이터 */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
        <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
          {isEnabled ? t('realtime_status') : t('realtime_paused')}
        </Badge>
      </div>

      {/* 마지막 업데이트 시간 */}
      {lastUpdateTime && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      )}

      {/* 업데이트 주기 표시 */}
      <div className="text-xs text-gray-500">
        {t('realtime_interval')}
      </div>

      {/* 토글 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`text-xs transition-all duration-200 ${
          isEnabled 
            ? 'border-green-500/50 text-green-500 hover:bg-green-500/10' 
            : 'border-gray-500/50 text-gray-400 hover:bg-gray-500/10'
        }`}
      >
        {isEnabled ? (
          <>
            <Pause className="w-3 h-3 mr-1" />
            {t('realtime_pause')}
          </>
        ) : (
          <>
            <Play className="w-3 h-3 mr-1" />
            {t('realtime_resume')}
          </>
        )}
      </Button>

      {/* 수동 새로고침 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        {t('realtime_refresh')}
      </Button>
    </div>
  );
} 