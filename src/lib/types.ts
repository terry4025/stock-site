export interface StockData {
  ticker: string;
  name: string;
  exchange: string;
  currentPrice: number;
  dailyChange: {
    value: number;
    percentage: number;
  };
  volume: string;
  marketCap: string;
  peRatio: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  dividendYield: number | null;
  beta: number | null;
}

// AI 분석 결과 타입 추가
export interface AiAnalysisResult {
  analysisSummary: string;
  recommendation: string;
  confidenceScore: number;
  // 새로 추가된 투자 정보
  shortTermTarget?: number; // 단기 목표가 (3-6개월)
  longTermTarget?: number;  // 장기 목표가 (1-2년)
  buyPrice?: number;        // 추천 매수가
  sellPrice?: number;       // 추천 매도가
  riskLevel?: 'low' | 'medium' | 'high'; // 투자 위험도
}

export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  range: [number, number];
  volume: number;
  ma20?: number; // Optional
  ma50?: number; // Optional
}

export interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  language?: string; // 뉴스 언어 ('kr' | 'en')
  summary?: string; // AI 요약을 위한 필드
  content?: string; // 🔥 AI 요약을 위한 뉴스 본문 필드
  ticker?: string; // 종목 티커 (종목 뉴스용)
  category?: string; // 뉴스 카테고리 (stock, market, etc.)
  sentiment?: string; // 감정 분석 결과 (positive, negative, neutral)
  isGeminiGenerated?: boolean; // 제미나이로 생성된 뉴스인지 여부
  isRealNews?: boolean; // 실제 뉴스 링크인지 여부
  schedule?: string[]; // 📅 다음날 주요 일정 정보
  scheduleTitle?: string; // 📅 일정 섹션 제목
  wallStreetComments?: string[]; // 💬 월가의 말말말
  wallStreetTitle?: string; // 💬 월가 코멘트 제목
}

export type ChartData = ChartDataPoint[];

export interface MarketIndicator {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}
