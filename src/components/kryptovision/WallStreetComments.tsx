"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, MessageSquare, Building2 } from "lucide-react";

interface WallStreetCommentsProps {
  comments: string[];
  commentsTitle?: string;
}

export default function WallStreetComments({ comments, commentsTitle = "💬 월가의 말말말" }: WallStreetCommentsProps) {
  if (!comments || comments.length === 0) {
    return null;
  }

  // 💬 코멘트 분류 및 아이콘 할당
  const categorizeComment = (comment: string) => {
    const lowerComment = comment.toLowerCase();
    
    if (lowerComment.includes('상승') || lowerComment.includes('랠리') || lowerComment.includes('긍정') || 
        lowerComment.includes('bullish') || lowerComment.includes('rise') || lowerComment.includes('up')) {
      return { 
        icon: <TrendingUp className="h-4 w-4 text-green-500" />, 
        type: 'positive',
        color: 'text-green-600 dark:text-green-400'
      };
    } else if (lowerComment.includes('하락') || lowerComment.includes('조정') || lowerComment.includes('매도') || 
               lowerComment.includes('bearish') || lowerComment.includes('fall') || lowerComment.includes('down')) {
      return { 
        icon: <TrendingDown className="h-4 w-4 text-red-500" />, 
        type: 'negative',
        color: 'text-red-600 dark:text-red-400'
      };
    } else {
      return { 
        icon: <Building2 className="h-4 w-4 text-blue-500" />, 
        type: 'neutral',
        color: 'text-blue-600 dark:text-blue-400'
      };
    }
  };

  // 💼 금융기관별 뱃지 색상 할당
  const getInstitutionBadge = (comment: string) => {
    const lowerComment = comment.toLowerCase();
    
    if (lowerComment.includes('모건') || lowerComment.includes('morgan')) {
      return { text: 'Morgan Stanley', variant: 'secondary' as const };
    } else if (lowerComment.includes('골드만') || lowerComment.includes('goldman')) {
      return { text: 'Goldman Sachs', variant: 'secondary' as const };
    } else if (lowerComment.includes('뱅크오브') || lowerComment.includes('bank of america')) {
      return { text: 'Bank of America', variant: 'secondary' as const };
    } else if (lowerComment.includes('jpmorgan') || lowerComment.includes('jp모건')) {
      return { text: 'JPMorgan', variant: 'secondary' as const };
    } else if (lowerComment.includes('월가') || lowerComment.includes('애널리스트')) {
      return { text: 'Wall Street', variant: 'outline' as const };
    } else {
      return { text: 'Financial Institution', variant: 'outline' as const };
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          {commentsTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comments.map((comment, index) => {
            const category = categorizeComment(comment);
            const institution = getInstitutionBadge(comment);
            
            return (
              <div 
                key={`wallstreet-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {/* 아이콘 */}
                <div className="flex-shrink-0 mt-0.5">
                  {category.icon}
                </div>
                
                {/* 코멘트 내용 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={institution.variant} className="text-xs">
                      {institution.text}
                    </Badge>
                  </div>
                  
                  <p className={`text-sm leading-relaxed ${category.color}`}>
                    {comment.replace(/^[🏦💰📈🔥⚡]+\s*/, '')} {/* 이모지 제거 */}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 📊 요약 통계 */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>총 {comments.length}개 코멘트</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              실시간 월가 분석
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 