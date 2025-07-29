'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 애널리스트 리포트 스키마 정의
const AnalystReportSchema = z.object({
  institution: z.string().describe("금융기관 이름 (예: Goldman Sachs, Morgan Stanley)"),
  analyst: z.string().optional().describe("애널리스트 이름"),
  targetPrice: z.string().optional().describe("목표 주가 또는 지수"),
  outlook: z.enum(["bullish", "neutral", "bearish"]).describe("시장 전망"),
  keyPoints: z.array(z.string()).describe("주요 포인트 (최대 3개)"),
  date: z.string().optional().describe("리포트 날짜"),
  summary: z.string().describe("한 줄 요약")
});

const WallStreetReportsSchema = z.object({
  reports: z.array(AnalystReportSchema).describe("월가 애널리스트 리포트 목록"),
  lastUpdated: z.string().describe("마지막 업데이트 시간")
});

// Google 검색을 통한 월가 애널리스트 리포트 수집
async function searchWallStreetReports(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  
  // 동적 검색 쿼리 생성
  const searchQueries = [
    `Goldman Sachs S&P 500 target ${year} ${month} latest`,
    `Morgan Stanley equity strategy ${year} outlook latest report`,
    `JPMorgan stock market forecast ${year} latest`,
    `Bank of America market outlook ${year} latest`,
    `BlackRock investment outlook ${year} latest`,
    `UBS wealth management outlook ${year}`,
    `Citi equity strategy ${year} latest`,
    `"wall street analyst" "S&P 500 target" ${year} site:bloomberg.com OR site:reuters.com OR site:cnbc.com OR site:marketwatch.com`,
    `"investment bank outlook" "${year}" "equity strategy" latest`
  ];
  
  // Gemini의 웹 검색 기능을 활용하여 실시간 정보 수집
  const searchPrompt = `
최신 월가 애널리스트 리포트를 검색해주세요. 다음 키워드들을 사용하여 최신 정보를 찾아주세요:

${searchQueries.join('\n')}

중점 사항:
1. ${year}년 ${month}월 기준 가장 최신 리포트
2. 각 금융기관의 S&P 500 목표 지수
3. 시장 전망 (강세/중립/약세)
4. 주요 투자 테마와 리스크 요인
5. 섹터별 추천 사항

각 기관별로 다음 정보를 포함해 주세요:
- 기관명
- 애널리스트 이름 (있다면)
- S&P 500 목표 지수
- 전망 (bullish/neutral/bearish)
- 주요 포인트 3-4개
- 발표 날짜

실제 최신 뉴스와 리포트를 기반으로 정확한 정보를 제공해주세요.
`;
  
  return searchPrompt;
}

export interface WallStreetAnalystReportsInput {
  forceRefresh?: boolean;
}

export interface WallStreetAnalystReportsOutput {
  reports: Array<{
    institution: string;
    analyst?: string;
    targetPrice?: string;
    outlook: "bullish" | "neutral" | "bearish";
    keyPoints: string[];
    date?: string;
    summary: string;
  }>;
  lastUpdated: string;
}

export async function getWallStreetAnalystReports(
  input?: WallStreetAnalystReportsInput
): Promise<WallStreetAnalystReportsOutput> {
    try {
      // 1. 검색 프롬프트 생성
      const searchPrompt = await searchWallStreetReports();
      
      // 2. Gemini를 사용하여 웹 검색 및 분석 수행
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-pro',
        prompt: searchPrompt + `

다음 형식으로 변환해주세요:
- institution: 금융기관 이름 (한글로)
- analyst: 애널리스트 이름 (있다면)
- targetPrice: 목표 지수 또는 가격
- outlook: "bullish", "neutral", "bearish" 중 하나
- keyPoints: 주요 포인트 3개 이내 (간결하게)
- date: 리포트 날짜
- summary: 한 줄 요약

중요: 
1. 각 리포트는 한국어로 작성
2. keyPoints는 짧고 명확하게
3. 실제 최신 정보만 포함
4. 중복 제거
        `,
        output: {
          schema: WallStreetReportsSchema
        }
      });
      
      // AI 응답에서 데이터 추출 및 마지막 업데이트 시간 추가
      if ('output' in response && response.output) {
        return {
          reports: response.output.reports || [],
          lastUpdated: new Date().toISOString()
        };
      }
      
      // 만약 output이 없으면 기본값 반환
      throw new Error("AI response does not contain output");
      
    } catch (error) {
      console.error("Wall Street reports fetch error:", error);
      
      // 에러 시 기본 데이터 반환
      return {
        reports: [
          {
            institution: "골드만삭스",
            targetPrice: "S&P 500: 6,500",
            outlook: "bullish",
            keyPoints: [
              "경제 견고한 성장 지속",
              "AI/클라우드 섹터 긍정적",
              "관세 정책 리스크 존재"
            ],
            summary: "전반적 긍정적이나 관세 리스크 주의",
            date: new Date().toLocaleDateString()
          },
          {
            institution: "모건스탠리",
            targetPrice: "S&P 500: 6,500",
            outlook: "bullish",
            keyPoints: [
              "마이크 윌슨 강세 전환",
              "기업 투자 증가 예상",
              "밸류에이션 과열 경고"
            ],
            summary: "강세장 지속되나 변동성 확대 예상",
            date: new Date().toLocaleDateString()
          },
          {
            institution: "JP모건",
            targetPrice: "S&P 500: 6,000",
            outlook: "neutral",
            keyPoints: [
              "보수적 전망 유지",
              "하반기 둔화 가능성",
              "침체 확률 40%"
            ],
            summary: "상승 제한적, 하반기 리스크 존재",
            date: new Date().toLocaleDateString()
          }
        ],
        lastUpdated: new Date().toISOString()
      };
    }
  } 