import { StockData, NewsArticle, MarketIndicator } from './types';

export const mockAutocomplete = [
  // 🔥 주요 테크 기업들
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
  { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'TSLL', name: 'Leverage Shares 2x Tesla ETP' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix, Inc.' },
  
  // 🎯 반도체 & CPU/GPU 기업들  
  { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'QCOM', name: 'QUALCOMM Incorporated' },
  { symbol: 'AVGO', name: 'Broadcom Inc.' },
  { symbol: 'TXN', name: 'Texas Instruments Incorporated' },
  { symbol: 'ADI', name: 'Analog Devices, Inc.' },
  { symbol: 'MRVL', name: 'Marvell Technology, Inc.' },
  { symbol: 'XLNX', name: 'Xilinx, Inc.' },
  { symbol: 'MU', name: 'Micron Technology, Inc.' },
  
  // 💰 금융 & 은행
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'BAC', name: 'Bank of America Corporation' },
  { symbol: 'WFC', name: 'Wells Fargo & Company' },
  { symbol: 'C', name: 'Citigroup Inc.' },
  { symbol: 'GS', name: 'The Goldman Sachs Group, Inc.' },
  { symbol: 'MS', name: 'Morgan Stanley' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'MA', name: 'Mastercard Incorporated' },
  { symbol: 'PYPL', name: 'PayPal Holdings, Inc.' },
  
  // 🏥 헬스케어 & 제약
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'PFE', name: 'Pfizer Inc.' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated' },
  { symbol: 'MRNA', name: 'Moderna, Inc.' },
  { symbol: 'BNTX', name: 'BioNTech SE' },
  { symbol: 'ABBV', name: 'AbbVie Inc.' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.' },
  { symbol: 'DHR', name: 'Danaher Corporation' },
  
  // ⚡ 에너지 & 유틸리티
  { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
  { symbol: 'CVX', name: 'Chevron Corporation' },
  { symbol: 'COP', name: 'ConocoPhillips' },
  { symbol: 'SLB', name: 'Schlumberger Limited' },
  { symbol: 'OXY', name: 'Occidental Petroleum Corporation' },
  
  // 🏭 소비재 & 리테일
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'HD', name: 'The Home Depot, Inc.' },
  { symbol: 'PG', name: 'The Procter & Gamble Company' },
  { symbol: 'KO', name: 'The Coca-Cola Company' },
  { symbol: 'PEP', name: 'PepsiCo, Inc.' },
  { symbol: 'NKE', name: 'NIKE, Inc.' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation' },
  { symbol: 'SBUX', name: 'Starbucks Corporation' },
  
  // 🚗 자동차 & 교통
  { symbol: 'F', name: 'Ford Motor Company' },
  { symbol: 'GM', name: 'General Motors Company' },
  { symbol: 'RIVN', name: 'Rivian Automotive, Inc.' },
  { symbol: 'LCID', name: 'Lucid Group, Inc.' },
  { symbol: 'NIO', name: 'NIO Inc.' },
  { symbol: 'XPEV', name: 'XPeng Inc.' },
  { symbol: 'LI', name: 'Li Auto Inc.' },
  
  // 🏠 부동산 & 리츠
  { symbol: 'AMT', name: 'American Tower Corporation' },
  { symbol: 'PLD', name: 'Prologis, Inc.' },
  { symbol: 'CCI', name: 'Crown Castle Inc.' },
  { symbol: 'EQIX', name: 'Equinix, Inc.' },
  
  // 📱 통신 & 미디어
  { symbol: 'T', name: 'AT&T Inc.' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.' },
  { symbol: 'TMUS', name: 'T-Mobile US, Inc.' },
  { symbol: 'CMCSA', name: 'Comcast Corporation' },
  
  // 🎮 게임 & 엔터테인먼트
  { symbol: 'ATVI', name: 'Activision Blizzard, Inc.' },
  { symbol: 'EA', name: 'Electronic Arts Inc.' },
  { symbol: 'TTWO', name: 'Take-Two Interactive Software, Inc.' },
  { symbol: 'RBLX', name: 'Roblox Corporation' },
  { symbol: 'U', name: 'Unity Software Inc.' },
  
  // ☁️ 클라우드 & SaaS
  { symbol: 'CRM', name: 'salesforce.com, inc.' },
  { symbol: 'NOW', name: 'ServiceNow, Inc.' },
  { symbol: 'SNOW', name: 'Snowflake Inc.' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings, Inc.' },
  { symbol: 'ZM', name: 'Zoom Video Communications, Inc.' },
  { symbol: 'WORK', name: 'Slack Technologies, Inc.' },
  
  // 🚀 우주 & 항공
  { symbol: 'BA', name: 'The Boeing Company' },
  { symbol: 'LMT', name: 'Lockheed Martin Corporation' },
  { symbol: 'RTX', name: 'Raytheon Technologies Corporation' },
  { symbol: 'NOC', name: 'Northrop Grumman Corporation' },
  
  // 🏦 핀테크 & 암호화폐 관련
  { symbol: 'SQ', name: 'Block, Inc.' },
  { symbol: 'COIN', name: 'Coinbase Global, Inc.' },
  { symbol: 'MSTR', name: 'MicroStrategy Incorporated' },
  { symbol: 'HOOD', name: 'Robinhood Markets, Inc.' },
  
  // 🧬 바이오테크 & 첨단기술
  { symbol: 'GILD', name: 'Gilead Sciences, Inc.' },
  { symbol: 'AMGN', name: 'Amgen Inc.' },
  { symbol: 'BIIB', name: 'Biogen Inc.' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals, Inc.' },
  
  // 🛒 전자상거래 & 배송
  { symbol: 'SHOP', name: 'Shopify Inc.' },
  { symbol: 'EBAY', name: 'eBay Inc.' },
  { symbol: 'ETSY', name: 'Etsy, Inc.' },
  { symbol: 'BABA', name: 'Alibaba Group Holding Limited' },
  { symbol: 'JD', name: 'JD.com, Inc.' },
  { symbol: 'PDD', name: 'PDD Holdings Inc.' },
  
  // 🏗️ 산업재 & 건설
  { symbol: 'CAT', name: 'Caterpillar Inc.' },
  { symbol: 'DE', name: 'Deere & Company' },
  { symbol: 'MMM', name: '3M Company' },
  { symbol: 'HON', name: 'Honeywell International Inc.' },
  { symbol: 'GE', name: 'General Electric Company' },
  
  // 🇰🇷 한국 주요 종목들 (확장)
  { symbol: '005930.KS', name: '삼성전자 (Samsung Electronics)' },
  { symbol: '000660.KS', name: 'SK하이닉스 (SK Hynix)' },
  { symbol: '035420.KS', name: '네이버 (NAVER)' },
  { symbol: '035720.KS', name: '카카오 (Kakao)' },
  { symbol: '207940.KS', name: '삼성바이오로직스 (Samsung Biologics)' },
  { symbol: '006400.KS', name: '삼성SDI (Samsung SDI)' },
  { symbol: '051910.KS', name: 'LG화학 (LG Chem)' },
  { symbol: '003670.KS', name: '포스코홀딩스 (POSCO Holdings)' },
  { symbol: '096770.KS', name: 'SK이노베이션 (SK Innovation)' },
  { symbol: '017670.KS', name: 'SK텔레콤 (SK Telecom)' },
  { symbol: '030200.KS', name: 'KT (KT Corporation)' },
  { symbol: '055550.KS', name: '신한지주 (Shinhan Financial Group)' },
  { symbol: '105560.KS', name: 'KB금융 (KB Financial Group)' },
  { symbol: '086790.KS', name: '하나금융지주 (Hana Financial Group)' },
  { symbol: '012330.KS', name: '현대모비스 (Hyundai Mobis)' },
  { symbol: '005380.KS', name: '현대차 (Hyundai Motor)' },
  { symbol: '000270.KS', name: '기아 (Kia Corporation)' },
  { symbol: '068270.KS', name: '셀트리온 (Celltrion)' },
  { symbol: '028260.KS', name: '삼성물산 (Samsung C&T)' },
  { symbol: '018260.KS', name: '삼성에스디에스 (Samsung SDS)' },
];

export const mockStockData: Record<string, StockData> = {
  AAPL: {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    currentPrice: 172.28,
    dailyChange: { value: 2.53, percentage: 1.49 },
    volume: '54.0M',
    marketCap: '2.66T',
    peRatio: 26.68,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
    dividendYield: 0.56,
    beta: 1.28,
  },
  GOOGL: {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    exchange: 'NASDAQ',
    currentPrice: 140.76,
    dailyChange: { value: -0.55, percentage: -0.39 },
    volume: '23.1M',
    marketCap: '1.76T',
    peRatio: 25.18,
    fiftyTwoWeekHigh: 155.20,
    fiftyTwoWeekLow: 115.83,
    dividendYield: null,
    beta: 1.04,
  },
  TSLA: {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    exchange: 'NASDAQ',
    currentPrice: 177.77,
    dailyChange: { value: -2.02, percentage: -1.13 },
    volume: '95.6M',
    marketCap: '566B',
    peRatio: 38.56,
    fiftyTwoWeekHigh: 299.29,
    fiftyTwoWeekLow: 138.80,
    dividendYield: null,
    beta: 2.35,
  },
  TSLL: {
    ticker: 'TSLL',
    name: 'Leverage Shares 2x Tesla ETP',
    exchange: 'NASDAQ',
    currentPrice: 8.85,
    dailyChange: { value: -0.34, percentage: -3.70 },
    volume: '34.5M',
    marketCap: 'N/A',
    peRatio: 0,
    fiftyTwoWeekHigh: 28.10,
    fiftyTwoWeekLow: 7.90,
    dividendYield: null,
    beta: 4.7,
  },
  MSFT: {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    currentPrice: 420.55,
    dailyChange: { value: 3.10, percentage: 0.74 },
    volume: '20.5M',
    marketCap: '3.12T',
    peRatio: 36.57,
    fiftyTwoWeekHigh: 430.82,
    fiftyTwoWeekLow: 309.49,
    dividendYield: 0.70,
    beta: 0.89,
  },
  AMZN: {
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    exchange: 'NASDAQ',
    currentPrice: 183.63,
    dailyChange: { value: -1.21, percentage: -0.65 },
    volume: '35.8M',
    marketCap: '1.91T',
    peRatio: 51.73,
    fiftyTwoWeekHigh: 191.70,
    fiftyTwoWeekLow: 118.35,
    dividendYield: null,
    beta: 1.14,
  },
  NVDA: {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    currentPrice: 887.89,
    dailyChange: { value: 12.65, percentage: 1.45 },
    volume: '45.1M',
    marketCap: '2.22T',
    peRatio: 72.54,
    fiftyTwoWeekHigh: 974.00,
    fiftyTwoWeekLow: 260.33,
    dividendYield: 0.02,
    beta: 1.70,
  },
    '005930.KS': {
    ticker: '005930.KS',
    name: 'Samsung Electronics Co., Ltd.',
    exchange: 'KOSPI',
    currentPrice: 75000,
    dailyChange: { value: 1000, percentage: 1.35 },
    volume: '15.0M',
    marketCap: '447T',
    peRatio: 15.5,
    fiftyTwoWeekHigh: 86000,
    fiftyTwoWeekLow: 65000,
    dividendYield: 2.0,
    beta: 0.9,
  },
  '000660.KS': {
    ticker: '000660.KS',
    name: 'SK Hynix Inc.',
    exchange: 'KOSPI',
    currentPrice: 130000,
    dailyChange: { value: -2000, percentage: -1.52 },
    volume: '4.5M',
    marketCap: '94T',
    peRatio: 20.1,
    fiftyTwoWeekHigh: 150000,
    fiftyTwoWeekLow: 80000,
    dividendYield: 0.9,
    beta: 1.1,
  },
};

const generateChartData = (basePrice: number) => {
  const data: any[] = [];
  let currentDate = new Date();
  
  // 🔥 5년 전부터 시작하여 현재까지의 데이터 생성 (1825일)
  currentDate.setFullYear(currentDate.getFullYear() - 5);
  
  // 시작 가격을 현재 가격의 60-80% 수준으로 설정 (성장 트렌드 반영)
  let currentPrice = basePrice * (0.6 + Math.random() * 0.2);
  
  // 연도별 성장률 설정 (현실적인 주식 성장 패턴)
  const yearlyGrowthRates = [
    { year: 0, growth: 0.15 + Math.random() * 0.1 },  // 첫 해: 15-25%
    { year: 1, growth: 0.05 + Math.random() * 0.15 }, // 둘째 해: 5-20%
    { year: 2, growth: -0.05 + Math.random() * 0.2 }, // 셋째 해: -5%~15%
    { year: 3, growth: 0.1 + Math.random() * 0.15 },  // 넷째 해: 10-25%
    { year: 4, growth: 0.05 + Math.random() * 0.1 }   // 다섯째 해: 5-15%
  ];

  for (let i = 0; i < 1825; i++) { // 5년 = 365 * 5 = 1825일
    // 연도별 성장 트렌드 적용
    const yearIndex = Math.floor(i / 365);
    const dayInYear = i % 365;
    const yearProgress = dayInYear / 365;
    
    // 기본 성장 트렌드
    const growthRate = yearlyGrowthRates[yearIndex]?.growth || 0.1;
    const trendFactor = 1 + (growthRate * yearProgress / 365);
    
    // 계절성 효과 (1년 주기)
    const seasonalFactor = 1 + Math.sin(dayInYear / 365 * 2 * Math.PI) * 0.05;
    
    // 일일 변동성 (현실적인 범위)
    const dailyVolatility = (Math.random() - 0.5) * 0.04; // ±2%
    
    // 전날 종가 기반으로 오늘 시가 결정
    const gapFactor = 1 + (Math.random() - 0.5) * 0.01; // 갭 ±0.5%
    const open = currentPrice * gapFactor;
    
    // 일중 변동 계산
    const intraDayMove = dailyVolatility * trendFactor * seasonalFactor;
    const close = open * (1 + intraDayMove);
    
    // 고가/저가 계산 (현실적인 범위)
    const intraDayRange = Math.abs(open - close) + (Math.random() * 0.02 * Math.max(open, close));
    const high = Math.max(open, close) + intraDayRange * (0.3 + Math.random() * 0.4);
    const low = Math.min(open, close) - intraDayRange * (0.3 + Math.random() * 0.4);
    
    // 거래량 (현실적인 패턴)
    const baseVolume = 10000000 + Math.random() * 50000000;
    const volatilityVolume = baseVolume * (1 + Math.abs(intraDayMove) * 5); // 변동성이 클수록 거래량 증가
    const volume = Math.floor(volatilityVolume);
    
    // 이동평균선 계산 (단순화)
    const ma20Period = Math.max(0, i - 19);
    const ma50Period = Math.max(0, i - 49);
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      range: [Number(low.toFixed(2)), Number(high.toFixed(2))],
      volume,
      ma20: i >= 19 ? Number((data.slice(ma20Period).reduce((sum, d) => sum + d.close, 0) / Math.min(20, i + 1)).toFixed(2)) : close,
      ma50: i >= 49 ? Number((data.slice(ma50Period).reduce((sum, d) => sum + d.close, 0) / Math.min(50, i + 1)).toFixed(2)) : close,
    });
    
    // 다음날을 위해 현재가 업데이트
    currentPrice = close;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`[Chart Data] Generated 5-year data: ${data.length} days, from ${data[0].date} to ${data[data.length-1].date}`);
  console.log(`[Chart Data] Price movement: $${data[0].close.toFixed(2)} → $${data[data.length-1].close.toFixed(2)} (${(((data[data.length-1].close - data[0].close) / data[0].close) * 100).toFixed(1)}%)`);
  
  return data;
};

export const mockChartData: Record<string, any[]> = {
  AAPL: generateChartData(170),
  GOOGL: generateChartData(140),
  TSLA: generateChartData(180),
  TSLL: generateChartData(8.85),
  MSFT: generateChartData(420),
  AMZN: generateChartData(183),
  NVDA: generateChartData(880),
  '005930.KS': generateChartData(75000),
  '000660.KS': generateChartData(130000),
};

export const mockNewsData: Record<string, NewsArticle[]> = {
  AAPL: [
    { title: 'Apple 4분기 실적 예상 상회, 아이폰 15 판매 호조로 주가 급등', source: 'Reuters', publishedAt: new Date(Date.now() - 1800000).toISOString(), url: '#', summary: 'Apple이 4분기 실적에서 시장 예상을 상회하는 매출을 기록했다고 발표했습니다. 특히 iPhone 15의 강력한 판매 실적이 주가 상승을 이끌었습니다.' },
    { title: 'Apple Vision Pro, 2024년 한국 출시 예정... 공간 컴퓨팅 시대 개막', source: 'TechCrunch', publishedAt: new Date(Date.now() - 3600000).toISOString(), url: '#', summary: 'Apple이 혁신적인 공간 컴퓨팅 디바이스인 Vision Pro의 한국 출시를 2024년 중 진행할 예정이라고 발표했습니다.' },
    { title: 'Apple, AI 칩셋 자체 개발 가속화... NVIDIA 의존도 줄인다', source: 'Bloomberg', publishedAt: new Date(Date.now() - 7200000).toISOString(), url: '#', summary: 'Apple이 AI 작업에 특화된 자체 칩셋 개발을 가속화하며 NVIDIA에 대한 의존도를 낮추려는 전략을 추진하고 있습니다.' },
    { title: 'Morgan Stanley, Apple 목표주가 220달러로 상향... 서비스 부문 성장 기대', source: 'MarketWatch', publishedAt: new Date(Date.now() - 10800000).toISOString(), url: '#', summary: 'Morgan Stanley는 Apple의 서비스 부문 지속적 성장을 근거로 목표주가를 기존 200달러에서 220달러로 10% 상향 조정했습니다.' },
    { title: 'Apple Pay, 인도 시장 진출... 14억 인구 디지털 결제 시장 공략', source: 'Financial Times', publishedAt: new Date(Date.now() - 14400000).toISOString(), url: '#', summary: 'Apple이 인도의 디지털 결제 시장 진출을 위해 Apple Pay 서비스를 현지에 맞게 최적화하여 출시할 계획이라고 발표했습니다.' },
  ],
  GOOGL: [
    { title: 'Google Gemini AI, ChatGPT 성능 압도... AI 경쟁 새로운 국면', source: 'The Verge', publishedAt: new Date(Date.now() - 900000).toISOString(), url: '#', summary: 'Google의 최신 AI 모델 Gemini가 여러 벤치마크에서 OpenAI의 ChatGPT-4를 넘어서는 성능을 보여주며 AI 경쟁에 새로운 전환점을 만들었습니다.' },
    { title: 'Alphabet 3분기 매출 307억달러 기록... 클라우드 사업 43% 급성장', source: 'CNBC', publishedAt: new Date(Date.now() - 2700000).toISOString(), url: '#', summary: 'Alphabet이 3분기 매출 307억달러를 기록하며 시장 예상을 크게 상회했습니다. 특히 Google Cloud 사업이 전년 동기 대비 43% 성장했습니다.' },
    { title: 'Google, 검색 알고리즘에 AI 통합 완료... 검색 경험 혁신', source: 'TechCrunch', publishedAt: new Date(Date.now() - 5400000).toISOString(), url: '#', summary: 'Google이 핵심 검색 알고리즘에 생성형 AI를 완전히 통합하여 사용자에게 더욱 정확하고 맥락적인 검색 결과를 제공하기 시작했습니다.' },
    { title: 'YouTube Shorts, 월간 사용자 20억명 돌파... TikTok 추격 가속화', source: 'Reuters', publishedAt: new Date(Date.now() - 8100000).toISOString(), url: '#', summary: 'YouTube Shorts의 월간 활성 사용자가 20억명을 돌파하며 TikTok과의 경쟁에서 의미있는 성과를 거두고 있다고 Google이 발표했습니다.' },
    { title: 'Google, 양자컴퓨터 상용화 로드맵 공개... 2030년 실용적 활용 목표', source: 'MIT Technology Review', publishedAt: new Date(Date.now() - 12600000).toISOString(), url: '#', summary: 'Google이 양자컴퓨터의 상용화 로드맵을 공개하며 2030년까지 실용적인 양자컴퓨팅 솔루션을 제공하겠다는 목표를 발표했습니다.' },
  ],
  TSLA: [
    { title: 'Tesla 사이버트럭 생산량 목표 달성... 2024년 50만대 생산 계획', source: 'Bloomberg', publishedAt: new Date(Date.now() - 1200000).toISOString(), url: '#', summary: 'Tesla가 사이버트럭의 초기 생산 목표를 달성했다고 발표하며, 2024년 연간 50만대 생산을 목표로 하고 있다고 밝혔습니다.' },
    { title: 'Tesla FSD 베타 12.0 출시... 완전자율주행 한 단계 더 진화', source: 'Electrek', publishedAt: new Date(Date.now() - 3000000).toISOString(), url: '#', summary: 'Tesla가 완전자율주행(FSD) 베타 12.0 버전을 출시하며 신경망 기반 주행 성능이 크게 개선되었다고 발표했습니다.' },
    { title: 'Tesla 슈퍼차저, 다른 전기차 브랜드에 개방... 충전 네트워크 확대', source: 'The Verge', publishedAt: new Date(Date.now() - 6300000).toISOString(), url: '#', summary: 'Tesla가 자사의 슈퍼차저 네트워크를 다른 전기차 브랜드에도 개방하기 시작하며 전기차 충전 인프라 표준화를 주도하고 있습니다.' },
    { title: 'Elon Musk, 로봇택시 사업 본격화 예고... 2024년 시범 서비스 시작', source: 'Reuters', publishedAt: new Date(Date.now() - 9900000).toISOString(), url: '#', summary: 'Tesla CEO 일론 머스크가 로봇택시 사업을 본격화하며 2024년 중 주요 도시에서 시범 서비스를 시작할 계획이라고 발표했습니다.' },
    { title: 'Tesla 기가팩토리 멕시코 건설 재개... 전기차 생산 확대', source: 'Automotive News', publishedAt: new Date(Date.now() - 13500000).toISOString(), url: '#', summary: 'Tesla가 잠시 중단했던 멕시코 기가팩토리 건설을 재개하며 글로벌 전기차 생산 능력을 대폭 확대할 계획입니다.' },
  ],
  MSFT: [
    { title: 'Microsoft 365 Copilot 사용자 100만명 돌파... 생산성 도구 AI 혁신', source: 'ZDNet', publishedAt: new Date(Date.now() - 1500000).toISOString(), url: '#', summary: 'Microsoft 365 Copilot의 사용자가 100만명을 돌파하며 직장에서의 AI 도구 활용이 급속히 확산되고 있습니다.' },
    { title: 'Microsoft, OpenAI에 추가 투자 검토... AI 생태계 주도권 강화', source: 'Wall Street Journal', publishedAt: new Date(Date.now() - 4500000).toISOString(), url: '#', summary: 'Microsoft가 OpenAI에 대한 추가 투자를 검토하고 있으며, AI 기술 생태계에서의 주도권을 더욱 강화하려는 전략으로 보입니다.' },
    { title: 'Azure 클라우드 매출 29% 증가... 기업용 AI 서비스 호조', source: 'TechCrunch', publishedAt: new Date(Date.now() - 7500000).toISOString(), url: '#', summary: 'Microsoft Azure 클라우드 서비스의 매출이 전년 동기 대비 29% 증가하며 기업용 AI 서비스에 대한 수요가 급증하고 있습니다.' },
    { title: 'Windows 12, 2024년 하반기 출시 예정... AI 기능 대폭 강화', source: 'Windows Central', publishedAt: new Date(Date.now() - 11700000).toISOString(), url: '#', summary: 'Microsoft가 AI 기능을 대폭 강화한 Windows 12를 2024년 하반기 출시할 예정이라고 관련 업계가 전했습니다.' },
    { title: 'Microsoft Teams, 새로운 AI 회의 기능 추가... 업무 효율성 향상', source: 'The Verge', publishedAt: new Date(Date.now() - 15300000).toISOString(), url: '#', summary: 'Microsoft Teams에 AI 기반 회의 요약, 실시간 번역, 스마트 일정 관리 등의 새로운 기능이 추가되어 업무 효율성이 크게 향상될 전망입니다.' },
  ],
  NVDA: [
    { title: 'NVIDIA H100 GPU 수요 폭증... AI 붐으로 공급 부족 심화', source: 'Tom\'s Hardware', publishedAt: new Date(Date.now() - 2100000).toISOString(), url: '#', summary: 'NVIDIA의 H100 GPU에 대한 수요가 폭증하면서 AI 붐으로 인한 공급 부족 현상이 더욱 심화되고 있습니다.' },
    { title: 'NVIDIA, 중국향 AI 칩 수출 새로운 규제 대응 방안 발표', source: 'Reuters', publishedAt: new Date(Date.now() - 5700000).toISOString(), url: '#', summary: 'NVIDIA가 미국 정부의 중국향 AI 칩 수출 규제에 대응하여 새로운 제품 라인업과 판매 전략을 발표했습니다.' },
    { title: 'NVIDIA RTX 50 시리즈, 2024년 1분기 출시... 게이밍 성능 2배 향상', source: 'PC Gamer', publishedAt: new Date(Date.now() - 9000000).toISOString(), url: '#', summary: 'NVIDIA가 차세대 RTX 50 시리즈 그래픽카드를 2024년 1분기 출시할 예정이며, 이전 세대 대비 게이밍 성능이 2배 향상될 것으로 예상됩니다.' },
    { title: 'NVIDIA, 자율주행 칩 시장 점유율 70% 달성... 모빌리티 혁신 주도', source: 'Automotive News', publishedAt: new Date(Date.now() - 12900000).toISOString(), url: '#', summary: 'NVIDIA가 자율주행 칩 시장에서 70%의 점유율을 달성하며 모빌리티 산업의 AI 혁신을 주도하고 있습니다.' },
    { title: 'NVIDIA Omniverse, 메타버스 플랫폼으로 기업 고객 확대', source: 'VentureBeat', publishedAt: new Date(Date.now() - 16200000).toISOString(), url: '#', summary: 'NVIDIA Omniverse 플랫폼이 메타버스 기업 솔루션으로 확장되며 글로벌 기업들의 가상 협업 환경 구축을 지원하고 있습니다.' },
  ],
  AMZN: [
    { title: 'Amazon Q4 매출 1,700억달러 예상... AWS 클라우드 성장 지속', source: 'CNBC', publishedAt: new Date(Date.now() - 1800000).toISOString(), url: '#', summary: 'Amazon이 4분기 매출 1,700억달러를 기록할 것으로 예상되며, AWS 클라우드 사업의 강력한 성장이 지속되고 있습니다.' },
    { title: 'Amazon Prime Air, 드론 배송 서비스 확대... 30분 내 배송 현실화', source: 'TechCrunch', publishedAt: new Date(Date.now() - 4200000).toISOString(), url: '#', summary: 'Amazon이 Prime Air 드론 배송 서비스를 주요 도시로 확대하며 30분 내 배송 서비스를 현실화하고 있습니다.' },
    { title: 'Amazon Alexa, 생성형 AI 통합... 대화형 AI 어시스턴트로 진화', source: 'The Verge', publishedAt: new Date(Date.now() - 7800000).toISOString(), url: '#', summary: 'Amazon이 Alexa에 생성형 AI를 통합하여 더욱 자연스럽고 지능적인 대화형 AI 어시스턴트로 진화시키고 있습니다.' },
    { title: 'Amazon, 헬스케어 사업 확대... One Medical 인수 효과 본격화', source: 'Healthcare Dive', publishedAt: new Date(Date.now() - 11400000).toISOString(), url: '#', summary: 'Amazon이 One Medical 인수를 통해 헬스케어 사업을 본격화하며 디지털 헬스케어 시장에서의 입지를 확대하고 있습니다.' },
    { title: 'Amazon 물류센터 AI 로봇 도입 확대... 배송 효율성 30% 향상', source: 'Logistics Management', publishedAt: new Date(Date.now() - 15000000).toISOString(), url: '#', summary: 'Amazon이 전 세계 물류센터에 AI 로봇을 대폭 도입하여 배송 효율성을 30% 향상시키는 성과를 거두었습니다.' },
  ],
  '005930.KS': [
    { title: '삼성전자, HBM3E 양산 본격화... AI 메모리 시장 선점', source: '연합뉴스', publishedAt: new Date(Date.now() - 1800000).toISOString(), url: '#', summary: '삼성전자가 차세대 AI용 고대역폭 메모리(HBM3E) 양산을 본격화하며 글로벌 AI 메모리 시장 선점에 나섰습니다.' },
    { title: '삼성 갤럭시 S24, AI 기능 대폭 강화... 스마트폰 AI 혁신 주도', source: '매일경제', publishedAt: new Date(Date.now() - 3600000).toISOString(), url: '#', summary: '삼성전자가 갤럭시 S24 시리즈에 온디바이스 AI 기능을 대폭 강화하여 스마트폰 AI 혁신을 주도하고 있습니다.' },
    { title: '삼성, 3나노 파운드리 고객 확대... 애플과 협력 관계 강화', source: '한국경제', publishedAt: new Date(Date.now() - 7200000).toISOString(), url: '#', summary: '삼성전자가 3나노 파운드리 사업에서 애플을 포함한 글로벌 고객들과의 협력 관계를 강화하며 수주 확대에 나서고 있습니다.' },
    { title: '삼성 반도체 투자 확대... 미국 텍사스 공장 추가 증설 검토', source: '이데일리', publishedAt: new Date(Date.now() - 10800000).toISOString(), url: '#', summary: '삼성전자가 미국 텍사스 반도체 공장 추가 증설을 검토하며 글로벌 반도체 공급망 강화에 나서고 있습니다.' },
    { title: '삼성 디스플레이, OLED 기술 혁신... 폴더블 시장 확대', source: '뉴시스', publishedAt: new Date(Date.now() - 14400000).toISOString(), url: '#', summary: '삼성디스플레이가 차세대 OLED 기술 혁신을 통해 폴더블 스마트폰 시장 확대를 주도하고 있습니다.' },
  ],
  '000660.KS': [
    { title: 'SK하이닉스, HBM 메모리 수주 급증... AI 반도체 최대 수혜주 부상', source: '머니투데이', publishedAt: new Date(Date.now() - 2400000).toISOString(), url: '#', summary: 'SK하이닉스가 AI용 HBM 메모리 수주가 급증하면서 AI 반도체 열풍의 최대 수혜주로 부상하고 있습니다.' },
    { title: 'SK하이닉스, 차세대 DDR5 메모리 양산... PC 성능 혁신', source: '전자신문', publishedAt: new Date(Date.now() - 5400000).toISOString(), url: '#', summary: 'SK하이닉스가 차세대 DDR5 메모리 대량 양산에 돌입하며 PC와 서버 성능 혁신을 이끌고 있습니다.' },
    { title: 'SK하이닉스, 미국 팹리스와 AI 칩 공동개발... 기술 협력 확대', source: '한겨레', publishedAt: new Date(Date.now() - 8700000).toISOString(), url: '#', summary: 'SK하이닉스가 미국 주요 팹리스 기업들과 AI 전용 칩 공동개발에 나서며 기술 협력을 확대하고 있습니다.' },
    { title: 'SK하이닉스, 중국 우시 공장 가동률 증대... 글로벌 공급망 안정화', source: '조선비즈', publishedAt: new Date(Date.now() - 12300000).toISOString(), url: '#', summary: 'SK하이닉스가 중국 우시 공장의 가동률을 증대하여 글로벌 메모리 반도체 공급망 안정화에 기여하고 있습니다.' },
    { title: 'SK하이닉스 4분기 실적 개선 전망... 메모리 반도체 업황 회복', source: '서울경제', publishedAt: new Date(Date.now() - 16200000).toISOString(), url: '#', summary: 'SK하이닉스의 4분기 실적이 크게 개선될 것으로 전망되면서 메모리 반도체 업황 회복에 대한 기대감이 커지고 있습니다.' },
  ],
  DEFAULT: [
    { title: '해당 종목의 최신 뉴스를 찾을 수 없습니다', source: '학썜의리딩방', publishedAt: new Date().toISOString(), url: '#', summary: '현재 선택하신 종목에 대한 최신 뉴스가 없습니다. 잠시 후 다시 확인해 주세요.' },
  ]
};

export const mockMarketNewsData: NewsArticle[] = [
    { title: 'Federal Reserve Hints at Interest Rate Stability', source: 'Wall Street Journal', publishedAt: new Date(Date.now() - 5000000).toISOString(), url: '#', summary: 'In a recent statement, the Federal Reserve signaled that interest rates may remain stable for the time being, bringing a sense of calm to the markets.' },
    { title: 'Global Markets React to New Economic Data', source: 'Financial Times', publishedAt: new Date(Date.now() - 10800000).toISOString(), url: '#', summary: 'New economic data has caused ripples across global markets, with mixed reactions from investors in different regions.' },
    { title: 'Tech Sector Sees Unprecedented Growth in Q2', source: 'MarketWatch', publishedAt: new Date(Date.now() - 86400000).toISOString(), url: '#', summary: 'The technology sector has posted record growth in the second quarter, driven by innovations in artificial intelligence and cloud computing.' },
];

export const mockAiAnalysis: Record<string, any> = {
  en: {
    analysisSummary: "Based on recent performance and market trends, the stock shows strong potential for growth. The introduction of new AI-powered features in their upcoming product line is expected to be a significant catalyst. While facing some regulatory headwinds in Europe, the company's fundamentals remain robust with strong cash flow and a loyal customer base. Technical indicators suggest a bullish trend, but caution is advised due to market volatility.",
    recommendation: 'Buy',
    confidenceScore: 0.85,
  },
  kr: {
    analysisSummary: "최근 실적과 시장 동향을 고려할 때, 이 주식은 강력한 성장 잠재력을 보여줍니다. 다가오는 제품 라인에 도입될 새로운 AI 기반 기능은 중요한 촉매제가 될 것으로 예상됩니다. 유럽에서 일부 규제 역풍에 직면해 있지만, 강력한 현금 흐름과 충성도 높은 고객 기반으로 회사의 펀더멘털은 견고하게 유지되고 있습니다. 기술적 지표는 강세 추세를 시사하지만, 시장 변동성으로 인해 주의가 필요합니다.",
    recommendation: 'Buy',
    confidenceScore: 0.85,
  }
};

export const mockNewsSentiment: Record<string, any> = {
  en: {
    sentiment: 'positive',
    confidenceScore: 0.92,
    reasoning: 'The news articles highlight positive developments such as the launch of a new, innovative product and upgraded ratings from analysts, which are likely to boost investor confidence and drive the stock price up.',
  },
  kr: {
    sentiment: 'positive',
    confidenceScore: 0.92,
    reasoning: '뉴스 기사들은 혁신적인 신제품 출시와 분석가들의 등급 상향 조정과 같은 긍정적인 발전을 강조하고 있으며, 이는 투자자 신뢰를 높이고 주가를 상승시킬 가능성이 높습니다.',
  }
};

export const mockMarketIndicators: MarketIndicator[] = [
    { name: '다우존스', symbol: 'DIA', value: 39112.16, change: -38.62, changePercent: -0.10 },
    { name: '나스닥', symbol: 'QQQ', value: 17716.82, change: 100.5, changePercent: 0.57 },
    { name: 'S&P 500', symbol: 'SPY', value: 5447.87, change: -15.71, changePercent: -0.29 },
    { name: '환율', symbol: 'USDKRW', value: 1387.50, change: 2.30, changePercent: 0.17 }
];
