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
  summary?: string; // AI 요약을 위한 필드
  content?: string; // 🔥 AI 요약을 위한 뉴스 본문 필드
  ticker?: string; // 종목 티커 (종목 뉴스용)
  category?: string; // 뉴스 카테고리 (stock, market, etc.)
  sentiment?: string; // 감정 분석 결과 (positive, negative, neutral)
  isGeminiGenerated?: boolean; // 제미나이로 생성된 뉴스인지 여부
}

export type ChartData = ChartDataPoint[];

export interface MarketIndicator {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}
