'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Clock, Globe, Filter, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScheduleItem } from '@/ai/gitbookScheduleExtractor';

interface ScheduleCardsProps {
  scheduleItems: ScheduleItem[];
  loading: boolean;
  workingScheduleUrl?: string;
}

interface ScheduleState {
  importanceFilter: 'all' | 'HIGH' | 'MEDIUM' | 'LOW';
  countryFilter: 'all' | '미국' | '한국';
  dateFilter: 'all' | 'today' | 'tomorrow';
  latestScheduleUrl: string;
  lastValidScheduleUrl: string;
  lastUrlUpdate: number;
}

// 동적 날짜 생성 함수 (컴포넌트 외부에 정의)
const generateTodayUrl = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return `https://futuresnow.gitbook.io/newstoday/${dateStr}/news/today/undefined`;
};

export default function ScheduleCards({ scheduleItems, loading, workingScheduleUrl }: ScheduleCardsProps) {
  const { t } = useLanguage();

  const [scheduleState, setScheduleState] = useState<ScheduleState>({
    importanceFilter: 'all',
    countryFilter: 'all',
    dateFilter: 'all',
    latestScheduleUrl: workingScheduleUrl || generateTodayUrl(), // 🔥 스마트 링크 시스템 활용
    lastValidScheduleUrl: workingScheduleUrl || generateTodayUrl(), // 🔥 스마트 링크 시스템 활용
    lastUrlUpdate: 0
  });

  // 하드코딩된 제목
  const getScheduleTitle = (): string => {
    return "주요 일정 및 경제 지표";
  };

  // URL 자동 업데이트 (스마트 링크 시스템 활용)
  useEffect(() => {
    if (workingScheduleUrl) {
      setScheduleState(prev => ({
        ...prev,
        latestScheduleUrl: workingScheduleUrl,
        lastValidScheduleUrl: workingScheduleUrl,
        lastUrlUpdate: Date.now()
      }));
    } else {
      // 폴백: 동적 URL 생성
      const updateScheduleUrl = () => {
        const newUrl = generateTodayUrl();
        setScheduleState(prev => ({
          ...prev,
          latestScheduleUrl: newUrl,
          lastValidScheduleUrl: newUrl,
          lastUrlUpdate: Date.now()
        }));
      };

      updateScheduleUrl();
      
      // 매일 자정에 URL 업데이트
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        updateScheduleUrl();
        
        // 이후 24시간마다 업데이트
        const intervalId = setInterval(updateScheduleUrl, 24 * 60 * 60 * 1000);
        
        return () => clearInterval(intervalId);
      }, timeUntilMidnight);

      return () => clearTimeout(timeoutId);
    }
  }, [workingScheduleUrl]);

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'HIGH': return 'text-red-600 dark:text-red-400';
      case 'MEDIUM': return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getImportanceIcon = (importance: string): string => {
    switch (importance) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const getCountryFlag = (country: string): string => {
    if (country.includes('미국') || country.includes('US')) return '🇺🇸';
    if (country.includes('한국') || country.includes('KR')) return '🇰🇷';
    if (country.includes('일본') || country.includes('JP')) return '🇯🇵';
    if (country.includes('중국') || country.includes('CN')) return '🇨🇳';
    if (country.includes('독일') || country.includes('DE')) return '🇩🇪';
    if (country.includes('영국') || country.includes('UK')) return '🇬🇧';
    return '🌐';
  };

  const filterScheduleItems = (items: ScheduleItem[]): ScheduleItem[] => {
    let filtered = [...items];

    // 중요도 필터링
    if (scheduleState.importanceFilter !== 'all') {
      filtered = filtered.filter(item => item.importance === scheduleState.importanceFilter);
    }

    // 국가 필터링
    if (scheduleState.countryFilter !== 'all') {
      filtered = filtered.filter(item => item.country.includes(scheduleState.countryFilter));
    }

    // 날짜 필터링
    if (scheduleState.dateFilter !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formatDate = (date: Date): string => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}`;
      };
      
      const todayStr = formatDate(today);
      const tomorrowStr = formatDate(tomorrow);
      
      if (scheduleState.dateFilter === 'today') {
        filtered = filtered.filter(item => item.date.includes(todayStr));
      } else if (scheduleState.dateFilter === 'tomorrow') {
        filtered = filtered.filter(item => item.date.includes(tomorrowStr));
      }
    }

    // 최대 50개 항목으로 제한 (더 많은 경제지표 표시)
    return filtered.slice(0, 50);
  };

  const handleFilterChange = (
    filterType: 'importance' | 'country' | 'date',
    value: string
  ) => {
    setScheduleState(prev => ({
      ...prev,
      [`${filterType}Filter`]: value
    }));
  };

  const renderScheduleItem = (item: ScheduleItem, index: number) => {
    // 실제로 작동하는 링크를 우선 사용, 없으면 기본 링크 사용
    const sourceUrl = workingScheduleUrl || scheduleState.latestScheduleUrl;
    
    return (
      <div key={index} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs px-2 py-1">
              <Calendar className="h-3 w-3 mr-1" />
              {item.date}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-1">
              <Clock className="h-3 w-3 mr-1" />
              {item.time}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {getCountryFlag(item.country)} {item.country}
            </Badge>
          </div>
          
          <h4 className="text-sm font-medium line-clamp-2 mb-1">
            {item.indicator}
          </h4>
          
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${getImportanceColor(item.importance)}`}>
              {getImportanceIcon(item.importance)} {item.importance}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-blue-600 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                window.open(sourceUrl, '_blank');
              }}
              title="출처 보기"
            >
              {item.source}
            </Button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 h-auto p-1 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            window.open(sourceUrl, '_blank');
          }}
          title="출처 보기"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {getScheduleTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredItems = filterScheduleItems(scheduleItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {getScheduleTitle()}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
            onClick={() => window.open(workingScheduleUrl || scheduleState.latestScheduleUrl, '_blank')}
            title="경제지표 전체 페이지 보기"
          >
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              전체 일정
            </div>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 필터 버튼들 */}
        <div className="flex flex-col gap-3 mb-4">
          {/* 중요도 필터 */}
          <div className="flex items-center justify-center gap-1">
            <Button
              variant={scheduleState.importanceFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleFilterChange('importance', 'all')}
            >
              <Filter className="h-3 w-3 mr-1" />
              전체
            </Button>
            <Button
              variant={scheduleState.importanceFilter === 'HIGH' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleFilterChange('importance', 'HIGH')}
            >
              <Star className="h-3 w-3 mr-1 text-red-500" />
              높음
            </Button>
            <Button
              variant={scheduleState.importanceFilter === 'MEDIUM' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleFilterChange('importance', 'MEDIUM')}
            >
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              보통
            </Button>
            <Button
              variant={scheduleState.importanceFilter === 'LOW' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleFilterChange('importance', 'LOW')}
            >
              <Star className="h-3 w-3 mr-1 text-green-500" />
              낮음
            </Button>
          </div>


        </div>

        {/* 일정 목록 */}
        <div className="max-h-[500px] overflow-y-auto pr-2 schedule-scroll">
          {filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item, index) => renderScheduleItem(item, index))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-muted-foreground">
                {scheduleItems.length === 0 
                  ? '일정 데이터를 불러오는 중입니다...' 
                  : '선택한 조건에 맞는 일정이 없습니다.'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}