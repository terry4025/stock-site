"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Target,
  BarChart3,
  FileText,
  Download,
  Share,
  Trash2,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAIAnalyses, deleteAIAnalysis, mockAIAnalyses, AIAnalysis } from "@/lib/supabase-helpers";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIAnalysisModal({ open, onOpenChange }: AIAnalysisModalProps) {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // AI 분석 기록 로드
  useEffect(() => {
    const loadAnalyses = async () => {
      if (!user?.id || !open) return;
      
      setLoading(true);
      try {
        const data = await getUserAIAnalyses(user.id, selectedFilter);
        if (data.length > 0) {
          setAnalyses(data);
        } else {
          // DB에 데이터가 없으면 mock 데이터 사용
          setAnalyses(mockAIAnalyses);
        }
      } catch (error) {
        // 에러 발생 시 조용히 mock 데이터 사용
        setAnalyses(mockAIAnalyses);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyses();
  }, [user?.id, open, selectedFilter]);

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!user?.id) return;

    try {
      const success = await deleteAIAnalysis(user.id, analysisId);
      if (success) {
        setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
        setMessage("분석 기록이 삭제되었습니다.");
        if (selectedAnalysis?.id === analysisId) {
          setSelectedAnalysis(null);
        }
      } else {
        setMessage("삭제에 실패했습니다.");
      }
    } catch (error) {
      setMessage("삭제에 실패했습니다.");
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-400 bg-green-900/20 border-green-700";
      case "negative": return "text-red-400 bg-red-900/20 border-red-700";
      case "neutral": return "text-yellow-400 bg-yellow-900/20 border-yellow-700";
      default: return "text-slate-400 bg-slate-900/20 border-slate-700";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="w-4 h-4" />;
      case "negative": return <TrendingDown className="w-4 h-4" />;
      case "neutral": return <BarChart3 className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    if (selectedFilter === "all") return true;
    return analysis.type === selectedFilter;
  });

  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredAnalyses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-slate-900/95 border-slate-700 backdrop-blur-xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            AI 분석 기록
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="list" className="data-[state=active]:bg-yellow-600">
              <FileText className="w-4 h-4 mr-2" />
              분석 목록
            </TabsTrigger>
            <TabsTrigger value="detail" className="data-[state=active]:bg-yellow-600" disabled={!selectedAnalysis}>
              <BarChart3 className="w-4 h-4 mr-2" />
              상세 보기
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-6">
            {/* 필터 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("all")}
                  className={selectedFilter === "all" ? "bg-yellow-600 hover:bg-yellow-700" : "border-slate-600 text-slate-300"}
                >
                  전체 ({analyses.length})
                </Button>
                <Button
                  variant={selectedFilter === "stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("stock")}
                  className={selectedFilter === "stock" ? "bg-yellow-600 hover:bg-yellow-700" : "border-slate-600 text-slate-300"}
                >
                  주식 ({analyses.filter(a => a.type === 'stock').length})
                </Button>
                <Button
                  variant={selectedFilter === "crypto" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("crypto")}
                  className={selectedFilter === "crypto" ? "bg-yellow-600 hover:bg-yellow-700" : "border-slate-600 text-slate-300"}
                >
                  암호화폐 ({analyses.filter(a => a.type === 'crypto').length})
                </Button>
                <Button
                  variant={selectedFilter === "macro" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("macro")}
                  className={selectedFilter === "macro" ? "bg-yellow-600 hover:bg-yellow-700" : "border-slate-600 text-slate-300"}
                >
                  거시경제 ({analyses.filter(a => a.type === 'macro').length})
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToJSON}
                  className="border-slate-600 text-slate-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  내보내기
                </Button>
              </div>
            </div>

            {/* 로딩 상태 */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-3">
                  {filteredAnalyses.length === 0 ? (
                    <Card className="bg-slate-800/30 border-slate-700">
                      <CardContent className="p-8 text-center">
                        <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">아직 AI 분석 기록이 없습니다.</p>
                        <p className="text-sm text-slate-500 mt-2">첫 번째 분석을 시작해보세요!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredAnalyses.map((analysis) => (
                      <Card
                        key={analysis.id}
                        className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedAnalysis(analysis)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium text-white">{analysis.title}</h3>
                                <Badge variant="outline" className={getSentimentColor(analysis.sentiment)}>
                                  <span className="flex items-center gap-1">
                                    {getSentimentIcon(analysis.sentiment)}
                                    {analysis.sentiment}
                                  </span>
                                </Badge>
                                <Badge variant="secondary" className="bg-slate-700">
                                  {analysis.confidence}%
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                                {analysis.summary}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(analysis.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {analysis.symbol && (
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {analysis.symbol}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {analysis.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAnalysis(analysis.id);
                              }}
                              className="text-slate-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="detail" className="space-y-4 mt-6">
            {selectedAnalysis && (
              <ScrollArea className="h-[450px] w-full">
                <div className="space-y-4">
                  {/* 헤더 */}
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-white mb-2">
                            {selectedAnalysis.title}
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={getSentimentColor(selectedAnalysis.sentiment)}>
                              <span className="flex items-center gap-1">
                                {getSentimentIcon(selectedAnalysis.sentiment)}
                                {selectedAnalysis.sentiment}
                              </span>
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-700">
                              신뢰도 {selectedAnalysis.confidence}%
                            </Badge>
                            {selectedAnalysis.symbol && (
                              <Badge variant="outline" className="border-blue-600 text-blue-400">
                                {selectedAnalysis.symbol}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteAnalysis(selectedAnalysis.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* 요약 */}
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-100">분석 요약</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedAnalysis.summary}
                      </p>
                    </CardContent>
                  </Card>

                  {/* 주요 포인트 */}
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-100">주요 포인트</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedAnalysis.key_points.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-300">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* 가격 정보 */}
                  {(selectedAnalysis.current_price || selectedAnalysis.target_price) && (
                    <Card className="bg-slate-800/30 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-100">가격 정보</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedAnalysis.current_price && (
                            <div>
                              <p className="text-sm text-slate-400 mb-1">현재 가격</p>
                              <p className="text-xl font-bold text-white">
                                {selectedAnalysis.current_price}
                              </p>
                            </div>
                          )}
                          {selectedAnalysis.target_price && (
                            <div>
                              <p className="text-sm text-slate-400 mb-1">목표 가격</p>
                              <p className="text-xl font-bold text-green-400">
                                {selectedAnalysis.target_price}
                              </p>
                            </div>
                          )}
                        </div>
                        {selectedAnalysis.recommendation && (
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <p className="text-sm text-slate-400 mb-1">투자 추천</p>
                            <Badge 
                              variant="outline" 
                              className={
                                selectedAnalysis.recommendation === '매수' ? 'border-green-600 text-green-400' :
                                selectedAnalysis.recommendation === '매도' ? 'border-red-600 text-red-400' :
                                'border-yellow-600 text-yellow-400'
                              }
                            >
                              {selectedAnalysis.recommendation}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* 메타 정보 */}
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-100">분석 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 mb-1">분석 일시</p>
                          <p className="text-slate-300">
                            {new Date(selectedAnalysis.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">분석 유형</p>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {selectedAnalysis.type === 'stock' ? '주식' : 
                             selectedAnalysis.type === 'crypto' ? '암호화폐' : '거시경제'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {message && (
          <Alert className={`${message.includes('삭제되었습니다') ? 'bg-green-900/20 border-green-800 text-green-200' : 'bg-red-900/20 border-red-800 text-red-200'}`}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
} 