import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 💡 등락률 계산 유틸리티 함수들
interface PriceChangeData {
  currentPrice: number;
  previousClose: number;
  changeValue?: number;
  changePercentage?: number;
}

/**
 * 정확한 등락률을 계산하는 함수
 * @param data - 가격 데이터
 * @returns 검증된 등락률 데이터
 */
export function calculateDailyChange(data: PriceChangeData) {
  const { currentPrice, previousClose, changeValue: providedChangeValue, changePercentage: providedChangePercentage } = data;
  
  // 기본 검증
  if (!isFinite(currentPrice) || !isFinite(previousClose) || currentPrice <= 0 || previousClose <= 0) {
    console.warn('Invalid price data for change calculation:', data);
    return { value: 0, percentage: 0 };
  }
  
  // 변동가 계산
  let changeValue = providedChangeValue;
  if (changeValue === undefined || !isFinite(changeValue)) {
    changeValue = currentPrice - previousClose;
  }
  
  // 등락률 계산 (기본 공식: (현재가 - 전일종가) / 전일종가 * 100)
  let changePercentage = providedChangePercentage;
  if (changePercentage === undefined || !isFinite(changePercentage)) {
    changePercentage = (changeValue / previousClose) * 100;
  }
  
  // 데이터 일관성 검증
  const calculatedValue = currentPrice - previousClose;
  const calculatedPercentage = (calculatedValue / previousClose) * 100;
  
  // API 제공값과 계산값의 차이가 큰 경우 계산값 사용
  if (Math.abs(changeValue - calculatedValue) > 0.01) {
    console.warn(`Change value inconsistency: API=${changeValue}, Calculated=${calculatedValue}, using calculated`);
    changeValue = calculatedValue;
  }
  
  if (Math.abs(changePercentage - calculatedPercentage) > 0.01) {
    console.warn(`Change percentage inconsistency: API=${changePercentage}%, Calculated=${calculatedPercentage}%, using calculated`);
    changePercentage = calculatedPercentage;
  }
  
  // 극단값 검증 (일반적으로 하루에 ±20% 이상 변동은 비정상적)
  if (Math.abs(changePercentage) > 20) {
    console.warn(`🚨 Extreme change percentage detected: ${changePercentage}% for currentPrice=${currentPrice}, previousClose=${previousClose}`);
    // 추가 검증: 가격이 정말 이상한지 확인
    if (Math.abs(changePercentage) > 100) {
      console.error(`🚨 CRITICAL: Change percentage over 100%: ${changePercentage}%, data corruption suspected`);
      return { value: 0, percentage: 0 };
    }
    // 20~100% 범위는 경고만 출력하고 계산값을 다시 확인
    const recalculatedPercentage = (calculatedValue / previousClose) * 100;
    console.warn(`🔍 Recalculating: ${recalculatedPercentage}%`);
    if (Math.abs(recalculatedPercentage) > 20) {
      console.error(`🚨 Even recalculated value is extreme: ${recalculatedPercentage}%, capping at ±20%`);
      const cappedPercentage = Math.sign(recalculatedPercentage) * 20;
      const cappedValue = (cappedPercentage / 100) * previousClose;
      return { 
        value: Number(cappedValue.toFixed(4)), 
        percentage: Number(cappedPercentage.toFixed(4)) 
      };
    }
  }
  
  // 최종 검증: NaN, Infinity 차단
  if (!isFinite(changeValue) || !isFinite(changePercentage)) {
    console.error('NaN/Infinity detected in change calculation, resetting to 0');
    return { value: 0, percentage: 0 };
  }
  
  return {
    value: Number(changeValue.toFixed(4)),
    percentage: Number(changePercentage.toFixed(4))
  };
}

/**
 * 가격 데이터 검증 함수
 */
export function validatePriceData(price: number, fallbackPrice?: number): number {
  if (isFinite(price) && price > 0) {
    return price;
  }
  
  if (fallbackPrice && isFinite(fallbackPrice) && fallbackPrice > 0) {
    console.warn(`Invalid price ${price}, using fallback ${fallbackPrice}`);
    return fallbackPrice;
  }
  
  console.error(`Invalid price data: ${price}, no valid fallback available`);
  return 0;
}
