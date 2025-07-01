import { getStockAndChartData, getStockSpecificNews, getMarketNews, getRealtimeFearGreedIndex } from "@/app/actions";
import DashboardClient from "@/components/kryptovision/DashboardClient";
import "@/lib/connection-test"; // Supabase 연결 테스트 함수 로드
import { mockChartData, mockStockData, mockNewsData, mockMarketNewsData } from "@/lib/mock-data";
import type { StockData, ChartDataPoint, NewsArticle } from "@/lib/types";
import { headers } from "next/headers";

// This is a server component, so it can be async
export default async function Home() {
  const defaultTicker = "TSLA"; // 🚀 기본 종목을 TSLA로 설정

  console.log(`[HOME] Loading initial data for ${defaultTicker}`);
  
  try {
    // ⚡ 병렬 데이터 로딩으로 속도 극대화 (Fear & Greed Index 포함)
    const [
      { stockData, chartData }, 
      newsData,
      marketNews,
      fearGreedIndex
    ] = await Promise.all([
      getStockAndChartData(defaultTicker),
      getStockSpecificNews(defaultTicker, 'kr'),
      getMarketNews('kr'),
      getRealtimeFearGreedIndex(),
    ]);

    console.log(`[HOME] ✅ Data loaded - Stock: ${stockData ? '✓' : '✗'}, Charts: ${chartData.length}, News: ${newsData.length}, Market News: ${marketNews.length}, Fear&Greed: ${fearGreedIndex}`);

    // ✅ DashboardClient에서 기대하는 initialData 형태로 구성
    const initialData = {
      stockData: stockData,
      chartData: chartData,
      fearGreedIndex: fearGreedIndex?.indexValue || null, // 🔥 실시간 Fear & Greed Index (indexValue 추출)
      marketNews: marketNews.slice(0, 20), // 마켓 뉴스로 더 많이 사용
      newsData: newsData, // 종목 뉴스
      error: null,
      language: 'kr',
      globalIndices: []
    };

    return <DashboardClient initialData={initialData} />;
  } catch (error) {
    console.error('[HOME] Critical error:', error);
    
    // 🛡️ 에러 시에도 기본 컴포넌트 렌더링 (Fear & Greed Index 시뮬레이션)
    const fallbackFearGreed = Math.round(50 + Math.sin(Date.now() / 3600000) * 20); // 실시간 시뮬레이션
    
    const fallbackData = {
      stockData: null,
      chartData: [],
      fearGreedIndex: fallbackFearGreed, // 🔥 에러 시에도 동적 Fear & Greed
      marketNews: [],
      newsData: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      language: 'kr',
      globalIndices: []
    };
    
    return <DashboardClient initialData={fallbackData} />;
  }
}
