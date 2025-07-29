'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsArticle } from '@/lib/types';
import { getGlobalSchedule, getGlobalWallStreetComments } from '@/app/actions';
import MarketSchedule from './MarketSchedule';
import WallStreetComments from './WallStreetComments';

interface SidebarInfoProps {
  marketNews: NewsArticle[];
}

interface SidebarState {
  globalSchedule: string[];
  wallStreetComments: string[];
  isLoading: boolean;
}

export default function SidebarInfo({ marketNews }: SidebarInfoProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    globalSchedule: [],
    wallStreetComments: [],
    isLoading: true
  });

  // 📅 전역 일정 정보 및 💬 월가의 말말말 로드
  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const [schedule, comments] = await Promise.all([
          getGlobalSchedule(),
          getGlobalWallStreetComments()
        ]);
        setSidebarState({
          globalSchedule: schedule,
          wallStreetComments: comments,
          isLoading: false
        });
      } catch (error) {
        console.error('[SidebarInfo] 전역 데이터 로드 실패:', error);
        setSidebarState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadGlobalData();
  }, []);

  // 📅 일정 정보 추출 (시장 뉴스나 전역 스케줄에서)
  const scheduleInfo = (() => {
    // 1. 시장 뉴스에서 일정 정보 찾기
    const marketArticleWithSchedule = marketNews?.find(article => 
      article.schedule && article.schedule.length > 0
    );
    
    if (marketArticleWithSchedule?.schedule) {
      return {
        schedule: marketArticleWithSchedule.schedule,
        title: marketArticleWithSchedule.scheduleTitle || '📅 다음날 주요 일정'
      };
    }
    
    // 2. 전역 스케줄 사용
    if (sidebarState.globalSchedule && sidebarState.globalSchedule.length > 0) {
      return {
        schedule: sidebarState.globalSchedule,
        title: '📅 다음날 주요 일정'
      };
    }
    
    return null;
  })();

  //  월가의 말말말 정보 추출 (시장 뉴스나 전역에서)
  const wallStreetInfo = (() => {
    // 1. 시장 뉴스에서 월가 코멘트 찾기
    const marketArticleWithComments = marketNews?.find(article => 
      article.wallStreetComments && article.wallStreetComments.length > 0
    );
    
    if (marketArticleWithComments?.wallStreetComments) {
      return {
        comments: marketArticleWithComments.wallStreetComments,
        title: marketArticleWithComments.wallStreetTitle || '월가의 말말말'
      };
    }
    
    // 2. 전역 월가 코멘트 사용
    if (sidebarState.wallStreetComments && sidebarState.wallStreetComments.length > 0) {
      return {
        comments: sidebarState.wallStreetComments,
        title: '월가의 말말말'
      };
    }
    
    return null;
  })();

  if (sidebarState.isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>월가의 말말말</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 월가의 말말말 - 독립 섹션 */}
      {wallStreetInfo && (
        <WallStreetComments 
          comments={wallStreetInfo.comments}
          commentsTitle={wallStreetInfo.title}
        />
      )}
    </div>
  );
} 