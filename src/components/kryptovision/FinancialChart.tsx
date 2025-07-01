"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import type { ChartData } from "@/lib/types";

interface FinancialChartProps {
  data: ChartData;
}

type PeriodFrame = '일' | '주' | '월' | '년';

export default function FinancialChart({ data }: FinancialChartProps) {
  const { t, language } = useLanguage();
  
  // 차트 상태
  const [periodFrame, setPeriodFrame] = useState<PeriodFrame>('일');

  // 기간 옵션
  const periodFrameOptions: PeriodFrame[] = ['일', '주', '월', '년'];

  // 데이터 변환
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(point => ({
      date: new Date(point.date).toISOString(),
      close: point.close,
      volume: point.volume || 0
    }));
  }, [data]);

  // 시간대별 데이터 필터링 및 집계
  const filteredData = useMemo(() => {
    if (!chartData.length) return [];
    
    let processedData = [...chartData];
    
    // 기간에 따른 데이터 처리
    switch (periodFrame) {
      case '일':
        // 최근 2년치 일별 데이터 (더 풍부한 차트)
        return processedData.slice(-730);
        
      case '주':
        // 주별 데이터로 집계 (최근 2년)
        const weeklyData: any[] = [];
        const sortedData = processedData.slice(-730).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        for (let i = 0; i < sortedData.length; i += 7) {
          const weekData = sortedData.slice(i, i + 7);
          if (weekData.length > 0) {
            const lastDayOfWeek = weekData[weekData.length - 1];
            weeklyData.push({
              date: lastDayOfWeek.date,
              close: lastDayOfWeek.close,
              volume: weekData.reduce((sum, day) => sum + (day.volume || 0), 0)
            });
          }
        }
        return weeklyData.slice(-104); // 최근 2년치 주별 데이터
        
      case '월':
        // 월별 데이터로 집계 (최근 5년)
        const monthlyData: any[] = [];
        const monthSortedData = processedData.slice(-1825).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const monthGroups: {[key: string]: any[]} = {};
        monthSortedData.forEach(item => {
          const date = new Date(item.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthGroups[monthKey]) {
            monthGroups[monthKey] = [];
          }
          monthGroups[monthKey].push(item);
        });
        
        Object.keys(monthGroups).sort().forEach(monthKey => {
          const monthData = monthGroups[monthKey];
          const lastDayOfMonth = monthData[monthData.length - 1];
          monthlyData.push({
            date: lastDayOfMonth.date,
            close: lastDayOfMonth.close,
            volume: monthData.reduce((sum, day) => sum + (day.volume || 0), 0)
          });
        });
        return monthlyData.slice(-60); // 최근 5년치 월별 데이터
        
      case '년':
        // 연별 데이터로 집계 (최근 10년)
        const yearlyData: any[] = [];
        const yearSortedData = processedData.slice(-3650).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const yearGroups: {[key: string]: any[]} = {};
        yearSortedData.forEach(item => {
          const date = new Date(item.date);
          const yearKey = date.getFullYear().toString();
          if (!yearGroups[yearKey]) {
            yearGroups[yearKey] = [];
          }
          yearGroups[yearKey].push(item);
        });
        
        Object.keys(yearGroups).sort().forEach(yearKey => {
          const yearData = yearGroups[yearKey];
          const lastDayOfYear = yearData[yearData.length - 1];
          yearlyData.push({
            date: lastDayOfYear.date,
            close: lastDayOfYear.close,
            volume: yearData.reduce((sum, day) => sum + (day.volume || 0), 0)
          });
        });
        return yearlyData.slice(-10); // 최근 10년치 연별 데이터
        
      default:
        return processedData.slice(-365);
    }
  }, [chartData, periodFrame]);

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="w-full border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            {t('stock_chart')}
          </CardTitle>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* 기간 버튼들 */}
            <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
              {periodFrameOptions.map((period) => (
                <Button
                  key={period}
                  variant={periodFrame === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriodFrame(period)}
                  className={
                    periodFrame === period 
                      ? 'bg-orange-500 text-white shadow-lg hover:bg-orange-600' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200'
                  }
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="w-full h-[500px] bg-gray-900/30 rounded-lg p-4 border border-gray-700">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (periodFrame === '년') {
                    return date.getFullYear().toString();
                  } else if (periodFrame === '월') {
                    return language === 'kr' 
                      ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
                      : date.toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
                  } else {
                    return language === 'kr' 
                      ? `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ stroke: '#f97316', strokeDasharray: '5 5', strokeWidth: 2 }}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #f97316',
                  borderRadius: '12px',
                  color: '#f9fafb',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  fontSize: '14px',
                  fontWeight: 500
                }}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return language === 'kr' 
                    ? `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
                    : date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'short'
                      });
                }}
                formatter={(value: any) => [
                  formatPrice(value),
                  language === 'kr' ? '가격' : 'Price'
                ]}
              />
              <Area
                dataKey="close"
                type="monotone"
                fill="url(#fillClose)"
                stroke="#f97316"
                strokeWidth={3}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-300">
                차트 기간: <span className="text-white font-medium">
                  {periodFrame === '일' && '2년 일별 차트'}
                  {periodFrame === '주' && '2년 주별 차트'} 
                  {periodFrame === '월' && '5년 월별 차트'}
                  {periodFrame === '년' && '10년 연별 차트'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">데이터 포인트: <span className="text-white font-medium">{filteredData.length}개</span></span>
            </div>
            <div className="text-gray-400">
              💡 차트 위로 마우스를 이동하여 상세 정보를 확인하세요
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
