const translations = {
  en: {
    // Header & General
    kryptovision: "KryptoVision",
    toggle_language: "Toggle Language",
    search_placeholder: "Search for a stock (e.g., AAPL)",
    export_csv: "Export CSV",
    n_a: "N/A",

    // Stock Data Table
    market_cap: "Market Cap",
    pe_ratio: "P/E Ratio",
    '52_week_high': "1-Year High",
    '52_week_low': "1-Year Low",
    dividend_yield: "Dividend Yield",
    beta: "Beta",
    volume: "Volume",

    // Chart
    price_chart_title: "Price Chart",
    price_chart_subtitle: "Stock price movement and volume over time.",
    stock_chart: "Stock Chart",
    candle: "Candle",
    line: "Line",
    area: "Area",
    reset: "Reset",
    mouse_wheel_zoom: "• Mouse Wheel: Zoom in/out",
    drag_to_pan: "• Drag: Pan chart",
    hover_info: "• Hover: Show details",
    
    // AI Analysis
    ai_analysis_title: "AI Analysis",
    recommendation: "Recommendation",
    confidence: "Confidence",
    sentiment: "Sentiment",
    summary: "Summary",
    buy: "Buy",
    hold: "Hold",
    sell: "Sell",
    analysis_not_available: "Analysis not available",
    news_sentiment_title: "News Sentiment",
    positive: "Positive",
    negative: "Negative",
    neutral: "Neutral",
    sentiment_not_available: "Sentiment analysis is not available.",
    start_ai_analysis: "Start AI Analysis",
    start_analysis_prompt_title: "Ready for In-depth Analysis?",
    start_analysis_prompt_desc: "Click to analyze the latest market data.",
    
    // AI Analysis Save
    save_analysis: "Save Analysis",
    saving_analysis: "Saving...",
    save_success: "Analysis Saved",
    save_error: "Save Failed",
    analysis_saved_message: "Analysis has been saved to your history",

    // AI Analysis Loading
    analyzing_sentiment: "🧠 Analyzing news sentiment...",
    analyzing_technicals: "📊 Analyzing technical indicators...",
    analyzing_charts: "📈 Analyzing chart patterns...",

    // News
    latest_news_title: "Latest News",
    stock_specific_news: "Stock Specific",
    market_news: "Market",
    no_news_found: "No news found.",

    // Fear & Greed
    fear_greed_index_title: "Fear & Greed Index",
    fear_greed_index_subtitle: "Current market sentiment.",
    extreme_fear: "Extreme Fear",
    fear: "Fear",
    // neutral: "Neutral", // already defined
    greed: "Greed",
    extreme_greed: "Extreme Greed",
    
    // News Modal
    summarizing: "Summarizing...",
    summary_error: "Could not generate summary.",
    go_to_source: "Go to Source",
    close: "Close",
    current_daily_change: "Today's Change",
    previous_day_summary: "US Market Summary (Prev. Day)",

    // Loading Screen
    loading_message_1: "Loading market data...",
    loading_message_2: "Analyzing latest trends...",
    loading_message_3: "Consulting with AI oracles...",
    loading_message_4: "Finalizing insights...",

    // Global Indices
    global_indices_title: "Global Indices",
    kospi: "KOSPI",
    nasdaq: "NASDAQ",
    sp500: "S&P 500",
    usd_krw: "USD/KRW",
    loading_indices: "Loading indices...",

    // Realtime Updates
    realtime_status: "LIVE",
    realtime_paused: "PAUSED",
    realtime_interval: "30s interval",
    realtime_pause: "Pause",
    realtime_resume: "Resume",
    realtime_refresh: "Refresh",
    time_ago_seconds: "s ago",
    time_ago_minutes: "m ago",

    // New investment information translations
    short_term_target: "Short-term Target (3-6M)",
    long_term_target: "Long-term Target (1-2Y)",
    buy_price: "Recommended Buy Price",
    sell_price: "Recommended Sell Price",
    risk_level: "Risk Level",
    risk_low: "Low Risk",
    risk_medium: "Medium Risk",
    risk_high: "High Risk",
    investment_guidance: "Investment Guidance",
  },
  kr: {
    // Header & General
    kryptovision: "크립토비전",
    toggle_language: "언어 변경",
    search_placeholder: "주식 검색 (예: AAPL)",
    export_csv: "CSV로 내보내기",
    n_a: "정보 없음",

    // Stock Data Table
    market_cap: "시가총액",
    pe_ratio: "주가수익비율 (P/E)",
    '52_week_high': "1년 최고가",
    '52_week_low': "1년 최저가",
    dividend_yield: "배당수익률",
    beta: "베타",
    volume: "거래량",

    // Chart
    price_chart_title: "가격 차트",
    price_chart_subtitle: "시간에 따른 주가 변동 및 거래량.",
    stock_chart: "주식 차트",
    candle: "캔들",
    line: "라인",
    area: "영역",
    reset: "리셋",
    mouse_wheel_zoom: "• 마우스 휠: 줌인/줌아웃",
    drag_to_pan: "• 드래그: 차트 이동",
    hover_info: "• 마우스를 차트 위에 올려 상세 정보 확인",

    // AI Analysis
    ai_analysis_title: "AI 분석",
    recommendation: "추천",
    confidence: "신뢰도",
    sentiment: "시장심리",
    summary: "요약",
    buy: "매수",
    hold: "보유",
    sell: "매도",
    analysis_not_available: "분석 결과가 없습니다",
    news_sentiment_title: "뉴스 심리 분석",
    positive: "긍정적",
    negative: "부정적",
    neutral: "중립적",
    sentiment_not_available: "심리 분석을 이용할 수 없습니다.",
    start_ai_analysis: "AI 분석 시작",
    start_analysis_prompt_title: "심층 분석을 시작할까요?",
    start_analysis_prompt_desc: "최신 시장 데이터를 분석하려면 클릭하세요.",
    
    // AI Analysis Save
    save_analysis: "분석 저장",
    saving_analysis: "저장 중...",
    save_success: "분석 저장 완료",
    save_error: "저장 실패",
    analysis_saved_message: "분석 결과가 히스토리에 저장되었습니다",
    
    // AI Analysis Loading
    analyzing_sentiment: "🧠 뉴스 심리 분석 중...",
    analyzing_technicals: "📊 기술적 지표 분석 중...",
    analyzing_charts: "📈 차트 패턴 분석 중...",

    // News
    latest_news_title: "최신 뉴스",
    stock_specific_news: "종목 뉴스",
    market_news: "시장 뉴스",
    no_news_found: "뉴스를 찾을 수 없습니다.",

    // Fear & Greed
    fear_greed_index_title: "공포 & 탐욕 지수",
    fear_greed_index_subtitle: "현재 시장 심리 상태.",
    extreme_fear: "극도의 공포",
    fear: "공포",
    // neutral: "중립", // already defined
    greed: "탐욕",
    extreme_greed: "극도의 탐욕",

    // News Modal
    summarizing: "요약 중...",
    summary_error: "요약을 생성할 수 없습니다.",
    go_to_source: "출처로 이동",
    close: "닫기",
    current_daily_change: "현재 변동률",
    previous_day_summary: "오선 미국 증시 전일 요약",
    
    // Loading Screen
    loading_message_1: "시장 데이터를 불러오고 있습니다...",
    loading_message_2: "최신 트렌드를 분석 중입니다...",
    loading_message_3: "AI가 데이터를 분석하고 있습니다...",
    loading_message_4: "인사이트를 최종 정리 중입니다...",

    // Global Indices
    global_indices_title: "해외 주요 지수",
    kospi: "코스피",
    nasdaq: "나스닥",
    sp500: "S&P 500",
    usd_krw: "원/달러",
    loading_indices: "지수 로딩 중...",

    // Realtime Updates
    realtime_status: "실시간",
    realtime_paused: "중지됨",
    realtime_interval: "30초 간격",
    realtime_pause: "일시정지",
    realtime_resume: "재시작",
    realtime_refresh: "새로고침",
    time_ago_seconds: "초 전",
    time_ago_minutes: "분 전",

    // New investment information translations
    short_term_target: "단기 목표가 (3-6개월)",
    long_term_target: "장기 목표가 (1-2년)",
    buy_price: "추천 매수가",
    sell_price: "추천 매도가",
    risk_level: "투자 위험도",
    risk_low: "낮은 위험",
    risk_medium: "중간 위험",
    risk_high: "높은 위험",
    investment_guidance: "투자 가이드",
  },
};

export default translations;
