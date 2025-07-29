"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, MessageSquare, Building2, Target, DollarSign, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface WallStreetCommentsProps {
  comments: string[];
  commentsTitle?: string;
}

export default function WallStreetComments({ comments, commentsTitle = "월가의 말말말" }: WallStreetCommentsProps) {
  if (!comments || comments.length === 0) {
    return null;
  }

  // 💬 코멘트 파싱 및 구조화
  const parseComment = (comment: string) => {
    const lines = comment.split('\n').filter(line => line.trim());
    
    // 첫 번째 줄에서 기관명, 전망, 목표가 추출
    const headerMatch = lines[0]?.match(/🏦\s*([^(]+)\s*\(([^)]+)\)\s*-\s*(.+)/);
    
    if (headerMatch) {
      const [, institution, outlook, targetPrice] = headerMatch;
      const summary = lines[1] || '';
      const keyPoints = lines.slice(2)
        .filter(line => line.startsWith('•'))
        .map(line => line.replace('•', '').trim());
        
      return {
        institution: institution.trim(),
        outlook: outlook.trim(),
        targetPrice: targetPrice.trim(),
        summary: summary.trim(),
        keyPoints
      };
    }
    
    // 구조화되지 않은 코멘트 처리 (기존 방식)
    return {
      institution: '금융기관',
      outlook: '중립',
      targetPrice: '',
      summary: comment,
      keyPoints: []
    };
  };

  // 💼 전망별 아이콘 및 색상
  const getOutlookStyle = (outlook: string) => {
    const lowerOutlook = outlook.toLowerCase();
    
    if (lowerOutlook.includes('강세') || lowerOutlook.includes('bullish')) {
      return { 
        icon: <TrendingUp className="h-4 w-4" />, 
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      };
    } else if (lowerOutlook.includes('약세') || lowerOutlook.includes('bearish')) {
      return { 
        icon: <TrendingDown className="h-4 w-4" />, 
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      };
    } else {
      return { 
        icon: <Minus className="h-4 w-4" />, 
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      };
    }
  };

  // 💼 금융기관별 뱃지 스타일
  const getInstitutionStyle = (institution: string) => {
    const lowerInst = institution.toLowerCase();
    
    if (lowerInst.includes('골드만') || lowerInst.includes('goldman')) {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    } else if (lowerInst.includes('모건스탠리') || lowerInst.includes('morgan stanley')) {
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    } else if (lowerInst.includes('jp모건') || lowerInst.includes('jpmorgan')) {
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
    } else if (lowerInst.includes('블랙록') || lowerInst.includes('blackrock')) {
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    } else if (lowerInst.includes('뱅크오브') || lowerInst.includes('bank of america')) {
      return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    } else {
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  const parsedComments = comments.map(parseComment);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          {commentsTitle}
          <Badge variant="secondary" className="ml-auto text-xs">
            실시간 업데이트
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {parsedComments.map((comment, index) => {
            const outlookStyle = getOutlookStyle(comment.outlook);
            
            return (
              <div 
                key={`wallstreet-${index}`}
                className={`p-4 rounded-lg border ${outlookStyle.borderColor} ${outlookStyle.bgColor} hover:shadow-md transition-all`}
              >
                {/* 헤더: 기관명과 전망 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getInstitutionStyle(comment.institution)} font-medium`}>
                      {comment.institution}
                    </Badge>
                    <div className={`flex items-center gap-1 ${outlookStyle.color}`}>
                      {outlookStyle.icon}
                      <span className="text-sm font-medium">{comment.outlook}</span>
                    </div>
                  </div>
                  
                  {comment.targetPrice && comment.targetPrice !== '목표가 미제시' && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Target className="h-3 w-3" />
                      <span className="font-mono">{comment.targetPrice}</span>
                    </div>
                  )}
                </div>
                
                {/* 요약 */}
                {comment.summary && (
                  <p className="text-sm mb-3 font-medium text-gray-700 dark:text-gray-300">
                    {comment.summary}
                  </p>
                )}
                
                {/* 주요 포인트 */}
                {comment.keyPoints.length > 0 && (
                  <ul className="space-y-1">
                    {comment.keyPoints.map((point, idx) => (
                      <li 
                        key={idx} 
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                      >
                        <span className="text-xs mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        
        {/* 📊 요약 통계 */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>총 {comments.length}개 리포트</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              4시간마다 자동 업데이트
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 