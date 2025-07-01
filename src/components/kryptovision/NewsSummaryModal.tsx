"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getNewsSummary } from "@/app/actions";
import { useLanguage } from "@/hooks/useLanguage";
import type { NewsArticle, StockData } from "@/lib/types";
import { ExternalLink, Terminal, TrendingDown, TrendingUp, Sparkles, Building2 } from "lucide-react";

interface NewsSummaryModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  stockData: StockData | null;
  isStockNews: boolean;
}

export default function NewsSummaryModal({ article, isOpen, onClose, stockData, isStockNews }: NewsSummaryModalProps) {
  const { t, language } = useLanguage();
  const [summary, setSummary] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (article && isOpen) {
      const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        setSummary(null);
        setTranslatedTitle(null);

        try {
          console.log(`[NewsSummaryModal] Fetching summary for: ${article.title?.substring(0, 50)}...`);
          
          // 🛡️ 입력 데이터 검증
          if (!article.title) {
            throw new Error('기사 제목이 없습니다.');
          }

          // AI summary with simplified approach
          const result = await Promise.race([
            getNewsSummary(article, language),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error(
                language === 'kr' 
                  ? 'AI 요약 요청 시간 초과 (10초)' 
                  : 'AI summary request timeout (10s)'
              )), 10000)
            )
          ]);
          
          // 🔍 응답 검증
          if (!result || typeof result !== 'object') {
            throw new Error('AI 요약 응답이 잘못되었습니다.');
          }
          
          if (result.error) {
            console.warn(`[NewsSummaryModal] AI summary error: ${result.error}`);
            setError(result.error);
            // 오류가 있어도 summary가 있으면 표시
            if (result.summary) {
              setSummary(result.summary);
            } else {
              setSummary(null);
            }
            setTranslatedTitle(result.translatedTitle || article.title);
          } else {
            // 성공 케이스
            const finalSummary = result.summary || t('summary_error') || '요약을 생성할 수 없습니다.';
            setSummary(finalSummary);
            setTranslatedTitle(result.translatedTitle || article.title);
            setError(null);
            console.log(`[NewsSummaryModal] ✅ Successfully got AI summary`);
          }
          
        } catch (fetchError) {
          console.error(`[NewsSummaryModal] Failed to fetch summary:`, fetchError);
          
          // 🆘 최후 폴백 - 기본 요약 생성
          const errorMsg = fetchError instanceof Error ? fetchError.message : '알 수 없는 오류';
          setError(`AI 요약을 가져올 수 없습니다: ${errorMsg}`);
          
          // 기본 요약 제공
          const basicSummary = language === 'kr' 
            ? `"${article.title?.substring(0, 100) || '제목 없음'}" - ${article.source || '출처 불명'}에서 보도한 뉴스입니다. 자세한 내용은 원문을 확인해주세요.`
            : `"${article.title?.substring(0, 100) || 'No Title'}" - News reported by ${article.source || 'Unknown Source'}. Please check the original article for details.`;
            
          setSummary(basicSummary);
          setTranslatedTitle(article.title || (language === 'kr' ? '제목 없음' : 'No Title'));
        } finally {
          setLoading(false);
        }
      };
      
      fetchSummary();
    }
  }, [article, isOpen, language, t]);

  const handleOpenSource = () => {
    if (article?.url && article.url !== '#') {
      window.open(article.url, "_blank", "noopener,noreferrer");
    } else {
      // URL이 없거나 '#'인 경우 뉴스 출처 사이트로 이동
      const sourceUrls: {[key: string]: string} = {
        '연합뉴스': 'https://www.yna.co.kr',
        '매일경제': 'https://www.mk.co.kr',
        '한국경제': 'https://www.hankyung.com',
        '이데일리': 'https://www.edaily.co.kr',
        '머니투데이': 'https://news.mt.co.kr',
        'Bloomberg': 'https://www.bloomberg.com',
        'Reuters': 'https://www.reuters.com',
        'Financial Times': 'https://www.ft.com',
        'Yahoo Finance': 'https://finance.yahoo.com',
        'MarketWatch': 'https://www.marketwatch.com',
        'CNBC': 'https://www.cnbc.com'
      };
      
      const sourceUrl = sourceUrls[article?.source || ''] || 'https://www.google.com/search?q=' + encodeURIComponent(article?.title || '');
      window.open(sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const dailyChangePositive = isStockNews && stockData && stockData.dailyChange.value >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">{translatedTitle || article?.title || ""}</DialogTitle>
          
          {/* 📰 뉴스 메타 정보 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{article?.source}</span>
            <span>•</span>
            <span>{article?.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
          </div>
          
          {/* 📈 주식 정보 (종목 뉴스인 경우) */}
          {isStockNews && stockData && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm text-white">{stockData.name}</span>
                  <span className="text-xs text-gray-400">({stockData.ticker})</span>
                </div>
                <div className="flex items-center gap-2">
                  {dailyChangePositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium text-lg text-white">
                    ₩{stockData.currentPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-400">{language === 'kr' ? '일일 변동' : 'Daily Change'}</span>
                <span className={`font-semibold ${dailyChangePositive ? "text-green-600" : "text-red-600"}`}>
                  {dailyChangePositive ? '+' : ''}{stockData.dailyChange.value.toFixed(2)} 
                  ({dailyChangePositive ? '+' : ''}{stockData.dailyChange.percentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* 🤖 AI 요약 섹션 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm text-white">
                {language === 'kr' ? 'AI 요약' : 'AI Summary'}
              </span>
            </div>
            
            {loading && (
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  {language === 'kr' 
                    ? 'AI가 뉴스를 분석하여 요약하는 중...' 
                    : 'AI is analyzing and summarizing news...'}
                </p>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>AI 요약 오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {summary && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{summary}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2 flex-col-reverse sm:flex-row">
           <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t('close')}
                </Button>
            </DialogClose>
          <Button onClick={handleOpenSource}>
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('go_to_source')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
