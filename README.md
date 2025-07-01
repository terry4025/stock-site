# 🚀 AI 기반 실시간 금융 분석 플랫폼

Gemini 2.5 Pro AI를 활용한 실시간 주식 시장 분석 및 투자 추천 웹 애플리케이션입니다.

## ✨ 주요 기능

- 📊 **실시간 시장 데이터**: 코스피, 나스닥, S&P 500, USD/KRW 환율
- 🤖 **AI 투자 분석**: Gemini 2.5 Pro를 활용한 종합적인 매수/매도 추천
- 📰 **뉴스 요약 및 감정 분석**: AI가 뉴스를 분석하여 시장 심리 파악
- 📈 **기술적 차트 분석**: 실시간 가격 차트 및 거래량 분석
- 🌡️ **Fear & Greed 지수**: 시장 심리 지표 실시간 추적
- 🌐 **다국어 지원**: 한국어/영어 자동 전환

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **AI**: Google Gemini 2.5 Pro, Genkit
- **차트**: Recharts
- **데이터**: 멀티소스 실시간 API

## 📦 설치 방법

```bash
# 저장소 클론
git clone [repository-url]
cd project

# 의존성 설치
npm install
```

## 🔑 필수 설정

### 1. Gemini API 키 발급 (무료)

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. API 키 복사

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용 입력:

```bash
# Gemini AI API 키 (필수!)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# 실시간 데이터 API 설정
NEXT_PUBLIC_PREFERRED_API=multisource
```

## 🚀 실행 방법

### Windows PowerShell:
```powershell
# 환경 변수 설정 (일시적)
$env:GEMINI_API_KEY="your_actual_gemini_api_key_here"

# 개발 서버 시작
npm run dev
```

### macOS/Linux:
```bash
# 환경 변수 설정 (일시적)
export GEMINI_API_KEY="your_actual_gemini_api_key_here"

# 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📖 사용 가이드

1. **종목 검색**: 상단 검색창에서 종목 코드 입력 (예: TSLA, AAPL, 005930)
2. **AI 분석 시작**: "AI 분석 시작" 버튼 클릭
3. **뉴스 요약**: 뉴스 제목 클릭 시 AI 요약 자동 생성
4. **언어 변경**: 우측 상단 언어 선택 버튼

## 🔧 문제 해결

### API 키 오류
- `.env.local` 파일 확인
- 서버 재시작 필요

### 실시간 데이터 문제
- 콘솔에서 에러 메시지 확인
- `NEXT_PUBLIC_PREFERRED_API` 값 변경 시도

자세한 설정 가이드는 [docs/API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md) 참고

## 📝 라이선스

MIT License
