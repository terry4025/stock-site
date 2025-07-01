import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// 🔑 업그레이드된 Gemini API 키 설정
process.env.GOOGLE_AI_API_KEY = 'AIzaSyBeiOwYWGupnzAXMO3t6pdVyYHFptd16Og';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-pro', // 기본 모델: Gemini 2.5 Pro
});

// 🎯 AI 모델 사용 구조:
// 📊 AI 주식 분석 (stock-analysis-summary): Gemini 2.5 Pro (명시적 설정)
// 📰 AI 뉴스 요약 (getNewsSummary): Gemini 2.5 Flash-Lite (직접 API 호출)
// 🔍 뉴스 감정 분석 (news-sentiment-analysis): Gemini 2.5 Pro (기본 모델)
// 📈 기타 AI 플로우들: Gemini 2.5 Pro (기본 모델)
