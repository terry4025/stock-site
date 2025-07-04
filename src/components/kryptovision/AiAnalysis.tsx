"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Meh, BrainCircuit, Sparkles, Save, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveAiAnalysisToHistory } from "@/app/actions";

const RecommendationIcon = ({ recommendation }: { recommendation: string }) => {
  switch (recommendation?.toLowerCase()) {
    case 'buy': return <TrendingUp className="h-6 w-6 text-green-500" />;
    case 'sell': return <TrendingDown className="h-6 w-6 text-red-500" />;
    case 'hold': return <Minus className="h-6 w-6 text-yellow-500" />;
    default: return <Minus className="h-6 w-6 text-muted-foreground" />;
  }
};

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return <ArrowUp className="h-4 w-4 text-green-500" />;
    case 'negative': return <ArrowDown className="h-4 w-4 text-red-500" />;
    case 'neutral': return <Meh className="h-4 w-4 text-yellow-500" />;
    default: return <Meh className="h-4 w-4 text-muted-foreground" />;
  }
};

interface AiAnalysisProps {
  analysis: {
    analysisSummary: string;
    recommendation: string;
    confidenceScore: number;
    shortTermTarget?: number;
    longTermTarget?: number;
    buyPrice?: number;
    sellPrice?: number;
    riskLevel?: 'low' | 'medium' | 'high';
  } | null;
  sentiment: {
    sentiment: string;
    confidenceScore: number;
    reasoning: string;
  } | null;
  loading: boolean;
  analysisStarted: boolean;
  onStartAnalysis: () => void;
  
  // 저장에 필요한 추가 데이터
  stockData?: any;
  language?: string;
  allNews?: any[];
  stockNewsData?: any[];
  marketNewsData?: any[];
  chartTrend?: string;
}

export default function AiAnalysis({ 
  analysis, 
  sentiment, 
  loading, 
  analysisStarted, 
  onStartAnalysis,
  stockData,
  language,
  allNews = [],
  stockNewsData = [],
  marketNewsData = [],
  chartTrend = 'sideways'
}: AiAnalysisProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const loadingMessages = useMemo(() => [
    t('analyzing_sentiment'),
    t('analyzing_technicals'),
    t('analyzing_charts'),
  ], [t]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingMessageIndex(0); // Reset on new loading state
      interval = setInterval(() => {
        setLoadingMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, loadingMessages.length]);

  const getRecommendationBadgeVariant = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'buy': return 'default';
      case 'sell': return 'destructive';
      case 'hold': return 'secondary';
      default: return 'outline';
    }
  };

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      case 'neutral': return 'secondary';
      default: return 'outline';
    }
  };

  // 분석 저장 함수
  const handleSaveAnalysis = async () => {
    if (!user?.id) {
      toast({
        title: t('save_error'),
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!stockData || !analysis) {
      toast({
        title: t('save_error'),
        description: "분석 데이터가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await saveAiAnalysisToHistory(
        user.id,
        stockData,
        analysis,
        sentiment,
        language || 'kr',
        allNews,
        stockNewsData,
        marketNewsData,
        chartTrend
      );

      if (result.success) {
        setIsSaved(true);
        toast({
          title: t('save_success'),
          description: t('analysis_saved_message'),
        });
        
        // 3초 후 저장 상태 초기화
        setTimeout(() => {
          setIsSaved(false);
        }, 3000);
      } else {
        // 에러 객체를 문자열로 안전하게 변환
        let errorMessage = "분석 저장에 실패했습니다.";
        
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error && typeof result.error === 'object') {
          if (result.error.message) {
            errorMessage = result.error.message;
          } else {
            errorMessage = JSON.stringify(result.error);
          }
        }
        
        console.error('Save analysis failed:', result.error);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Analysis save error:', error);
      
      let errorMessage = "알 수 없는 오류가 발생했습니다.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: t('save_error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!analysisStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-white">{t('ai_analysis_title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 min-h-[300px]">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">{t('start_analysis_prompt_title')}</p>
            <p className="text-sm text-muted-foreground">{t('start_analysis_prompt_desc')}</p>
          </div>
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="w-full h-16 bg-gradient-to-r from-primary via-blue-500 to-teal-400 text-white shadow-lg hover:scale-105 transition-transform duration-300 group"
          >
            <Sparkles className="mr-3 h-6 w-6 transition-transform duration-500 group-hover:rotate-180" />
            <span className="text-lg font-bold">{t('start_ai_analysis')}</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-white">{t('ai_analysis_title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 min-h-[300px]">
          <div className="relative w-36 h-36">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/50 via-emerald-500/50 to-teal-500/50 blur-xl animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-teal-500/50 via-emerald-500/50 to-primary/50 blur-xl animate-[spin_8s_linear_infinite_reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center h-20 w-20 bg-card/70 backdrop-blur-sm rounded-full">
                <BrainCircuit className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>{loadingMessages[loadingMessageIndex]}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">{t('ai_analysis_title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-secondary rounded-lg">
          <div className="flex items-center gap-2">
            <RecommendationIcon recommendation={analysis?.recommendation || ''} />
            <div>
              <p className="font-bold text-lg text-white">{t('recommendation')}</p>
              <Badge variant={getRecommendationBadgeVariant(analysis?.recommendation || '')} className="text-lg">
                {analysis?.recommendation ? t(analysis.recommendation.toLowerCase()) : t('n/a')}
              </Badge>
            </div>
          </div>
          <div>
            <p className="font-bold text-lg text-right text-white">{t('confidence')}</p>
            <p className="text-2xl font-bold text-primary text-right">
              {analysis?.confidenceScore ? `${(analysis.confidenceScore * 100).toFixed(0)}%` : t('n/a')}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('summary')}</p>
          <p className="text-sm text-white">{analysis?.analysisSummary || t('analysis_not_available')}</p>
        </div>

        {/* 투자 가이드 섹션 */}
        {analysis && (analysis.shortTermTarget || analysis.longTermTarget || analysis.buyPrice || analysis.sellPrice) && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-md text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('investment_guidance')}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {analysis.shortTermTarget && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{t('short_term_target')}</p>
                  <p className="text-sm font-bold text-green-400">
                    ${analysis.shortTermTarget.toLocaleString()}
                  </p>
                </div>
              )}
              
              {analysis.longTermTarget && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{t('long_term_target')}</p>
                  <p className="text-sm font-bold text-emerald-400">
                    ${analysis.longTermTarget.toLocaleString()}
                  </p>
                </div>
              )}
              
              {analysis.buyPrice && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{t('buy_price')}</p>
                  <p className="text-sm font-bold text-blue-400">
                    ${analysis.buyPrice.toLocaleString()}
                  </p>
                </div>
              )}
              
              {analysis.sellPrice && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{t('sell_price')}</p>
                  <p className="text-sm font-bold text-orange-400">
                    ${analysis.sellPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            
            {analysis.riskLevel && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{t('risk_level')}:</p>
                <Badge 
                  variant={
                    analysis.riskLevel === 'low' ? 'default' :
                    analysis.riskLevel === 'high' ? 'destructive' : 'secondary'
                  }
                  className="text-xs"
                >
                  {t(`risk_${analysis.riskLevel}`)}
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
           <h4 className="font-semibold text-md text-white">{t('news_sentiment_title')}</h4>
           <div className="flex items-center gap-2">
            <SentimentIcon sentiment={sentiment?.sentiment || ''} />
            <Badge variant={getSentimentBadgeVariant(sentiment?.sentiment || '')}>
              {sentiment?.sentiment ? t(sentiment.sentiment.toLowerCase()) : t('n/a')}
            </Badge>
            <span className="text-sm text-muted-foreground">({t('confidence')}: {((sentiment?.confidenceScore ?? 0) * 100).toFixed(0)}%)</span>
           </div>
           <p className="text-sm text-muted-foreground">{sentiment?.reasoning || t('sentiment_not_available')}</p>
        </div>

        {/* 저장 버튼 */}
        <div className="border-t pt-4">
          <Button
            onClick={handleSaveAnalysis}
            disabled={isSaving || isSaved || !stockData}
            className={`w-full h-12 font-semibold transition-all duration-300 ${
              isSaved 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('saving_analysis')}
              </>
            ) : isSaved ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                {t('save_success')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                {t('save_analysis')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
