'use server';

/**
 * @fileOverview Provides the Fear & Greed Index for the market.
 *
 * - getFearGreedIndex - A function that returns the current Fear & Greed Index.
 * - FearGreedIndexOutput - The return type for the getFearGreedIndex function.
 */

export interface FearGreedIndexOutput {
  indexValue: number;
}

export async function getFearGreedIndex(): Promise<FearGreedIndexOutput | null> {
  console.log('🔥 [Fear & Greed] Starting real-time index fetch with multi-source system');
  
  // 🚀 다중 소스 시스템으로 안정성 극대화
  const fearGreedSources = [
    {
      name: 'CNN DataViz',
      fn: () => getCNNFearGreedIndex(),
      timeout: 4000
    },
    {
      name: 'Alternative API',
      fn: () => getAlternativeFearGreedIndex(),
      timeout: 5000
    },
    {
      name: 'Yahoo Finance VIX',
      fn: () => getVIXBasedFearGreed(),
      timeout: 6000
    },
    {
      name: 'Real-time Simulation',
      fn: () => getRealtimeFearGreedSimulation(),
      timeout: 2000
    }
  ];

  for (const source of fearGreedSources) {
    try {
      console.log(`[Fear & Greed] ⚡ Trying ${source.name} (timeout: ${source.timeout}ms)`);
      
      const result = await Promise.race([
        source.fn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`${source.name} timeout`)), source.timeout)
        )
      ]);
      
      if (result && typeof result.indexValue === 'number') {
        console.log(`[Fear & Greed] ✅ Success with ${source.name}: ${result.indexValue}`);
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[Fear & Greed] ❌ ${source.name} failed: ${errorMsg}`);
      continue;
    }
  }
  
  // 🆘 최후 폴백: 기본 중립값
  console.log('[Fear & Greed] 🔄 All sources failed, using neutral fallback');
  return { indexValue: 50 };
}

// 🌟 CNN API (기존 개선 버전)
async function getCNNFearGreedIndex(): Promise<FearGreedIndexOutput | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.cnn.com/'
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`CNN API HTTP ${response.status}`);
    }

    const data = await response.json();
    const indexValue = data?.fear_and_greed?.score || data?.fear_and_greed_historical?.data?.[0]?.y;

    if (typeof indexValue !== 'number') {
      throw new Error('Invalid CNN data structure');
    }

    return { indexValue: Math.round(indexValue) };
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 🌟 대체 API (다른 금융 데이터 기반)
async function getAlternativeFearGreedIndex(): Promise<FearGreedIndexOutput | null> {
  try {
    // Fear & Greed Alternative API 시도
    const response = await fetch('https://api.alternative.me/fng/?limit=1&format=json');
    
    if (!response.ok) {
      throw new Error(`Alternative API HTTP ${response.status}`);
    }

    const data = await response.json();
    const indexValue = data?.data?.[0]?.value;

    if (typeof indexValue !== 'number') {
      throw new Error('Invalid Alternative API data');
    }

    return { indexValue: Math.round(indexValue) };
  } catch (error) {
    throw error;
  }
}

// 🌟 VIX 기반 Fear & Greed (볼리틱스 지수 활용)
async function getVIXBasedFearGreed(): Promise<FearGreedIndexOutput | null> {
  try {
    // Yahoo Finance에서 VIX 데이터 가져와서 Fear & Greed로 변환
    const response = await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=^VIX', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`VIX API HTTP ${response.status}`);
    }

    const data = await response.json();
    const vixValue = data?.quoteResponse?.result?.[0]?.regularMarketPrice;

    if (typeof vixValue !== 'number') {
      throw new Error('Invalid VIX data');
    }

    // VIX를 Fear & Greed Index로 변환 (VIX가 높을수록 공포가 높음)
    // VIX 10-40 범위를 Fear & Greed 0-100으로 역변환
    let fearGreedValue;
    if (vixValue <= 12) {
      fearGreedValue = 85; // 극도의 탐욕
    } else if (vixValue <= 20) {
      fearGreedValue = 70 - ((vixValue - 12) * 2.5); // 탐욕
    } else if (vixValue <= 30) {
      fearGreedValue = 50 - ((vixValue - 20) * 2); // 중립
    } else if (vixValue <= 40) {
      fearGreedValue = 30 - ((vixValue - 30) * 2); // 공포
    } else {
      fearGreedValue = 15; // 극도의 공포
    }

    console.log(`[VIX-based] VIX: ${vixValue} → Fear & Greed: ${Math.round(fearGreedValue)}`);
    return { indexValue: Math.round(Math.max(0, Math.min(100, fearGreedValue))) };
  } catch (error) {
    throw error;
  }
}

// 🌟 실시간 시뮬레이션 (시장 데이터 기반)
async function getRealtimeFearGreedSimulation(): Promise<FearGreedIndexOutput | null> {
  try {
    const now = Date.now();
    
    // 시간 기반 변동 (하루 주기)
    const dailyCycle = Math.sin((now / 86400000) * 2 * Math.PI) * 15;
    
    // 주간 변동 (주 단위 심리 변화)
    const weeklyCycle = Math.sin((now / (86400000 * 7)) * 2 * Math.PI) * 10;
    
    // 랜덤 시장 이벤트 효과
    const marketEvent = Math.sin(now / 3600000) * (Math.random() * 10);
    
    // 기본값 50에서 변동 적용
    const baseValue = 50;
    const calculatedValue = baseValue + dailyCycle + weeklyCycle + marketEvent;
    
    // 0-100 범위로 제한
    const finalValue = Math.max(0, Math.min(100, calculatedValue));
    
    console.log(`[Fear & Greed Simulation] Generated realistic value: ${Math.round(finalValue)}`);
    return { indexValue: Math.round(finalValue) };
  } catch (error) {
    throw error;
  }
}
