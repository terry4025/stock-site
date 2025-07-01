"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  getUserAnalysisHistory, 
  toggleAnalysisFavorite,
  type AIAnalysisRecord 
} from "@/lib/user-menu-helpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Star, 
  StarOff,
  Clock,
  DollarSign,
  Search,
  Filter,
  Eye,
  BarChart3
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAnalysisHistoryModal({ isOpen, onClose }: AIAnalysisHistoryModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<AIAnalysisRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterFavorite, setFilterFavorite] = useState<string>("all");
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysisRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const pageSize = 10;

  // 분석 기록 로드
  useEffect(() => {
    if (isOpen && user?.id) {
      loadAnalysisHistory();
    }
  }, [isOpen, user?.id, currentPage, filterType, filterFavorite]);

  const loadAnalysisHistory = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const options: any = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize
      };

      if (filterType !== "all") {
        options.analysis_type = filterType;
      }

      if (filterFavorite === "favorites") {
        options.is_favorite = true;
      }

      const result = await getUserAnalysisHistory(user.id, options);
      
      if (result.success) {
        let filteredData = result.data || [];
        
        // 검색어 필터링 (클라이언트 사이드)
        if (searchTerm) {
          filteredData = filteredData.filter(analysis => 
            analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            analysis.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            analysis.sentiment?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setAnalyses(filteredData);
        setTotalCount(result.count || 0);
        console.log(`🤖 [AI History] Loaded ${filteredData.length} analysis records`);
      } else {
        console.error('❌ [AI History] Error loading analysis history:', result.error);
      }
    } catch (error) {
      console.error('❌ [AI History] Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (analysisId: string, currentFavorite: boolean) => {
    try {
      const result = await toggleAnalysisFavorite(analysisId, !currentFavorite);
      
      if (result.success) {
        // 로컬 상태 업데이트
        setAnalyses(prev => 
          prev.map(analysis => 
            analysis.id === analysisId 
              ? { ...analysis, is_favorite: !currentFavorite }
              : analysis
          )
        );
        
        // 선택된 분석이 업데이트된 것이라면 상태 동기화
        if (selectedAnalysis?.id === analysisId) {
          setSelectedAnalysis(prev => 
            prev ? { ...prev, is_favorite: !currentFavorite } : null
          );
        }
        
        console.log(`⭐ [AI History] Toggled favorite for analysis: ${analysisId}`);
      }
    } catch (error) {
      console.error('❌ [AI History] Error toggling favorite:', error);
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish':
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <BarChart3 className="h-4 w-4" />;
      case 'crypto':
        return <DollarSign className="h-4 w-4" />;
      case 'macro':
        return <TrendingUp className="h-4 w-4" />;
      case 'news':
        return <Brain className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handleViewDetail = (analysis: AIAnalysisRecord) => {
    setSelectedAnalysis(analysis);
    setShowDetail(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      {/* 메인 모달 */}
      <Dialog open={isOpen && !showDetail} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI 분석 기록
            </DialogTitle>
            <DialogDescription>
              이전에 수행한 AI 분석 결과를 확인하고 관리하세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="제목, 심볼, 감정으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 유형</SelectItem>
                    <SelectItem value="stock">주식 분석</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterFavorite} onValueChange={setFilterFavorite}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="favorites">즐겨찾기</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadAnalysisHistory}
                  disabled={loading}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 분석 목록 */}
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">분석 기록이 없습니다</h3>
                  <p className="text-muted-foreground">메인 페이지에서 "AI 분석 시작" 버튼을 클릭하여 AI 분석을 수행하면 여기에 기록이 표시됩니다.</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <span>💡</span>
                      <span>실제 AI 분석 결과만 저장됩니다</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <Card key={analysis.id} className="hover:shadow-md transition-shadow cursor-pointer bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {getAnalysisTypeIcon(analysis.analysis_type)}
                              <h3 className="font-medium text-foreground line-clamp-1">
                                {analysis.title}
                              </h3>
                              {analysis.symbol && (
                                <Badge variant="outline" className="text-xs text-foreground border-border">
                                  {analysis.symbol}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(analysis.created_at!).toLocaleDateString('ko-KR')}
                              </div>
                              
                              {analysis.sentiment && (
                                <div className="flex items-center gap-1">
                                  {getSentimentIcon(analysis.sentiment)}
                                  <span className={`px-2 py-1 rounded-full text-xs border ${getSentimentColor(analysis.sentiment)}`}>
                                    {analysis.sentiment}
                                  </span>
                                </div>
                              )}

                              {analysis.confidence_score && (
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="h-3 w-3" />
                                  {Math.round(analysis.confidence_score * 100)}%
                                </div>
                              )}

                              {analysis.analysis_duration_ms && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(analysis.analysis_duration_ms)}
                                </div>
                              )}
                            </div>

                            {analysis.price_at_analysis && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">분석 당시 가격: </span>
                                <span className="font-medium text-foreground">
                                  ${analysis.price_at_analysis.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(analysis.id!, !!analysis.is_favorite);
                              }}
                            >
                              {analysis.is_favorite ? (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              ) : (
                                <StarOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(analysis)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  총 {totalCount}개 중 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)}개 표시
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}

            {/* 닫기 버튼 */}
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 상세 보기 모달 */}
      <Dialog open={showDetail} onOpenChange={() => setShowDetail(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI 분석 상세
            </DialogTitle>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-6">
              {/* 헤더 정보 */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getAnalysisTypeIcon(selectedAnalysis.analysis_type)}
                        {selectedAnalysis.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{new Date(selectedAnalysis.created_at!).toLocaleString('ko-KR')}</span>
                        {selectedAnalysis.model_used && <span>모델: {selectedAnalysis.model_used}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(selectedAnalysis.id!, !!selectedAnalysis.is_favorite)}
                    >
                      {selectedAnalysis.is_favorite ? (
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* AI 분석 */}
              {selectedAnalysis.analysis_content?.stock_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      AI 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">추천</div>
                        <div className="text-lg font-semibold text-foreground">
                          {selectedAnalysis.analysis_content.stock_analysis.recommendation || '보유'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">신뢰도</div>
                        <div className="text-lg font-semibold text-foreground">
                          {selectedAnalysis.analysis_content.stock_analysis.confidence || 50}%
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">요약</div>
                      <div className="text-foreground leading-relaxed">
                        {selectedAnalysis.analysis_content.stock_analysis.summary || '분석 요약이 없습니다.'}
                      </div>
                    </div>

                    {selectedAnalysis.analysis_content.stock_analysis.current_price && (
                      <div className="flex items-center gap-4 text-sm border-t pt-4">
                        <div>
                          <span className="text-muted-foreground">현재가: </span>
                          <span className="font-medium text-foreground">
                            ${selectedAnalysis.analysis_content.stock_analysis.current_price}
                          </span>
                        </div>
                        {selectedAnalysis.analysis_content.stock_analysis.daily_change && (
                          <div>
                            <span className="text-muted-foreground">일일 변동: </span>
                            <span className={`font-medium ${
                              selectedAnalysis.analysis_content.stock_analysis.daily_change > 0 
                                ? 'text-green-600' 
                                : selectedAnalysis.analysis_content.stock_analysis.daily_change < 0 
                                ? 'text-red-600' 
                                : 'text-gray-600'
                            }`}>
                              {selectedAnalysis.analysis_content.stock_analysis.daily_change > 0 ? '+' : ''}
                              {selectedAnalysis.analysis_content.stock_analysis.daily_change.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 뉴스 심리 분석 */}
              {selectedAnalysis.analysis_content?.news_sentiment_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      뉴스 심리 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">감정</div>
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(selectedAnalysis.analysis_content.news_sentiment_analysis.sentiment)}
                          <span className="text-lg font-semibold text-foreground">
                            {selectedAnalysis.analysis_content.news_sentiment_analysis.sentiment_kr || 
                             selectedAnalysis.analysis_content.news_sentiment_analysis.sentiment}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">신뢰도</div>
                        <div className="text-lg font-semibold text-foreground">
                          {selectedAnalysis.analysis_content.news_sentiment_analysis.confidence || 50}%
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">분석 내용</div>
                      <div className="text-foreground leading-relaxed">
                        {selectedAnalysis.analysis_content.news_sentiment_analysis.reasoning || '뉴스 분석 내용이 없습니다.'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm border-t pt-4 text-muted-foreground">
                      <div>
                        분석 기사 수: {selectedAnalysis.analysis_content.news_sentiment_analysis.total_articles || 0}개
                      </div>
                      {selectedAnalysis.analysis_content.news_sentiment_analysis.stock_articles && (
                        <div>
                          종목 관련: {selectedAnalysis.analysis_content.news_sentiment_analysis.stock_articles}개
                        </div>
                      )}
                      {selectedAnalysis.analysis_content.news_sentiment_analysis.market_articles && (
                        <div>
                          시장 관련: {selectedAnalysis.analysis_content.news_sentiment_analysis.market_articles}개
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 분석 메타데이터 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">분석 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">분석 날짜</div>
                      <div className="text-foreground font-medium">
                        {new Date(selectedAnalysis.created_at!).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    {selectedAnalysis.model_used && (
                      <div>
                        <div className="text-muted-foreground mb-1">AI 모델</div>
                        <div className="text-foreground font-medium">{selectedAnalysis.model_used}</div>
                      </div>
                    )}
                    {selectedAnalysis.analysis_duration_ms && (
                      <div>
                        <div className="text-muted-foreground mb-1">분석 시간</div>
                        <div className="text-foreground font-medium">{formatDuration(selectedAnalysis.analysis_duration_ms)}</div>
                      </div>
                    )}
                    {selectedAnalysis.symbol && (
                      <div>
                        <div className="text-muted-foreground mb-1">종목</div>
                        <div className="text-foreground font-medium">{selectedAnalysis.symbol}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetail(false)}>
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 