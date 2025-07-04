"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import { formatDistanceToNow } from "date-fns";
import { enUS, ko, type Locale } from "date-fns/locale";
import type { NewsArticle, StockData } from "@/lib/types";
import { useState, useEffect } from "react";
import NewsSummaryModal from "./NewsSummaryModal";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, MapPin, Filter, Play, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { getHeadlines, getGlobalSchedule, getGlobalWallStreetComments, getLatestOsenGitBookUrl, manualCheckForNewNews, getDynamicDateStatus } from '@/app/actions';
import MarketSchedule from './MarketSchedule';
import WallStreetComments from './WallStreetComments';

interface NewsFeedProps {
  news: NewsArticle[];
  marketNews: NewsArticle[];
  loading: boolean;
  stockData: StockData | null;
}

interface NewsState {
  market: NewsArticle[];
  stock: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  isStockLoading: boolean;
  marketNewsFilter: 'all' | 'domestic' | 'international'; // 시장 뉴스 필터
  stockNewsFilter: 'all' | 'domestic' | 'international';  // 종목 뉴스 필터
  globalSchedule: string[];
  wallStreetComments: string[];
  latestOsenUrl: string; // 🔥 동적 오선 GitBook URL
  lastValidOsenUrl: string; // 💾 마지막으로 검증된 작동하는 URL
  lastUrlUpdate: number; // 🕒 마지막 URL 업데이트 시간
  // 🔄 뉴스 업데이트 체크 상태
  isCheckingNewNews: boolean;
  lastNewsCheckTime: number;
  currentActiveDate: string | null;
  hasNewNewsAvailable: boolean;
  newsCheckMessage: string;
}

const NewsItem = ({ article, locale, onClick }: { article: NewsArticle; locale: Locale, onClick: () => void }) => (
  <button onClick={onClick} className="block w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors focus:outline-none">
    <p className="font-semibold text-sm">{article.title}</p>
    <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
      {article.source} &middot; {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale })}
    </p>
  </button>
);

export default function NewsFeed({ news, marketNews, loading, stockData }: NewsFeedProps) {
  const { t, language } = useLanguage();
  const locale = language === 'kr' ? ko : enUS;

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isStockArticle, setIsStockArticle] = useState(false);
  const [newsState, setNewsState] = useState<NewsState>({
    market: [],
    stock: [],
    isLoading: true,
    error: null,
    isStockLoading: false,
    marketNewsFilter: 'all',
    stockNewsFilter: 'all',
    globalSchedule: [],
    wallStreetComments: [],
    latestOsenUrl: 'https://futuresnow.gitbook.io/newstoday/2025-06-30/greeting/preview', // 🔗 기본 URL (제공된 링크)
    lastValidOsenUrl: 'https://futuresnow.gitbook.io/newstoday/2025-06-30/greeting/preview', // 💾 검증된 URL (동일하게 시작)
    lastUrlUpdate: 0, // 🕒 초기값
    // 🔄 뉴스 업데이트 체크 상태 초기값
    isCheckingNewNews: false,
    lastNewsCheckTime: 0,
    currentActiveDate: null,
    hasNewNewsAvailable: false,
    newsCheckMessage: ''
  });

  // 🔍 URL 검증 함수 - 실제로 접근 가능한지 확인
  const verifyUrlAccess = async (url: string): Promise<boolean> => {
    console.log(`[URL 검증] 🔍 URL 접근 가능 여부 체크: ${url}`);
    
    try {
      // HEAD 요청으로 빠른 검증 (2초 타임아웃)
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(2000)
      });
      
      const isAccessible = response.ok && response.status === 200;
      console.log(`[URL 검증] ${isAccessible ? '✅' : '❌'} 결과: ${response.status} - ${url}`);
      
      return isAccessible;
      
    } catch (error) {
      console.log(`[URL 검증] ❌ 접근 실패: ${url} -`, error);
      return false;
    }
  };

  // 🚀 동적 오선 GitBook URL 계산 함수 (새로운 구조: greeting/preview)
  const calculateLatestOsenUrl = (): string => {
    const today = new Date();
    let checkDate = new Date(today);
    
    // 현재 시간에서 가장 가능성 높은 평일 날짜 찾기
    for (let i = 0; i <= 7; i++) {
      const dayOfWeek = checkDate.getDay();
      
      // 평일인지 확인 (월요일=1 ~ 금요일=5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dateString = checkDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        const gitBookUrl = `https://futuresnow.gitbook.io/newstoday/${dateString}/greeting/preview`;
        
        console.log(`[오선 URL] 💡 새로운 구조로 최신 평일 날짜 계산: ${dateString} → ${gitBookUrl}`);
        return gitBookUrl;
      }
      
      // 하루씩 뒤로 이동
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // 폴백: 기본 GitBook 페이지
    console.log('[오선 URL] ⚠️ 폴백 URL 사용');
    return 'https://futuresnow.gitbook.io/newstoday/';
  };

  // 🔄 수동 뉴스 업데이트 체크 함수
  const handleManualNewsCheck = async () => {
    console.log('[뉴스 체크] 🔍 수동 뉴스 체크 시작...');
    
    setNewsState(prev => ({
      ...prev,
      isCheckingNewNews: true,
      newsCheckMessage: '새로운 뉴스를 확인하는 중...'
    }));
    
    try {
      // 1단계: 현재 활성 날짜 상태 확인
      const dateStatus = await getDynamicDateStatus();
      console.log('[뉴스 체크] 📅 현재 날짜 상태:', dateStatus);
      
      // 2단계: 수동으로 새로운 뉴스 체크
      const checkResult = await manualCheckForNewNews();
      console.log('[뉴스 체크] 🎯 체크 결과:', checkResult);
      
      const now = Date.now();
      
      if (checkResult.success) {
        if (checkResult.hasNew && checkResult.newDate) {
          // 새로운 뉴스 발견!
          setNewsState(prev => ({
            ...prev,
            isCheckingNewNews: false,
            lastNewsCheckTime: now,
            currentActiveDate: checkResult.newDate || null,
            hasNewNewsAvailable: true,
            newsCheckMessage: `🎉 새로운 뉴스가 발견되었습니다! (${checkResult.newDate})`
          }));
          
          // 페이지 새로고침을 통해 새로운 뉴스 로드
          console.log('[뉴스 체크] 🔄 새로운 뉴스 발견, 페이지 새로고침...');
          window.location.reload();
          
        } else {
          // 새로운 뉴스 없음
          setNewsState(prev => ({
            ...prev,
            isCheckingNewNews: false,
            lastNewsCheckTime: now,
            currentActiveDate: dateStatus.currentActiveDate,
            hasNewNewsAvailable: false,
            newsCheckMessage: `📰 아직 새로운 뉴스가 없습니다 (현재: ${dateStatus.currentActiveDate})`
          }));
        }
      } else {
        // 체크 실패
        setNewsState(prev => ({
          ...prev,
          isCheckingNewNews: false,
          lastNewsCheckTime: now,
          hasNewNewsAvailable: false,
          newsCheckMessage: '❌ 뉴스 체크 중 오류가 발생했습니다'
        }));
      }
      
    } catch (error) {
      console.error('[뉴스 체크] ❌ 수동 뉴스 체크 실패:', error);
      
      setNewsState(prev => ({
        ...prev,
        isCheckingNewNews: false,
        lastNewsCheckTime: Date.now(),
        hasNewNewsAvailable: false,
        newsCheckMessage: '❌ 뉴스 체크 중 오류가 발생했습니다'
      }));
    }
  };

  // 🔄 스마트한 URL 업데이트 시스템 (검증 + 롤백 기능)
  useEffect(() => {
    const updateOsenUrlWithVerification = async () => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1시간 = 60분 * 60초 * 1000ms
      
      // 처음 로드이거나 1시간이 지났으면 URL 업데이트 시도
      if (newsState.lastUrlUpdate === 0 || now - newsState.lastUrlUpdate > oneHour) {
        console.log('[오선 URL] 🚀 스마트한 URL 업데이트 시작...');
        
        let newUrl = '';
        let isNewUrlValid = false;
        
        // 1단계: 서버에서 최신 URL 가져오기 시도
        try {
          console.log('[오선 URL] 🔍 1단계: 서버에서 최신 URL 가져오는 중...');
          const { url, date, success } = await getLatestOsenGitBookUrl();
          newUrl = url;
          
          console.log(`[오선 URL] 📅 서버에서 제안한 URL: ${date} → ${url} (서버 성공: ${success})`);
          
        } catch (error) {
          console.warn('[오선 URL] ⚠️ 서버 요청 실패, 클라이언트 계산으로 진행:', error);
          newUrl = calculateLatestOsenUrl();
          console.log(`[오선 URL] 🔧 클라이언트 계산 URL: ${newUrl}`);
        }
        
        // 2단계: 새로운 URL 접근 가능 여부 검증
        if (newUrl && newUrl !== newsState.lastValidOsenUrl) {
          console.log('[오선 URL] 🔍 2단계: 새로운 URL 접근 가능성 검증...');
          isNewUrlValid = await verifyUrlAccess(newUrl);
          
          if (isNewUrlValid) {
            // ✅ 새로운 URL이 작동함 - 업데이트
            console.log(`[오선 URL] ✅ 새로운 URL 검증 성공! 업데이트 진행: ${newUrl}`);
            
            setNewsState(prev => ({
              ...prev,
              latestOsenUrl: newUrl,
              lastValidOsenUrl: newUrl, // 💾 검증된 URL로 저장
              lastUrlUpdate: now
            }));
            
          } else {
            // ❌ 새로운 URL이 작동하지 않음 - 이전 검증된 URL 유지
            console.warn(`[오선 URL] ❌ 새로운 URL 접근 불가! 이전 검증된 URL 유지: ${newsState.lastValidOsenUrl}`);
            
            setNewsState(prev => ({
              ...prev,
              latestOsenUrl: prev.lastValidOsenUrl, // 🔄 이전 검증된 URL로 롤백
              lastUrlUpdate: now // 시간은 업데이트 (재시도 방지)
            }));
          }
          
        } else if (newUrl === newsState.lastValidOsenUrl) {
          // 📋 동일한 URL이므로 검증 생략
          console.log(`[오선 URL] 📋 동일한 URL이므로 검증 생략: ${newUrl}`);
          
          setNewsState(prev => ({
            ...prev,
            lastUrlUpdate: now
          }));
          
        } else {
          // 🆘 새로운 URL을 가져오지 못함 - 현재 검증된 URL 유지
          console.warn('[오선 URL] 🆘 새로운 URL을 가져오지 못함, 현재 URL 유지');
          
          setNewsState(prev => ({
            ...prev,
            lastUrlUpdate: now
          }));
        }
        
        console.log(`[오선 URL] 🏁 업데이트 완료: ${newsState.latestOsenUrl}`);
      }
    };
    
    // 초기 URL 설정 및 검증
    updateOsenUrlWithVerification();
    
    // 매 시간마다 스마트 URL 업데이트 (60분 = 3,600,000ms)
    const urlUpdateInterval = setInterval(updateOsenUrlWithVerification, 60 * 60 * 1000);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      clearInterval(urlUpdateInterval);
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 🔄 수동 URL 체크 및 갱신 (검증 포함)
  const handleManualUrlUpdate = async () => {
    console.log('[오선 URL] 🔄 수동 URL 갱신 시작...');
    
    try {
      let newUrl = '';
      let verificationResult = false;
      let serverSuccess = false;
      let dateInfo = '';
      
      // 1단계: 서버에서 최신 URL 가져오기
      try {
        const { url, date, success } = await getLatestOsenGitBookUrl();
        newUrl = url;
        serverSuccess = success;
        dateInfo = date;
        
        console.log(`[오선 URL] 📅 서버 제안 URL: ${date} → ${url} (서버 성공: ${success})`);
        
      } catch (error) {
        console.warn('[오선 URL] ⚠️ 서버 요청 실패, 클라이언트 계산 사용:', error);
        newUrl = calculateLatestOsenUrl();
        serverSuccess = false;
        dateInfo = '클라이언트 계산';
      }
      
      // 2단계: URL 접근 가능성 검증
      if (newUrl) {
        console.log('[오선 URL] 🔍 URL 접근 가능성 검증 중...');
        verificationResult = await verifyUrlAccess(newUrl);
        
        if (verificationResult) {
          // ✅ 검증 성공 - 새로운 URL 적용
          console.log(`[오선 URL] ✅ 검증 성공! 새로운 URL 적용: ${newUrl}`);
          
          const now = Date.now();
          setNewsState(prev => ({
            ...prev,
            latestOsenUrl: newUrl,
            lastValidOsenUrl: newUrl, // 💾 검증된 URL로 저장
            lastUrlUpdate: now
          }));
          
          alert(`✅ 오선 URL 갱신 및 검증 완료!\n📅 날짜: ${dateInfo}\n🔗 URL: ${newUrl}\n🎯 접근 상태: 정상 작동`);
          
        } else {
          // ❌ 검증 실패 - 이전 검증된 URL 유지
          console.warn(`[오선 URL] ❌ 새로운 URL 접근 불가! 이전 URL 유지: ${newsState.lastValidOsenUrl}`);
          
          const now = Date.now();
          setNewsState(prev => ({
            ...prev,
            latestOsenUrl: prev.lastValidOsenUrl, // 🔄 이전 검증된 URL로 롤백
            lastUrlUpdate: now
          }));
          
          alert(`⚠️ 새로운 URL 접근 불가!\n📅 시도한 날짜: ${dateInfo}\n🔗 시도한 URL: ${newUrl}\n🔄 이전 검증된 URL로 롤백됨: ${newsState.lastValidOsenUrl}\n\n※ 아직 새로운 뉴스가 게시되지 않았을 수 있습니다.`);
        }
        
      } else {
        console.error('[오선 URL] ❌ 새로운 URL을 가져오지 못함');
        alert('❌ 새로운 URL을 가져올 수 없습니다.\n다시 시도해 주세요.');
      }
      
    } catch (error) {
      console.error('[오선 URL] ❌ 수동 갱신 실패:', error);
      alert('❌ 오선 URL 갱신에 실패했습니다.\n다시 시도해 주세요.');
    }
  };

  // 📅 전역 일정 정보 및 💬 월가의 말말말 로드
  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const [schedule, wallStreetComments] = await Promise.all([
          getGlobalSchedule(),
          getGlobalWallStreetComments()
        ]);
        
        setNewsState(prev => ({
          ...prev,
          globalSchedule: schedule,
          wallStreetComments: wallStreetComments
        }));
      } catch (error) {
        console.warn('[NewsFeed] Failed to load global data:', error);
      }
    };

    // 시장 뉴스가 있는 경우에만 전역 데이터 로드
    if (marketNews && marketNews.length > 0) {
      loadGlobalData();
    }
  }, [marketNews]);

  const handleNewsItemClick = (article: NewsArticle, isStock: boolean) => {
    setSelectedArticle(article);
    setIsStockArticle(isStock);
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
    setIsStockArticle(false);
  };

  // 🌍 뉴스 지역 분류 함수 (국내/해외)
  const classifyNewsRegion = (article: NewsArticle): 'domestic' | 'international' => {
    const title = article.title.toLowerCase();
    const source = article.source.toLowerCase();
    
    // 한국 뉴스 소스들
    const koreanSources = ['연합뉴스', '머니투데이', '이데일리', '뉴시스', '한국경제', '매일경제', '서울경제', '한경비즈니스', 'ytn', 'sbs', 'mbc', 'kbs', 'naver', '조선일보', '중앙일보', '동아일보', '한겨레'];
    
    // 해외 뉴스 소스들
    const internationalSources = ['reuters', 'bloomberg', 'cnbc', 'financial times', 'wall street journal', 'marketwatch', 'yahoo finance', 'seeking alpha', 'the guardian'];
    
    // 한국어 키워드
    const koreanKeywords = ['코스피', '코스닥', '삼성', 'sk', 'lg', '현대', '기아', '포스코', '네이버', '카카오', '원화', '한국', '서울', '부산'];
    
    // 해외 키워드
    const internationalKeywords = ['nasdaq', 'dow jones', 's&p 500', 'wall street', 'federal reserve', 'fed', 'dollar', 'euro', 'brexit', 'tesla', 'apple', 'google', 'microsoft', 'amazon'];
    
    // 소스 기반 분류
    if (koreanSources.some(s => source.includes(s))) {
      return 'domestic';
    }
    if (internationalSources.some(s => source.includes(s))) {
      return 'international';
    }
    
    // 제목 키워드 기반 분류
    if (koreanKeywords.some(k => title.includes(k))) {
      return 'domestic';
    }
    if (internationalKeywords.some(k => title.includes(k))) {
      return 'international';
    }
    
    // 기본값: 언어로 판단 (한글 포함 여부)
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(title) ? 'domestic' : 'international';
  };

  // 📰 종목별 관련성 검증 함수 (현재 선택된 종목과 뉴스의 관련성 확인)
  const isNewsRelevantToStock = (article: NewsArticle, currentStock: StockData | null): boolean => {
    if (!currentStock) return true; // 종목이 선택되지 않은 경우 모든 뉴스 표시
    
    const title = article.title.toLowerCase();
    const summary = (article.summary || '').toLowerCase();
    const stockTicker = currentStock.ticker.toLowerCase();
    const stockName = currentStock.name.toLowerCase();
    
    // 1. 종목 티커나 회사명이 포함된 뉴스만 허용
    const directMatches = [
      stockTicker.replace('.ks', ''), // .KS 제거한 티커
      stockName,
      stockName.replace(/inc\.|corp\.|co\.|ltd\.|corporation|incorporated/g, '').trim(),
    ];
    
    // 2. 주요 기업별 별칭 및 관련 키워드 매핑 (더 엄격하게)
    const companyKeywords: Record<string, string[]> = {
      'aapl': ['apple', '애플', 'iphone', '아이폰', 'mac', 'ipad', 'vision pro', 'tim cook', 'cupertino'],
      'googl': ['google', '구글', 'alphabet', '알파벳', 'youtube', '유튜브', 'android', 'chrome', 'gemini', 'sundar pichai', 'mountain view'],
      'tsla': ['tesla', '테슬라', 'elon musk', '일론 머스크', 'cybertruck', '사이버트럭', 'model s', 'model 3', 'model x', 'model y', 'fsd', '자율주행', 'gigafactory', 'supercharger'],
      'msft': ['microsoft', '마이크로소프트', 'windows', '윈도우', 'azure', 'office', 'copilot', 'satya nadella', 'xbox'],
      'nvda': ['nvidia', '엔비디아', 'rtx', 'gpu', '그래픽카드', 'jensen huang', 'jensen', 'h100', 'omniverse', 'geforce', 'cuda'],
      'amzn': ['amazon', '아마존', 'aws', 'alexa', '알렉사', 'prime', 'jeff bezos', 'andy jassy', 'seattle'],
      '005930': ['삼성전자', 'samsung electronics', 'samsung', '갤럭시', 'galaxy', 'hbm', '반도체', '이재용', '수원'],
      '000660': ['sk하이닉스', 'sk hynix', 'hynix', 'ddr', 'hbm', '메모리', '반도체', '이천']
    };
    
    // 3. 관련 없는 회사명 명시적 제외 (엄격한 필터링)
    const excludedCompanies = [
      'netflix', '넷플릭스', 'meta', '메타', 'facebook', '페이스북', 'twitter', '트위터', 'x corp',
      'uber', '우버', 'airbnb', '에어비앤비', 'spotify', '스포티파이', 'zoom', '줌',
      'salesforce', '세일즈포스', 'oracle', '오라클', 'ibm', 'intel', '인텔',
      'amd', 'qualcomm', '퀄컴', 'broadcom', '브로드컴', 'cisco', '시스코'
    ];
    
    // 제외할 회사명이 포함된 경우 즉시 false 반환
    const hasExcludedCompany = excludedCompanies.some(company => 
      title.includes(company) || summary.includes(company)
    );
    
    if (hasExcludedCompany) {
      return false; // 다른 회사 뉴스는 완전히 제외
    }
    
    const currentKeywords = companyKeywords[stockTicker] || [];
    const allRelevantTerms = [...directMatches, ...currentKeywords];
    
    // 4. 제목이나 요약에 관련 키워드가 포함되어 있는지 확인 (더 엄격하게)
    const hasRelevantKeyword = allRelevantTerms.some(term => 
      title.includes(term) || summary.includes(term)
    );
    
    // 5. 관련 없는 뉴스 명시적 제외 (확장)
    const irrelevantPatterns = [
      /코인|비트코인|crypto|cryptocurrency/i,  // 암호화폐 뉴스
      /부동산|real estate|property/i,           // 부동산 뉴스
      /정치|election|president|국회/i,          // 정치 뉴스
      /스포츠|sports|축구|야구|올림픽/i,          // 스포츠 뉴스
      /날씨|weather|태풍|홍수/i,               // 날씨 뉴스
      /earning.*preview|quarterly.*preview/i,   // 일반적인 실적 전망 (구체적 회사명 없는)
      /market outlook|sector analysis/i,        // 시장 전망, 섹터 분석
    ];
    
    const hasIrrelevantContent = irrelevantPatterns.some(pattern => 
      pattern.test(title) || pattern.test(summary)
    );
    
    return hasRelevantKeyword && !hasIrrelevantContent;
  };

  // 📰 뉴스 품질 필터링 함수 (저품질 뉴스 제거)
  const filterLowQualityNews = (articles: NewsArticle[], currentStock?: StockData | null): NewsArticle[] => {
    return articles.filter(article => {
      const title = article.title.toLowerCase();
      
      // 1. 제목이 너무 짧은 뉴스 필터링 (10자 미만)
      if (article.title.length < 10) return false;
      
      // 2. 의미없는 변동률 뉴스 필터링 (0.00%, 0.01% 등)
      const meaninglessPatterns = [
        /0\.00?\%/,  // 0.00%, 0.0%
        /0\.01\%/,   // 0.01%
        /변동없음/,   // 변동없음
        /보합/,      // 보합
        /변화없이/,   // 변화없이
      ];
      
      if (meaninglessPatterns.some(pattern => pattern.test(title))) return false;
      
      // 3. 중복되거나 반복적인 제목 패턴 필터링
      const repetitivePatterns = [
        /^.+\s+상승.*\s+상승/,     // "XXX 상승... XXX 상승" 같은 중복
        /^.+\s+하락.*\s+하락/,     // "XXX 하락... XXX 하락" 같은 중복
        /주가.*주가/,              // "주가... 주가" 중복
        /종목.*종목/,              // "종목... 종목" 중복
      ];
      
      if (repetitivePatterns.some(pattern => pattern.test(title))) return false;
      
      // 4. 일반적인 저품질 뉴스 패턴 필터링
      const lowQualityPatterns = [
        /^오늘.*종목.*추천/,       // 단순 종목 추천
        /^.*급등.*급락.*종목/,     // 급등급락 유도성 제목
        /클릭.*조회.*상세보기/,     // 클릭베이트
        /^단순.*반복.*정보/,       // 단순 반복 정보
        /무료.*정보.*제공/,        // 광고성 내용
      ];
      
      if (lowQualityPatterns.some(pattern => pattern.test(title))) return false;
      
      return true;
    });
  };

  // 🌍 지역별 뉴스 필터링
  const filterNewsByRegion = (articles: NewsArticle[], filter: 'all' | 'domestic' | 'international'): NewsArticle[] => {
    if (filter === 'all') return articles;
    return articles.filter(article => classifyNewsRegion(article) === filter);
  };

  // 📊 뉴스 품질별 정렬 (고품질 뉴스 우선)
  const sortNewsByQuality = (articles: NewsArticle[]): NewsArticle[] => {
    return articles.sort((a, b) => {
      // 품질 점수 계산 함수
      const getQualityScore = (article: NewsArticle) => {
        let score = 0;
        const title = article.title.toLowerCase();
        const source = article.source.toLowerCase();
        
        // 신뢰할 수 있는 소스에 가산점
        const trustedSources = ['reuters', 'bloomberg', 'cnbc', 'wall street journal', 'financial times', '연합뉴스', '머니투데이', '이데일리'];
        if (trustedSources.some(trusted => source.includes(trusted))) score += 10;
        
        // 실시간/속보 뉴스에 가산점
        if (title.includes('실시간') || title.includes('속보') || title.includes('breaking')) score += 5;
        
        // 구체적인 수치가 포함된 뉴스에 가산점
        if (/\d+\.?\d*\%/.test(title) || /\$\d+/.test(title)) score += 3;
        
        // 오래된 뉴스는 감점
        const publishedTime = new Date(article.publishedAt).getTime();
        const hoursSincePublished = (Date.now() - publishedTime) / (1000 * 60 * 60);
        if (hoursSincePublished > 24) score -= 5;
        if (hoursSincePublished > 48) score -= 10;
        
        // 제목 길이가 적절한 뉴스에 가산점 (20-80자)
        if (article.title.length >= 20 && article.title.length <= 80) score += 2;
        
        return score;
      };
      
      return getQualityScore(b) - getQualityScore(a); // 내림차순 정렬
    });
  };

  // 🔍 통합 뉴스 처리 함수
  const processNews = (
    articles: NewsArticle[], 
    regionFilter: 'all' | 'domestic' | 'international',
    isStockNews: boolean = false
  ): NewsArticle[] => {
    if (!articles || articles.length === 0) return [];
    
    // 1단계: 품질 필터링
    const qualityFiltered = filterLowQualityNews(articles, stockData);
    
    // 2단계: 지역 필터링
    const regionFiltered = filterNewsByRegion(qualityFiltered, regionFilter);
    
    // 3단계: 종목 관련성 필터링 (종목 뉴스인 경우)
    const relevanceFiltered = isStockNews 
      ? regionFiltered.filter(article => isNewsRelevantToStock(article, stockData))
      : regionFiltered;
    
    // 4단계: 품질별 정렬
    return sortNewsByQuality(relevanceFiltered);
  };

  const handleFilterChange = (type: 'market' | 'stock', filter: 'all' | 'domestic' | 'international') => {
    setNewsState(prev => ({
      ...prev,
      ...(type === 'market' 
        ? { marketNewsFilter: filter }
        : { stockNewsFilter: filter }
      )
    }));
  };

  // HTML 태그 제거 함수
  const stripHtmlTags = (text: string): string => {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
  };

  // 텍스트 정리 함수 (HTML 태그 제거 + 공백 정리)
  const cleanText = (text: string): string => {
    if (!text) return '';
    return stripHtmlTags(text)
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  const renderNewsItem = (article: NewsArticle, type: 'market' | 'stock', index: number) => {
    const isGeminiNews = article.source.toLowerCase().includes('실시간 검색') || 
                        article.source.toLowerCase().includes('gemini') ||
                        article.source.toLowerCase().includes('google search');
    
    // 헤드라인과 세부 내용 정리
    const cleanTitle = cleanText(article.title);
    const cleanSummary = article.summary ? cleanText(article.summary) : '';
    const cleanContent = article.content ? cleanText(article.content) : '';
    
    // 세부 내용 우선순위: summary > content
    const detailContent = cleanSummary || cleanContent;
    
    return (
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
        <div className="flex flex-col space-y-2">
          <h4 className="text-sm font-medium leading-tight line-clamp-2 hover:text-primary transition-colors">
            {cleanTitle}
          </h4>
          
          {detailContent && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
              {detailContent}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${
              isGeminiNews ? 'border-blue-400 text-blue-600 dark:text-blue-400' : ''
            }`}>
              {article.source}
              {isGeminiNews && <span className="ml-1">⚡</span>}
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString(language === 'kr' ? 'ko-KR' : 'en-US')}
            </span>
          </div>
          
          {/* 원본 링크 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={(e) => {
              e.stopPropagation();
              if (article.url && article.url !== '#') {
                window.open(article.url, '_blank', 'noopener,noreferrer');
              }
            }}
            disabled={!article.url || article.url === '#'}
            title={isGeminiNews ? "실시간 검색 결과 보기" : "원본 기사 보기"}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 📅 일정 정보 추출 (시장 뉴스나 전역 스케줄에서)
  const scheduleInfo = (() => {
    // 1. 시장 뉴스에서 일정 정보 찾기
    const marketArticleWithSchedule = marketNews?.find(article => 
      article.schedule && article.schedule.length > 0
    );
    
    if (marketArticleWithSchedule?.schedule) {
      return {
        schedule: marketArticleWithSchedule.schedule,
        title: marketArticleWithSchedule.scheduleTitle || '📅 다음날 주요 일정'
      };
    }
    
    // 2. 전역 스케줄 사용
    if (newsState.globalSchedule && newsState.globalSchedule.length > 0) {
      return {
        schedule: newsState.globalSchedule,
        title: '📅 다음날 주요 일정'
      };
    }
    
    return null;
  })();

  // 💬 월가의 말말말 정보 추출 (시장 뉴스나 전역에서)
  const wallStreetInfo = (() => {
    // 1. 시장 뉴스에서 월가 코멘트 찾기
    const marketArticleWithComments = marketNews?.find(article => 
      article.wallStreetComments && article.wallStreetComments.length > 0
    );
    
    if (marketArticleWithComments?.wallStreetComments) {
      return {
        comments: marketArticleWithComments.wallStreetComments,
        title: marketArticleWithComments.wallStreetTitle || '💬 월가의 말말말'
      };
    }
    
    // 2. 전역 월가 코멘트 사용
    if (newsState.wallStreetComments && newsState.wallStreetComments.length > 0) {
      return {
        comments: newsState.wallStreetComments,
        title: '💬 월가의 말말말'
      };
    }
    
    return null;
  })();

  return (
    <div className="space-y-4">
      {/* 📅 다음날 주요 일정 - 독립 섹션 */}
      {scheduleInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{scheduleInfo.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketSchedule 
              schedule={scheduleInfo.schedule}
              scheduleTitle={scheduleInfo.title}
            />
          </CardContent>
        </Card>
      )}

      {/* 💬 월가의 말말말 - 독립 섹션 */}
      {wallStreetInfo && (
        <WallStreetComments 
          comments={wallStreetInfo.comments}
          commentsTitle={wallStreetInfo.title}
        />
      )}

      {/* 📰 뉴스 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('latest_news_title')}</CardTitle>
            <div className="flex items-center gap-2">
              {/* 뉴스 체크 상태 표시 */}
              {newsState.newsCheckMessage && (
                <div className="flex items-center gap-1 text-xs">
                  {newsState.hasNewNewsAvailable ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : newsState.isCheckingNewNews ? (
                    <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-gray-500" />
                  )}
                  <span className={`${newsState.hasNewNewsAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                    {newsState.newsCheckMessage}
                  </span>
                </div>
              )}
              
              {/* 뉴스 업데이트 체크 버튼 */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={handleManualNewsCheck}
                disabled={newsState.isCheckingNewNews}
                title="새로운 뉴스가 있는지 확인합니다"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${newsState.isCheckingNewNews ? 'animate-spin' : ''}`} />
                뉴스 체크
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="market">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stock">{t('stock_specific_news')}</TabsTrigger>
              <TabsTrigger value="market">{t('market_news')}</TabsTrigger>
            </TabsList>
            <TabsContent value="stock" className="mt-4">
              {/* 종목 뉴스 필터 버튼 */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <Button
                  variant={newsState.stockNewsFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleFilterChange('stock', 'all')}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  전체
                </Button>
                <Button
                  variant={newsState.stockNewsFilter === 'domestic' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleFilterChange('stock', 'domestic')}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  국내
                </Button>
                <Button
                  variant={newsState.stockNewsFilter === 'international' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleFilterChange('stock', 'international')}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  해외
                </Button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 news-scroll">
                {(() => {
                  const filteredStockNews = news ? processNews(news, newsState.stockNewsFilter, true) : [];
                  return filteredStockNews.length > 0 ? (
                    <div className="space-y-1">
                      {filteredStockNews.map((article, index) => (
                        <div key={`stock-${index}`}>
                          <div 
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                            onClick={() => handleNewsItemClick(article, true)}
                          >
                            {renderNewsItem(article, 'stock', index)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">{t('no_news_found')}</p>
                  );
                })()}
              </div>
            </TabsContent>
            <TabsContent value="market" className="mt-4">
              {/* 시장 뉴스 필터 버튼 */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <Button
                  variant={newsState.marketNewsFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleFilterChange('market', 'all')}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  전체
                </Button>
                <Button
                  variant={newsState.marketNewsFilter === 'domestic' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleFilterChange('market', 'domestic')}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  국내
                </Button>
                <Button
                  variant={newsState.marketNewsFilter === 'international' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleFilterChange('market', 'international')}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  해외
                </Button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 news-scroll">
                {(() => {
                  const filteredMarketNews = marketNews ? processNews(marketNews, newsState.marketNewsFilter) : [];
                  return filteredMarketNews.length > 0 ? (
                    <div className="space-y-1">
                      {filteredMarketNews.map((article, index) => (
                        <div key={`market-${index}`}>
                          <div 
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                            onClick={() => handleNewsItemClick(article, false)}
                          >
                            {renderNewsItem(article, 'market', index)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">{t('no_news_found')}</p>
                  );
                })()}
              </div>
            </TabsContent>
          </Tabs>
          <NewsSummaryModal 
            article={selectedArticle}
            isOpen={!!selectedArticle}
            onClose={handleCloseModal}
            stockData={stockData}
            isStockNews={isStockArticle}
          />
        </CardContent>
      </Card>
    </div>
  );
}
