'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, MapPin, Filter, Play } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsArticle, StockData } from '@/lib/types';
// import { getLatestOsenGitBookUrl, manualCheckForNewNews } from '@/app/actions';
import NewsSummaryModal from './NewsSummaryModal';

interface NewsCardsProps {
  news: NewsArticle[];
  marketNews: NewsArticle[];
  loading: boolean;
  stockData: StockData | null;
}

interface NewsState {
  marketNewsFilter: 'all' | 'domestic' | 'international';
  stockNewsFilter: 'all' | 'domestic' | 'international';
  latestOsenUrl: string;
  lastValidOsenUrl: string;
  lastUrlUpdate: number;
}

export default function NewsCards({ news, marketNews, loading, stockData }: NewsCardsProps) {
  const { t, language } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isStockArticle, setIsStockArticle] = useState(false);

  const [newsState, setNewsState] = useState<NewsState>({
    marketNewsFilter: 'all',
    stockNewsFilter: 'all',
    latestOsenUrl: 'https://futuresnow.gitbook.io/newstoday/2025-07-02/news/today/bloomberg', // 🔥 동적 시스템 연동 - 최신 날짜
    lastValidOsenUrl: 'https://futuresnow.gitbook.io/newstoday/2025-07-02/news/today/bloomberg', // 🔥 동적 시스템 연동 - 최신 날짜
    lastUrlUpdate: 0
  });

  // URL 검증 함수
  const verifyUrlAccess = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(2000)
      });
      
      if (!response.ok) return false;
      
      const contentType = response.headers.get('content-type') || '';
      return contentType.includes('text/html') || 
             contentType.includes('application/xhtml') ||
             url.includes('gitbook.io');
    } catch {
      return false;
    }
  };

  // 🔥 새로운 동적 시스템과 연동된 수동 URL 갱신 함수
  /*
  const handleManualUrlUpdate = async () => {
    console.log('[오선 URL] 🔄 동적 시스템과 연동된 수동 URL 갱신 시작...');
    
    try {
      // 1단계: 새로운 동적 시스템으로 체크
      const checkResult = await manualCheckForNewNews();
      console.log('[오선 URL] 📊 동적 체크 결과:', checkResult);
      
      if (checkResult.success) {
        if (checkResult.hasNew && checkResult.newDate) {
          // 새로운 뉴스 발견!
          const newUrl = `https://futuresnow.gitbook.io/newstoday/${checkResult.newDate}/news/today/bloomberg`;
          
          setNewsState(prev => ({
            ...prev,
            latestOsenUrl: newUrl,
            lastValidOsenUrl: newUrl,
            lastUrlUpdate: Date.now()
          }));
          
          console.log(`[오선 URL] ✅ 새로운 뉴스 발견! ${checkResult.newDate} → ${newUrl}`);
          alert(`🎉 새로운 뉴스 발견!\n날짜: ${checkResult.newDate}\n새로운 URL로 업데이트되었습니다.`);
          
        } else {
          // 새로운 뉴스 없음, 현재 날짜 확인
          const currentDate = await getCurrentActiveDate();
          
          if (currentDate) {
            const currentUrl = `https://futuresnow.gitbook.io/newstoday/${currentDate}/news/today/bloomberg`;
            
            setNewsState(prev => ({
              ...prev,
              latestOsenUrl: currentUrl,
              lastValidOsenUrl: currentUrl,
              lastUrlUpdate: Date.now()
            }));
            
            console.log(`[오선 URL] 📅 현재 활성 날짜 사용: ${currentDate} → ${currentUrl}`);
            alert(`📅 현재 최신 날짜입니다!\n날짜: ${currentDate}\nURL이 동기화되었습니다.`);
          } else {
            console.log('[오선 URL] ⚠️ 현재 활성 날짜를 가져올 수 없음');
            alert('⚠️ 현재 활성 날짜를 확인할 수 없습니다.');
          }
        }
      } else {
        console.error('[오선 URL] ❌ 동적 체크 실패:', checkResult.message);
        alert(`❌ 뉴스 체크 실패: ${checkResult.message}`);
      }
      
    } catch (error) {
      console.error('[오선 URL] ❌ 동적 시스템 갱신 실패:', error);
      alert('❌ URL 갱신 중 오류가 발생했습니다.');
    }
  };
  */

  // 🔥 새로운 동적 시스템과 연동된 자동 URL 업데이트
  /*
  useEffect(() => {
    const updateOsenUrlWithDynamicSystem = async () => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      if (newsState.lastUrlUpdate === 0 || now - newsState.lastUrlUpdate > oneHour) {
        try {
          console.log('[오선 URL] 🔍 동적 시스템에서 최신 날짜 가져오는 중...');
          
          // 1단계: 현재 활성 날짜 확인
          const currentDate = await getCurrentActiveDate();
          
          if (currentDate) {
            const currentUrl = `https://futuresnow.gitbook.io/newstoday/${currentDate}/news/today/bloomberg`;
            
            // URL 검증
            const verificationResult = await verifyUrlAccess(currentUrl);
            
            if (verificationResult) {
              setNewsState(prev => ({
                ...prev,
                latestOsenUrl: currentUrl,
                lastValidOsenUrl: currentUrl,
                lastUrlUpdate: now
              }));
              
              console.log(`[오선 URL] ✅ 동적 시스템 URL 업데이트: ${currentDate} → ${currentUrl}`);
            } else {
              console.log(`[오선 URL] ⚠️ 현재 날짜 URL 검증 실패: ${currentUrl}`);
              
              // 검증 실패시 이전 검증된 URL 유지
              setNewsState(prev => ({
                ...prev,
                latestOsenUrl: prev.lastValidOsenUrl,
                lastUrlUpdate: now
              }));
            }
          } else {
            console.log('[오선 URL] ⚠️ 현재 활성 날짜를 가져올 수 없음, 기존 시스템 사용...');
            
            // 폴백: 기존 시스템 사용
            const { url, date, success } = await getLatestOsenGitBookUrl();
            const verificationResult = await verifyUrlAccess(url);
            
            if (verificationResult) {
              setNewsState(prev => ({
                ...prev,
                latestOsenUrl: url,
                lastValidOsenUrl: url,
                lastUrlUpdate: now
              }));
              
              console.log(`[오선 URL] ✅ 폴백 URL 업데이트: ${date} → ${url}`);
            }
          }
          
        } catch (error) {
          console.warn('[오선 URL] ⚠️ 동적 시스템 URL 업데이트 실패:', error);
        }
      }
    };

    updateOsenUrlWithDynamicSystem();
  }, []);
  */

  const handleNewsItemClick = (article: NewsArticle, isStock: boolean) => {
    setSelectedArticle(article);
    setIsStockArticle(isStock);
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
  };

  const classifyNewsRegion = (article: NewsArticle): 'domestic' | 'international' => {
    // 🌍 뉴스의 language 필드를 우선적으로 확인
    if (article.language) {
      return article.language === 'kr' ? 'domestic' : 'international';
    }
    
    // 언어 필드가 없는 경우 기존 방식으로 판단
    const domesticSources = [
      '연합뉴스', '조선일보', '중앙일보', '동아일보', '한국일보', '경향신문',
      '매일경제', '한국경제', '서울경제', '이데일리', '뉴스1', 'KBS', 'MBC', 'SBS',
      '네이버', '다음', 'Naver', 'Daum', '코리아', 'Korea', '한국', '서울', 'Seoul',
      '부산', 'Busan', 'KRX', '코스피', 'KOSPI', '코스닥', 'KOSDAQ'
    ];
    
    const domesticKeywords = [
      '삼성', '현대', 'SK', 'LG', '포스코', '네이버', '카카오', '셀트리온',
      '원화', 'KRW', '한국은행', '금융위', '기재부', '청와대', '국정감사', '국회',
      '코스피', '코스닥', '상장', '코리아', '한국', '서울', '부산'
    ];

    const source = (article.source || '').toLowerCase();
    const title = (article.title || '').toLowerCase();
    const content = (article.content || article.summary || '').toLowerCase();
    const url = (article.url || '').toLowerCase();

    const isDomesticSource = domesticSources.some(src => 
      source.includes(src.toLowerCase()) || url.includes(src.toLowerCase())
    );
    
    const isDomesticContent = domesticKeywords.some(keyword => 
      title.includes(keyword.toLowerCase()) || content.includes(keyword.toLowerCase())
    );
    
    return (isDomesticSource || isDomesticContent) ? 'domestic' : 'international';
  };

  const filterNewsByRegion = (articles: NewsArticle[], filter: 'all' | 'domestic' | 'international'): NewsArticle[] => {
    if (filter === 'all') return articles;
    return articles.filter(article => classifyNewsRegion(article) === filter);
  };

  // 오선 뉴스 식별 함수
  const isOsenNews = (article: NewsArticle): boolean => {
    const title = article.title.toLowerCase();
    const source = article.source.toLowerCase();
    
    const osenKeywords = [
      '오선', 'osen', '미국 증시 전일 요약', '미증 전일 요약',
      '오선의 미국', '오선이 제공하는', '전일 요약', '미국 증시 요약',
      '오선 (osen)', 'osen news', '오선 뉴스'
    ];
    
    return osenKeywords.some(keyword => 
      title.includes(keyword) || source.includes(keyword)
    );
  };

  // 종목 뉴스 관련성 필터링 함수 (현재 선택된 종목과 관련성 검증)
  const isNewsRelevantToStock = (article: NewsArticle, currentStock: StockData | null): boolean => {
    if (!currentStock) return true;
    
    const title = article.title.toLowerCase();
    const summary = (article.summary || '').toLowerCase();
    const stockTicker = currentStock.ticker.toLowerCase();
    const stockName = currentStock.name.toLowerCase();
    
    // 1. 오선 뉴스는 시장 뉴스이므로 종목 뉴스에서 제외
    if (isOsenNews(article)) {
      return false;
    }
    
    // 2. 종목 티커나 회사명이 포함된 뉴스만 허용
    const directMatches = [
      stockTicker.replace('.ks', ''), // .KS 제거한 티커
      stockName,
      stockName.replace(/inc\.|corp\.|co\.|ltd\.|corporation|incorporated/g, '').trim(),
    ];
    
    // 3. 주요 기업별 별칭 및 관련 키워드 매핑
    const companyKeywords: Record<string, string[]> = {
      'aapl': ['apple', '애플', 'iphone', '아이폰', 'mac', 'ipad', 'vision pro', 'tim cook'],
      'googl': ['google', '구글', 'alphabet', '알파벳', 'youtube', '유튜브', 'android', 'chrome'],
      'tsla': ['tesla', '테슬라', 'elon musk', '일론 머스크', 'cybertruck', 'model s', 'model 3'],
      'msft': ['microsoft', '마이크로소프트', 'windows', '윈도우', 'azure', 'office'],
      'nvda': ['nvidia', '엔비디아', 'rtx', 'gpu', '그래픽카드', 'jensen huang'],
      'amzn': ['amazon', '아마존', 'aws', 'alexa', '알렉사', 'prime'],
      '005930': ['삼성전자', 'samsung electronics', 'samsung', '갤럭시', 'galaxy', 'hbm'],
      '000660': ['sk하이닉스', 'sk hynix', 'hynix', 'ddr', 'hbm', '메모리']
    };
    
    const currentKeywords = companyKeywords[stockTicker] || [];
    const allRelevantTerms = [...directMatches, ...currentKeywords];
    
    // 4. 제목이나 요약에 관련 키워드가 포함되어 있는지 확인
    const hasRelevantKeyword = allRelevantTerms.some(term => 
      title.includes(term) || summary.includes(term)
    );
    
    return hasRelevantKeyword;
  };

  const processNews = (
    articles: NewsArticle[], 
    regionFilter: 'all' | 'domestic' | 'international',
    isStockNews: boolean = false
  ): NewsArticle[] => {
    let processedNews = [...articles];
    
    // 지역별 필터링
    processedNews = filterNewsByRegion(processedNews, regionFilter);
    
    // 종목 뉴스인 경우 종목 관련성 필터링 적용
    if (isStockNews) {
      processedNews = processedNews.filter(article => 
        isNewsRelevantToStock(article, stockData)
      );
    }
    
    // 뉴스 개수 제한 - 8개에서 15개로 증가
    processedNews = processedNews.slice(0, 15);
    
    return processedNews;
  };

  const handleFilterChange = (type: 'market' | 'stock', filter: 'all' | 'domestic' | 'international') => {
    setNewsState(prev => ({
      ...prev,
      [`${type}NewsFilter`]: filter
    }));
  };

  const renderNewsItem = (article: NewsArticle, type: 'market' | 'stock', index: number) => {
    const isGeminiNews = article.isGeminiGenerated;
    const region = classifyNewsRegion(article);
    
    // 🔥 뉴스 제목에서 "(원문)" 텍스트 제거
    const cleanTitle = article.title
      ?.replace(/\s*\(원문\)\s*/g, '')
      ?.replace(/\s*원문\s*/g, '')
      ?.trim() || '';
    
    return (
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium line-clamp-2 mb-1 ${isGeminiNews ? 'text-blue-700 dark:text-blue-300' : ''}`}>
            {cleanTitle}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="shrink-0">{article.source}</span>
            <Badge variant={region === 'domestic' ? 'default' : 'secondary'} className="text-xs px-1 py-0">
              {region === 'domestic' ? '🇰🇷' : '🌐'}
            </Badge>
            {isGeminiNews && (
              <Badge variant="outline" className="text-xs px-1 py-0 border-blue-400 text-blue-600 dark:text-blue-400">
                ✨ AI
              </Badge>
            )}
          </div>
          {article.summary && (
            <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 h-auto p-1 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            window.open(article.url, '_blank');
          }}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('latest_news_title')}</CardTitle>
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
            
            <div className="max-h-[400px] overflow-y-auto pr-2 news-scroll">
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
            {/* 오선 버튼들 + 시장 뉴스 필터 버튼 */}
            <div className="flex flex-col gap-3 mb-3">
              {/* 오선 버튼들 */}
              <div className="flex justify-center gap-2">
                {/* 오선 전일 요약 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-sm bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 dark:border-red-800"
                  onClick={() => window.open(newsState.latestOsenUrl, '_blank')}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // handleManualUrlUpdate();
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // handleManualUrlUpdate();
                  }}
                  title="왼쪽 클릭: 오선 뉴스 페이지 열기 | 오른쪽 클릭/더블클릭: 새로운 뉴스 체크 (동적 시스템)"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    📰 오선의 미국 증시 전일 요약
                  </div>
                </Button>
                
                {/* 오선 라이브 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:hover:bg-green-900 dark:text-green-300 dark:border-green-800"
                  onClick={() => window.open('https://www.youtube.com/@futuresnow', '_blank')}
                  title="오선의 미국 증시 실시간 라이브 방송 시청하기"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-green-600 dark:text-green-400" />
                    🔴 오선 라이브
                  </div>
                </Button>
              </div>
              
              {/* 시장 뉴스 필터 버튼 */}
              <div className="flex items-center justify-center gap-1">
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
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 news-scroll">
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