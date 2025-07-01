"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { getAiAnalysis, getNewsSentiment, getRealtimeFearGreedIndex, getHeadlines, getStockAndChartData, getStockSpecificNews, getMarketNews } from "@/app/actions";
import { useLanguage } from "@/hooks/useLanguage";
import { type StockData, type NewsArticle, type ChartData, type ChartDataPoint } from "@/lib/types";

import Header from "@/components/kryptovision/Header";
import StockSearch from "@/components/kryptovision/StockSearch";
import GlobalIndices from "@/components/kryptovision/GlobalIndices";
import FinancialChart from "@/components/kryptovision/FinancialChart";
import StockDataTable from "@/components/kryptovision/StockDataTable";
import AiAnalysis from "@/components/kryptovision/AiAnalysis";
import NewsFeed from "@/components/kryptovision/NewsFeed";
import FearGreedIndex from "@/components/kryptovision/FearGreedIndex";
import RealtimeStatus from "@/components/kryptovision/RealtimeStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Newspaper, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mockChartData, mockStockData, mockNewsData } from "@/lib/mock-data";
import LoadingScreen from "./LoadingScreen";

export default function DashboardClient({ initialData }: { initialData: any }) {
  const { t, language, setLanguage } = useLanguage();
  
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [ticker, setTicker] = useState("TSLA");
  const [stockData, setStockData] = useState<StockData | null>(initialData.stockData);
  const [chartData, setChartData] = useState<ChartData>(initialData.chartData);
  const [newsData, setNewsData] = useState<NewsArticle[]>(initialData.newsData);
  const [marketNews, setMarketNews] = useState<NewsArticle[]>(initialData.marketNews);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [newsSentiment, setNewsSentiment] = useState<any>(null);
  const [fearGreedIndex, setFearGreedIndex] = useState<number | null>(initialData.fearGreedIndex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialData.error);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // 기본 30초
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true); // 자동 새로고침 설정
  const isInitialMount = useRef(true);

  // Set initial language from server
  useEffect(() => {
    if (initialData.language) {
      setLanguage(initialData.language);
    }
  }, [initialData.language, setLanguage]);

  // 🔄 설정 변경 이벤트 리스닝 (새로고침 간격 업데이트)
  useEffect(() => {
    const handleRefreshIntervalChange = (event: CustomEvent) => {
      const { interval, auto_refresh } = event.detail;
      console.log(`🔄 [DashboardClient] Settings changed - Interval: ${interval} seconds, Auto refresh: ${auto_refresh}`);
      
      if (interval !== undefined) {
        setRefreshInterval(interval);
      }
      
      if (auto_refresh !== undefined) {
        setAutoRefreshEnabled(auto_refresh);
        setIsRealtimeEnabled(auto_refresh);
      }
    };

    window.addEventListener('refreshIntervalChanged', handleRefreshIntervalChange as EventListener);

    // 로컬 스토리지에서 초기 설정 로드
    const savedSettings = localStorage.getItem('kryptovision_user_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.settings?.refresh_interval) {
          console.log(`🔄 [DashboardClient] Initial refresh interval from localStorage: ${settings.settings.refresh_interval} seconds`);
          setRefreshInterval(settings.settings.refresh_interval);
        }
        if (settings.settings?.auto_refresh !== undefined) {
          console.log(`🔄 [DashboardClient] Initial auto refresh from localStorage: ${settings.settings.auto_refresh}`);
          setAutoRefreshEnabled(settings.settings.auto_refresh);
          setIsRealtimeEnabled(settings.settings.auto_refresh);
        }
      } catch (error) {
        console.warn('⚠️ [DashboardClient] Failed to parse saved settings:', error);
      }
    }

    return () => {
      window.removeEventListener('refreshIntervalChanged', handleRefreshIntervalChange as EventListener);
    };
  }, []);


  // Effect for polling Fear & Greed Index
  useEffect(() => {
    const fearGreedInterval = setInterval(async () => {
      const data = await getRealtimeFearGreedIndex();
      if (data) setFearGreedIndex(data.indexValue);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(fearGreedInterval);
    };
  }, []);

  // 🚀 실시간 주식 데이터 업데이트 (동적 간격)
  useEffect(() => {
    if (!ticker || !isRealtimeEnabled || !autoRefreshEnabled) {
      console.log(`[실시간 업데이트] ${ticker} 업데이트 비활성화 - Realtime: ${isRealtimeEnabled}, Auto refresh: ${autoRefreshEnabled}`);
      return;
    }
    
    console.log(`[실시간 업데이트] ${ticker} 실시간 업데이트 시작 (${refreshInterval}초 간격)`);
    
    const stockDataInterval = setInterval(async () => {
      try {
        // 현재 로딩 중이거나 분석 중인 경우 스킵
        if (loading || loadingAnalysis || loadingSentiment) {
          console.log(`[실시간 업데이트] ${ticker} 다른 작업 진행 중, 스킵`);
          return;
        }
        
        console.log(`[실시간 업데이트] ${ticker} 🔄 데이터 갱신 중... (${refreshInterval}초 간격)`);
        const result = await getStockAndChartData(ticker);
        
        if (result.stockData) {
          const updateTime = new Date();
          
          console.log(`[실시간 업데이트] ${ticker} ✅ 데이터 업데이트 완료:`, {
            시간: updateTime.toLocaleTimeString('ko-KR'),
            가격: result.stockData.currentPrice,
            등락률: `${result.stockData.dailyChange.percentage}%`,
            볼륨: result.stockData.volume,
            간격: `${refreshInterval}초`
          });
          
          setStockData(result.stockData);
          setChartData(result.chartData as ChartData || []);
          setLastUpdateTime(updateTime);
        }
      } catch (error) {
        console.warn(`[실시간 업데이트] ${ticker} ⚠️ 업데이트 실패:`, error);
        // 실시간 업데이트 실패는 무시 (기존 데이터 유지)
      }
    }, refreshInterval * 1000); // 동적 간격 적용

    return () => {
      console.log(`[실시간 업데이트] ${ticker} 실시간 업데이트 중지`);
      clearInterval(stockDataInterval);
    };
  }, [ticker, isRealtimeEnabled, autoRefreshEnabled, refreshInterval, loading, loadingAnalysis, loadingSentiment]);

  // Effect to fetch data when ticker or language changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
  
    const abortController = new AbortController();
    let isMounted = true;
  
    const fetchTickerData = async (currentTicker: string) => {
      if (!isMounted || abortController.signal.aborted) return;
      
      setLoading(true);
      setError(null);
      setLoadingAnalysis(false);
      setLoadingSentiment(false);
      setLoadingNews(true);
      setAiAnalysis(null);
      setNewsSentiment(null);
      setAnalysisStarted(false);
  
      try {
        const analysisTicker = currentTicker === 'TSLL' ? 'TSLA' : currentTicker;
  
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out after 30 seconds.')), 30000)
        );
  
        const dataPromise = Promise.all([
          getStockAndChartData(currentTicker),
          getStockSpecificNews(analysisTicker, language),
          getMarketNews(language),
        ]);
  
        const [crawledResult, stockArticles, marketArticles] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [{ stockData: StockData | null, chartData: ChartDataPoint[] }, NewsArticle[], NewsArticle[]];
  
        if (!isMounted || abortController.signal.aborted) return;
  
        if (!crawledResult.stockData) {
          throw new Error(`An error occurred while fetching data for ${currentTicker}. Please try again later.`);
        }
  
        setStockData(crawledResult.stockData);
        setChartData(crawledResult.chartData as ChartData || []);
        setNewsData(stockArticles || []);
        setMarketNews(marketArticles || []);
        
      } catch (err) {
        if (!isMounted || abortController.signal.aborted) return;
        
        console.error(`Failed to fetch data for ticker ${currentTicker}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading data.';
        setError(errorMessage);
        const mockKey = currentTicker.toUpperCase();
        setStockData(mockStockData[mockKey] || mockStockData['AAPL']);
        setChartData(mockChartData[mockKey] || mockChartData['AAPL']);
        setNewsData(mockNewsData[mockKey] || mockNewsData['DEFAULT']);
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
          setLoadingNews(false);
        }
      }
    };
  
    if (ticker) {
      fetchTickerData(ticker);
    }
  
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [ticker, language]);

  const handleStartAnalysis = async () => {
    if (!stockData || chartData.length === 0 || newsData.length === 0) {
      setError("Cannot start analysis without stock data, chart data, and news.");
      return;
    }
  
    setAnalysisStarted(true);
    setLoadingAnalysis(true);
    setLoadingSentiment(true);
  
    try {
      const articleTitles = newsData.map(n => n.title);
      const sentimentData = await getNewsSentiment(articleTitles, language);
      setNewsSentiment(sentimentData);
      setLoadingSentiment(false);
      
      const analysisData = await getAiAnalysis(stockData, chartData, sentimentData, language);
      setAiAnalysis(analysisData);
      setLoadingAnalysis(false);

    } catch (error) {
        console.error("Error fetching analysis or sentiment:", error);
        const errorReason = error instanceof Error ? error.message : "Unknown error";
        const errorMessage = language === 'kr' ? `AI 분석 중 오류가 발생했습니다: ${errorReason}` : `An error occurred during AI analysis: ${errorReason}`;
        
        setAiAnalysis({ analysisSummary: errorMessage, recommendation: 'Hold', confidenceScore: 0 });
        setNewsSentiment({ sentiment: 'neutral', confidenceScore: 0, reasoning: errorMessage });
        
        setLoadingAnalysis(false);
        setLoadingSentiment(false);
    }
  };

  const handleSelectTicker = (newTicker: string) => {
    if (newTicker && newTicker.toUpperCase() !== ticker) {
      setTicker(newTicker.toUpperCase());
    }
  };

  const handleToggleRealtime = () => {
    setIsRealtimeEnabled(!isRealtimeEnabled);
    console.log(`[실시간 업데이트] ${ticker} 실시간 업데이트 ${!isRealtimeEnabled ? '활성화' : '비활성화'}`);
  };

  if (isAppLoading) {
    return <LoadingScreen onLoaded={() => setIsAppLoading(false)} />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <StockSearch onSelectTicker={handleSelectTicker} currentTicker={ticker} />
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="relative overflow-hidden group border-2 border-slate-600/50 bg-slate-800/30 backdrop-blur-sm text-slate-200 hover:border-orange-400 hover:text-white transition-all duration-500 shadow-lg hover:shadow-orange-500/30 hover:shadow-2xl">
                <a href="https://futuresnow.gitbook.io/newstoday/2025-06-24/greeting/preview" target="_blank" rel="noopener noreferrer" className="relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/20 group-hover:via-orange-500/40 group-hover:to-orange-500/20 transition-all duration-500 -z-10"></div>
                  <Newspaper className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium">{t('previous_day_summary')}</span>
                </a>
              </Button>
            </div>
          </div>
          
          {/* 실시간 업데이트 상태 표시 */}
          <RealtimeStatus 
            isEnabled={isRealtimeEnabled}
            lastUpdateTime={lastUpdateTime}
            onToggle={handleToggleRealtime}
            ticker={ticker}
          />
        </div>
        
        {/* Global Indices Card */}
        <GlobalIndices />
        
        {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Data Loading Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
              {loading || chartData.length === 0 ? <Skeleton className="h-[450px] w-full" /> : <FinancialChart data={chartData} />}
            </div>
            {loading || !stockData ? <Skeleton className="h-200px] w-full" /> : <StockDataTable data={stockData} />}
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
              <AiAnalysis 
                analysis={aiAnalysis} 
                sentiment={newsSentiment} 
                loading={loadingAnalysis || loadingSentiment} 
                analysisStarted={analysisStarted}
                onStartAnalysis={handleStartAnalysis}
                stockData={stockData}
                language={language}
                allNews={[...newsData, ...marketNews]}
                stockNewsData={newsData}
                marketNewsData={marketNews}
                chartTrend={(stockData?.dailyChange?.percentage || 0) > 0 ? 'uptrend' : (stockData?.dailyChange?.percentage || 0) < 0 ? 'downtrend' : 'sideways'}
              />
            </Suspense>
            <NewsFeed news={newsData} marketNews={marketNews} loading={loadingNews} stockData={stockData} />
            <FearGreedIndex value={fearGreedIndex} loading={fearGreedIndex === null}/>
          </div>
        </div>
      </main>
    </div>
  );
}
