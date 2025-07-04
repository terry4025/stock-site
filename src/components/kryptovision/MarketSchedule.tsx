"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Building } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

interface MarketScheduleProps {
  schedule?: string[];
  scheduleTitle?: string;
}

export default function MarketSchedule({ schedule, scheduleTitle }: MarketScheduleProps) {
  const { t, language } = useLanguage();
  const [currentSchedule, setCurrentSchedule] = useState<string[]>(schedule || []);
  const [title, setTitle] = useState<string>(scheduleTitle || "📅 다음날 주요 일정");

  useEffect(() => {
    // 전역 변수에서 일정 정보 체크
    if (typeof window !== 'undefined' && (window as any).upcomingMarketSchedule) {
      const globalSchedule = (window as any).upcomingMarketSchedule;
      if (globalSchedule && globalSchedule.length > 0) {
        setCurrentSchedule(globalSchedule);
      }
    }
    
    // schedule prop이 변경되면 업데이트
    if (schedule && schedule.length > 0) {
      setCurrentSchedule(schedule);
    }
    
    if (scheduleTitle) {
      setTitle(scheduleTitle);
    }
  }, [schedule, scheduleTitle]);

  // 일정 아이템의 카테고리 분류
  const categorizeScheduleItem = (item: string) => {
    const lowerItem = item.toLowerCase();
    
    if (lowerItem.includes('pmi') || lowerItem.includes('경제지표') || lowerItem.includes('취업') || lowerItem.includes('실업')) {
      return { type: 'economic', icon: TrendingUp, color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
    
    if (lowerItem.includes('연준') || lowerItem.includes('파월') || lowerItem.includes('fed') || lowerItem.includes('powell')) {
      return { type: 'fed', icon: Building, color: 'bg-green-100 text-green-700 border-green-200' };
    }
    
    if (lowerItem.includes('실적') || lowerItem.includes('earnings') || lowerItem.includes('테슬라') || lowerItem.includes('줌카')) {
      return { type: 'earnings', icon: TrendingUp, color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    
    if (lowerItem.includes('휴장') || lowerItem.includes('독립기념일') || lowerItem.includes('조기')) {
      return { type: 'holiday', icon: Calendar, color: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
    
    return { type: 'other', icon: Clock, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  if (!currentSchedule || currentSchedule.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentSchedule.map((item, index) => {
            const category = categorizeScheduleItem(item);
            const IconComponent = category.icon;
            
            return (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                    {item}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${category.color} flex-shrink-0`}
                >
                  {category.type === 'economic' && '경제지표'}
                  {category.type === 'fed' && '연준'}
                  {category.type === 'earnings' && '실적'}
                  {category.type === 'holiday' && '휴장'}
                  {category.type === 'other' && '기타'}
                </Badge>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 주요 경제 일정은 시장 변동성에 영향을 줄 수 있습니다
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 