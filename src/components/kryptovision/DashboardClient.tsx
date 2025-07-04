"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { getAiAnalysis, getNewsSentiment, getRealtimeFearGreedIndex, getHeadlines, getStockAndChartData, getStockSpecificNews, getMarketNews, startAutoNewsUpdate, getDynamicDateStatus, manualCheckForNewNews } from "@/app/actions";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { type StockData, type NewsArticle, type ChartData, type ChartDataPoint } from "@/lib/types";
import { initializeUserData, applyUserSettings, updateLoginActivity, startUserSession } from "@/lib/user-menu-helpers";

import Header from "@/components/kryptovision/Header";
import StockSearch from "@/components/kryptovision/StockSearch";
import GlobalIndices from "@/components/kryptovision/GlobalIndices";
import FinancialChart from "@/components/kryptovision/FinancialChart";
import StockDataTable from "@/components/kryptovision/StockDataTable";
import AiAnalysis from "@/components/kryptovision/AiAnalysis";
import NewsCards from "@/components/kryptovision/NewsCards";
import SidebarInfo from "@/components/kryptovision/SidebarInfo";
import FearGreedIndex from "@/components/kryptovision/FearGreedIndex";
import RealtimeStatus from "@/components/kryptovision/RealtimeStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mockChartData, mockStockData, mockNewsData } from "@/lib/mock-data";
import LoadingScreen from "./LoadingScreen";

export default function DashboardClient({ initialData }: { initialData: any }) {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  
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

  // 🚀 앱 초기화 및 사용자 데이터 로드
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 [DashboardClient] Starting app initialization...');
        
        // 최소 로딩 시간 보장 (UX 개선)
        const minLoadingPromise = new Promise(resolve => setTimeout(resolve, 2000));
        
        // 사용자가 로그인되어 있으면 데이터 초기화
        let userDataPromise = Promise.resolve();
        if (user?.id) {
          console.log('👤 [DashboardClient] User logged in, initializing user data...');
          userDataPromise = initializeUserData(user.id).then(userData => {
            console.log('📊 [DashboardClient] User data loaded:', userData);
            
            // 사용자 설정 적용
            if (userData.settings) {
              applyUserSettings(userData.settings);
              
              // 언어 설정이 있으면 적용
              if (userData.settings.language && (userData.settings.language === 'kr' || userData.settings.language === 'en')) {
                setLanguage(userData.settings.language as 'en' | 'kr');
              }
            }
            
            // 로그인 활동 업데이트
            updateLoginActivity(user.id);
            
            // 세션 시작
            startUserSession(user.id);
          }).catch(err => {
            console.warn('⚠️ [DashboardClient] Failed to load user data:', err);
          });
        }
        
        // 🚀 자동 뉴스 업데이트 시스템 시작 (타임아웃 에러 수정)
        console.log('📰 [DashboardClient] Starting auto news update system...');
        try {
          const autoUpdateResult = await startAutoNewsUpdate();
          console.log('📰 [DashboardClient] Auto news update result:', autoUpdateResult);
        } catch (autoUpdateError) {
          console.warn('⚠️ [DashboardClient] Auto news update failed:', autoUpdateError);
          // 에러가 있어도 앱 초기화는 계속
        }
        
        // 모든 초기화 작업 완료 대기
        await Promise.all([minLoadingPromise, userDataPromise]);
        
        console.log('✅ [DashboardClient] App initialization completed');
        setIsAppLoading(false);
        
      } catch (error) {
        console.error('❌ [DashboardClient] Error during app initialization:', error);
        // 에러가 있어도 로딩은 완료
        setIsAppLoading(false);
      }
    };

    initializeApp();
  }, [user?.id, setLanguage]);

  // 📰 새로운 뉴스 감지 이벤트 리스닝 (자동 뉴스 업데이트)
  useEffect(() => {
    const handleNewMarketNews = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { date, articles } = customEvent.detail;
      console.log(`📰 [DashboardClient] New market news detected for ${date}:`, articles?.length || 0, 'articles');
      
      try {
        // 마켓 뉴스 자동 업데이트
        console.log('📰 [DashboardClient] Auto-refreshing market news...');
        const freshMarketNews = await getMarketNews(language);
        setMarketNews(freshMarketNews);
        
        // 주식별 뉴스도 업데이트 (현재 선택된 종목)
        if (ticker) {
          console.log(`📰 [DashboardClient] Auto-refreshing ${ticker} specific news...`);
          const freshStockNews = await getStockSpecificNews(ticker, language);
          setNewsData(freshStockNews);
        }
        
        console.log('📰 [DashboardClient] News auto-refresh completed');
        
        // 사용자에게 알림 (옵션)
        if (typeof window !== 'undefined') {
          // 브라우저 알림이나 토스트 메시지로 새로운 뉴스 알림 가능
          console.log('🔔 [DashboardClient] New market news available!');
        }
        
      } catch (error) {
        console.error('❌ [DashboardClient] Failed to auto-refresh news:', error);
      }
    };

    // 새로운 뉴스 이벤트 리스너 등록
    window.addEventListener('newMarketNewsAvailable', handleNewMarketNews);

    return () => {
      window.removeEventListener('newMarketNewsAvailable', handleNewMarketNews);
    };
  }, [language, ticker]);

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
  
                // 🚀 주식 데이터를 먼저 빠르게 로드
        console.log(`📊 [DashboardClient] ${currentTicker} 주식 데이터 요청 시작...`);
        const stockPromise = getStockAndChartData(currentTicker);
        
        // 🗞️ 뉴스 데이터는 병렬로 요청하되 개별 타임아웃 적용
        console.log(`📰 [DashboardClient] ${analysisTicker} 뉴스 데이터 요청 시작...`);
        const newsPromise = Promise.allSettled([
          Promise.race([
            getStockSpecificNews(analysisTicker, language),
            new Promise<NewsArticle[]>((_, reject) => 
              setTimeout(() => reject(new Error('Stock news timeout')), 45000)
            )
          ]),
          Promise.race([
            getMarketNews(language),
            new Promise<NewsArticle[]>((_, reject) => 
              setTimeout(() => reject(new Error('Market news timeout')), 25000)
            )
          ])
        ]);

        // 주식 데이터는 빠른 타임아웃으로 처리
        const crawledResult = await Promise.race([
          stockPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Stock data timed out after 15 seconds.')), 15000)
          )
        ]) as { stockData: StockData | null, chartData: ChartDataPoint[] };

        // 뉴스 데이터는 비동기로 처리
        const newsResults = await newsPromise;
        const stockArticles = newsResults[0].status === 'fulfilled' ? newsResults[0].value : [];
        const marketArticles = newsResults[1].status === 'fulfilled' ? newsResults[1].value : [];
        
        if (newsResults[0].status === 'rejected') {
          console.warn(`📰 [DashboardClient] 종목 뉴스 로드 실패:`, newsResults[0].reason);
        }
        if (newsResults[1].status === 'rejected') {
          console.warn(`📈 [DashboardClient] 시장 뉴스 로드 실패:`, newsResults[1].reason);
        }
  
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
      
      const analysisData = await getAiAnalysis(
        stockData, 
        chartData, 
        sentimentData, 
        language,
        user?.id,
        [...newsData, ...marketNews],
        marketNews
      );
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

  // 로딩 스크린 표시
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
            {loading || !stockData ? <Skeleton className="h-[200px] w-full" /> : <StockDataTable data={stockData} />}
            {/* 📰 최신 뉴스 카드를 가격/볼륨 정보 아래로 이동 */}
            <NewsCards news={newsData} marketNews={marketNews} loading={loadingNews} stockData={stockData} />
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
            {/* 📅 일정 + 💬 월가의 말말말 사이드바 추가 */}
            <SidebarInfo marketNews={marketNews} />
          </div>
        </div>
        
        {/* 🔥 공포 & 탐욕 지수를 맨 아래 전체 폭으로 배치 */}
        <div className="w-full">
          <FearGreedIndex value={fearGreedIndex} loading={fearGreedIndex === null}/>
        </div>
      </main>
    </div>
  );
}
