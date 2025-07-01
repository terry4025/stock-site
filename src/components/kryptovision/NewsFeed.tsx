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
import { ExternalLink, Globe, MapPin, Filter } from 'lucide-react';
import { getHeadlines } from '@/app/actions';

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
    stockNewsFilter: 'all'
  });

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
        /주가\s+주가/,             // "주가 주가" 중복
        /종목\s+종목/,             // "종목 종목" 중복
      ];
      
      if (repetitivePatterns.some(pattern => pattern.test(title))) return false;
      
      // 4. 너무 일반적이고 구체성이 없는 뉴스 필터링
      const vagueTitles = [
        /^주가\s+(상승|하락)$/,     // "주가 상승", "주가 하락"만
        /^종목\s+(동향|현황)$/,     // "종목 동향", "종목 현황"만
        /^시장\s+(상황|동향)$/,     // "시장 상황", "시장 동향"만
        /^투자자\s+관심$/,         // "투자자 관심"만
        /^오늘의?\s+(주가|종목)$/,  // "오늘의 주가", "오늘 종목"만
      ];
      
      if (vagueTitles.some(pattern => pattern.test(title))) return false;
      
      // 5. 빈 내용이나 기본 템플릿 뉴스 필터링
      if (article.summary && article.summary.length < 20) return false;
      if (title.includes('no news') || title.includes('no data')) return false;
      
      // 6. 종목 관련성 확인 (종목 뉴스의 경우에만)
      if (currentStock) {
        return isNewsRelevantToStock(article, currentStock);
      }
      
      return true;
    });
  };

  // 🔍 지역별 뉴스 필터링 함수
  const filterNewsByRegion = (articles: NewsArticle[], filter: 'all' | 'domestic' | 'international'): NewsArticle[] => {
    if (filter === 'all') return articles;
    return articles.filter(article => classifyNewsRegion(article) === filter);
  };

  // 🎯 고품질 뉴스 정렬 함수 (최신순 + 품질 점수)
  const sortNewsByQuality = (articles: NewsArticle[]): NewsArticle[] => {
    return articles.sort((a, b) => {
      // 먼저 시간순으로 정렬 (최신 뉴스 우선)
      const timeScore = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      
      // 품질 점수 계산 (제목 길이, 요약 품질 등)
      const getQualityScore = (article: NewsArticle) => {
        let score = 0;
        
        // 제목 길이 점수 (적절한 길이)
        if (article.title.length >= 20 && article.title.length <= 100) score += 10;
        
        // 구체적인 수치나 날짜 포함 시 점수 추가
        if (/\d+[%억만달러원]/g.test(article.title)) score += 15;
        if (/20\d{2}년?/g.test(article.title)) score += 5;
        
        // 신뢰할 수 있는 뉴스 소스 점수
        const trustedSources = ['Reuters', 'Bloomberg', 'CNBC', 'Wall Street Journal', 'Financial Times', 
                               '연합뉴스', '매일경제', '한국경제', 'TechCrunch', 'The Verge'];
        if (trustedSources.includes(article.source)) score += 20;
        
        // 요약 품질 점수
        if (article.summary && article.summary.length > 50) score += 10;
        
        return score;
      };
      
      const qualityDiff = getQualityScore(b) - getQualityScore(a);
      
      // 품질 점수 차이가 클 경우 품질 우선, 아니면 시간 우선
      return Math.abs(qualityDiff) > 20 ? qualityDiff : timeScore;
    });
  };

  // 🔄 통합 뉴스 필터링 및 정렬 함수
  const processNews = (
    articles: NewsArticle[], 
    regionFilter: 'all' | 'domestic' | 'international',
    isStockNews: boolean = false
  ): NewsArticle[] => {
    return sortNewsByQuality(
      filterNewsByRegion(
        filterLowQualityNews(articles, isStockNews ? stockData : null),
        regionFilter
      )
    ).slice(0, 10); // 최대 10개까지만 표시
  };

  // 🔄 필터 변경 함수
  const handleFilterChange = (type: 'market' | 'stock', filter: 'all' | 'domestic' | 'international') => {
    setNewsState(prev => ({
      ...prev,
      [type === 'market' ? 'marketNewsFilter' : 'stockNewsFilter']: filter
    }));
  };



  // 뉴스 아이템 렌더링 함수 (AI 요약 제거, 팝업창에서만 표시)
  const renderNewsItem = (article: NewsArticle, type: 'market' | 'stock', index: number) => {
    const isGeminiNews = article.isGeminiGenerated;
    
    return (
      <div key={`${type}-${index}`} className={`border-b last:border-b-0 pb-3 last:pb-0 ${
        isGeminiNews ? 'border-l-4 border-l-blue-400 pl-3' : ''
      }`}>
        {/* 제목 (클릭 시 팝업창 열기) */}
        <div className="flex items-start gap-2">
          {isGeminiNews && (
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          )}
          <h3 
            className={`font-medium text-sm leading-5 cursor-pointer transition-colors mb-2 flex-1 ${
              isGeminiNews 
                ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                : 'hover:text-blue-600 transition-colors'
            }`}
            onClick={() => handleNewsItemClick(article, type === 'stock')}
            title={isGeminiNews ? "🤖 AI 실시간 검색 뉴스 - 클릭하여 AI 요약 보기" : "클릭하여 AI 요약 보기"}
          >
            {isGeminiNews && <span className="text-blue-500 mr-1">🤖</span>}
            {article.title}
          </h3>
        </div>

        {/* 메타 정보 및 버튼들 */}
        <div className="flex items-center justify-between">
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('latest_news_title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stock">
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
  );
}
