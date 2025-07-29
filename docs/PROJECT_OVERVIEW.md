# Kryptovision 웹사이트 개요

## 1. 프로젝트 한눈에 보기
Kryptovision은 주식 및 암호화폐 시장 데이터를 실시간으로 시각화하고, 뉴스-기반 AI 분석과 사용자 맞춤형 대시보드를 제공하는 **Next.js + Supabase** 기반 풀스택 웹 애플리케이션입니다.

## 2. 핵심 기술 스택
- **Next.js (App Router)** : React 18 기반 SSR/SSG, 라우팅 관리
- **TypeScript** : 정적 타입으로 개발 안정성 향상
- **Tailwind CSS & shadcn/ui** : 유틸리티-퍼스트 스타일링과 접근성 높은 UI 컴포넌트
- **Supabase** : PostgreSQL, Auth, Realtime, Storage 통합 백엔드
- **Genkit AI Flows** : Google-PaLM/OpenAI 모델을 활용한 AI 파이프라인
- **Chart.js** : 캔들 차트 및 지표 시각화

## 3. 주요 디렉터리 구조
- `src/app`         : 레이아웃, 페이지, 서버 액션
- `src/components/kryptovision` : 대시보드 및 기능별 React 컴포넌트
- `src/ai`          : AI 플로우(`flows/`), 스키마 정의(`schemas.ts`), 도구(`tools/`)
- `src/contexts`    : `AuthContext`, `LanguageContext` – 글로벌 상태 관리
- `src/lib`         : Supabase 클라이언트, 헬퍼, 유틸리티 함수
- `docs/`          : 프로젝트 문서(본 파일 포함)

## 4. 핵심 기능 요약
| 기능 | 설명 | 관련 컴포넌트/파일 |
|------|------|-------------------|
| **대시보드** | 시장 지표, 공포-탐욕 지수, 글로벌 지수, 뉴스 등 통합 표시 | `DashboardClient.tsx` |
| **주식 검색** | 티커 실시간 자동완성 및 상세 정보 테이블 | `StockSearch.tsx`, `StockDataTable.tsx` |
| **뉴스 피드** | 실시간 금융 뉴스 목록 & 카드, AI 요약 모달<br>**시장 뉴스:** GitBook(오선) 사이드바 헤드라인만 반영, 본문/상세 뉴스 미포함<br>**월가의 말말말:** 월가 관련 헤드라인/본문이 있으면 별도 comments로 추출하여 월가의 말말말 카드에만 사용, 시장 뉴스에는 미포함 | `NewsFeed.tsx`, `NewsCards.tsx`, `NewsSummaryModal.tsx`, `WallStreetComments.tsx` |
| **AI 종목 분석** | 사용자가 선택한 종목에 대해 뉴스 감정·재무 분석 후 요약 | `AiAnalysis.tsx`, AI 플로우 `stock-analysis-summary.ts` |
| **공포-탐욕 지수** | 대체 데이터 기반 지수 계산 & 시각화 | `FearGreedIndex.tsx`, AI 플로우 `fear-greed-index.ts` |
| **시장 일정** | 전 세계 거래소 개장·폐장 시간, 공휴일<br>**주요일정:** 크롤링은 하지만 시장 뉴스와 연동하지 않고, 별도 전역 변수/함수로만 관리(추후 주요일정 카드에서만 사용) | `MarketSchedule.tsx` |
| **글로벌 지수** | S&P 500, 나스닥, 다우 등 지수 실시간 표시 | `GlobalIndices.tsx` |
| **실시간 상태** | Supabase Realtime 연결 상태 모니터링 | `RealtimeStatus.tsx` |
| **사용자 설정** | 언어, 테마, 알림 등 개인화 설정 | `SettingsModal.tsx`, `local-settings.ts` |
| **다국어 지원** | `LanguageContext` + `translations.ts` | 언어 스위처 `LanguageSwitcher.tsx` |
| **CSV 내보내기** | AI 분석 내역을 CSV 파일로 다운로드 | `CsvExportButton.tsx` |
| **커뮤니티 코멘트** | WallStreetBets 스타일 댓글 스트림 | `WallStreetComments.tsx` |

## 5. 동작 흐름 (High-Level)
1. **초기화**: `src/lib/supabase.ts`에서 Supabase 클라이언트를 생성하고, `AuthContext`가 세션을 전역으로 제공
2. **페이지 렌더링**: App Router의 서버 컴포넌트가 데이터 패칭용 **Server Actions**(`src/app/actions.ts`)를 호출
3. **데이터 수집**: 
   - 실시간 시세 · 뉴스 → Supabase Edge Functions / 외부 API
   - **시장 뉴스**: GitBook(오선) 사이드바 헤드라인만 크롤링하여 반영, 본문/상세 뉴스 미포함
   - **월가의 말말말**: 월가 관련 헤드라인/본문이 있으면 별도 comments로 추출하여 월가의 말말말 카드에만 사용, 시장 뉴스에는 미포함
   - **주요일정**: 크롤링은 하지만 시장 뉴스와 연동하지 않고, 별도 전역 변수/함수로만 관리(추후 주요일정 카드에서만 사용)
   - AI 분석 → `src/ai/flows` 내 Genkit 파이프라인 실행 후 구조화된 응답 반환
4. **UI 업데이트**: 받은 데이터를 Zustand 없이 React state & Context로 관리, Tailwind + shadcn/ui 컴포넌트로 표시
5. **실시간 반영**: Supabase Realtime 구독을 통해 가격/코멘트 등의 변화 감지 후 자동 리렌더링

## 6. 배포 및 환경 변수
- **Vercel** 기본 배포 (Edge Runtime 지원)
- 필수 환경 변수
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GENKIT_API_KEY` (PaLM/OpenAI 등)

## 7. 유지보수 가이드
- 기능 추가 시 **해당 섹션**에 설명을 업데이트해 주세요.
- 컴포넌트 변경 시 파일 경로와 기능 표를 함께 수정해 주세요.
- AI 플로우 추가 시 `src/ai/flows`와 이 문서의 **동작 흐름** 섹션에 반영해 주세요.

---

> **참고**: 본 개요는 `2025-07-03` 기준으로 작성되었습니다. 이후 변경 사항은 PR 단위로 업데이트해 주세요.
// [2025-07-03] 시장 뉴스/월가의 말말말/주요일정 크롤링 정책 최신화 