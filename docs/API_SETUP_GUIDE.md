# 🚀 실시간 금융 데이터 및 AI 기능 설정 가이드

이 가이드는 실시간 데이터와 AI 기능이 완벽하게 작동하도록 설정하는 방법을 안내합니다.

## 📋 현재 상태

✅ **완료된 기능**:
- AI 분석 기능 (Gemini 2.5 Pro 사용)
- 뉴스 감정 분석
- 뉴스 요약 기능
- 실시간 데이터 멀티소스 API
- Fear & Greed 지수

⚠️ **설정 필요**:
- Gemini API 키 설정
- 환경 변수 파일 생성

## 🔑 필수 API 키 설정

### 1. Gemini API 키 발급 (무료)

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. API 키 복사

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# Gemini AI API 키 (필수!)
GEMINI_API_KEY=여기에_발급받은_Gemini_API_키를_입력하세요

# 실시간 데이터 API 설정 (선택사항 - 기본값 사용 권장)
NEXT_PUBLIC_PREFERRED_API=multisource

# Alpha Vantage API 키 (선택사항 - 백업용)
# https://www.alphavantage.co/support/#api-key 에서 무료 발급
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=demo

# Finnhub API 키 (선택사항 - 백업용)
# https://finnhub.io/register 에서 무료 발급
NEXT_PUBLIC_FINNHUB_API_KEY=demo
```

## 🌐 실시간 데이터 API 옵션

현재 사용 가능한 실시간 데이터 소스:

| API 옵션 | 설명 | 안정성 | 권장도 |
|---------|------|--------|--------|
| `multisource` | 여러 소스에서 동시에 데이터 수집 | ⭐⭐⭐⭐⭐ | 👍 추천 |
| `race` | 가장 빠른 응답 사용 | ⭐⭐⭐⭐ | 빠른 응답 |
| `naver` | 네이버 금융 크롤링 | ⭐⭐⭐⭐ | 한국 데이터 |
| `investing` | Investing.com 크롤링 | ⭐⭐⭐⭐ | 글로벌 데이터 |
| `kis` | 한국투자증권 API | ⭐⭐⭐⭐⭐ | 정확한 데이터 |
| `simulation` | 시뮬레이션 데이터 | ⭐⭐⭐⭐⭐ | 테스트용 |

## 🚀 빠른 시작

### Windows PowerShell에서:

```powershell
# 1. 환경 변수 설정 (일시적)
$env:GEMINI_API_KEY="your_actual_gemini_api_key_here"
$env:NEXT_PUBLIC_PREFERRED_API="multisource"

# 2. 개발 서버 시작
npm run dev
```

### macOS/Linux에서:

```bash
# 1. 환경 변수 설정 (일시적)
export GEMINI_API_KEY="your_actual_gemini_api_key_here"
export NEXT_PUBLIC_PREFERRED_API="multisource"

# 2. 개발 서버 시작
npm run dev
```

## ✅ 작동 확인

1. **실시간 데이터**: 글로벌 지수가 5분마다 자동 업데이트되는지 확인
2. **AI 분석**: "AI 분석 시작" 버튼 클릭 시 실제 분석이 표시되는지 확인
3. **뉴스 요약**: 뉴스 클릭 시 AI 요약이 생성되는지 확인

## 🐛 문제 해결

### "API 키가 설정되지 않았습니다" 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- API 키가 올바르게 입력되었는지 확인
- 서버를 재시작 (Ctrl+C 후 `npm run dev`)

### 실시간 데이터가 업데이트되지 않음
- 브라우저 콘솔에서 에러 확인
- `NEXT_PUBLIC_PREFERRED_API`를 다른 옵션으로 변경해보기

### AI 분석이 작동하지 않음
- Gemini API 키가 유효한지 확인
- [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 사용량 확인

## 📊 추가 기능

### 1. 뉴스 클릭 시 AI 요약
- 뉴스 항목을 클릭하면 Gemini AI가 자동으로 요약 생성
- 한국어/영어 자동 번역 지원

### 2. 실시간 차트
- 일봉 차트 자동 업데이트
- 이동평균선 표시

### 3. Fear & Greed 지수
- 시장 심리 실시간 분석
- 5분마다 자동 업데이트

## 🎯 권장 설정

```bash
# .env.local 파일의 권장 설정
GEMINI_API_KEY=your_actual_key_here
NEXT_PUBLIC_PREFERRED_API=multisource
```

이 설정으로 최적의 성능과 안정성을 보장합니다.

## 💡 팁

1. **무료 Gemini API**: 분당 60회 요청 제한이 있으므로 적절히 사용
2. **멀티소스 API**: 여러 소스를 사용하므로 하나가 실패해도 작동
3. **개발 중**: 시뮬레이션 모드로 테스트 가능 (`NEXT_PUBLIC_PREFERRED_API=simulation`)

## 📞 지원

문제가 지속되면 다음을 확인하세요:
- 브라우저 개발자 도구 콘솔
- 터미널의 서버 로그
- `src/app/actions.ts` 파일의 로그 메시지

---

**중요**: 실제 서비스 배포 시에는 환경 변수를 안전하게 관리하고, API 키를 노출하지 마세요! 