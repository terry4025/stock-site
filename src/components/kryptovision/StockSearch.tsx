"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { mockAutocomplete } from "@/lib/mock-data";

interface StockSearchProps {
  onSelectTicker: (ticker: string) => void;
  currentTicker: string;
}

export default function StockSearch({ onSelectTicker, currentTicker }: StockSearchProps) {
  const [query, setQuery] = useState(currentTicker);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  // 🔥 인기 종목 추천 (글로벌 + 한국)
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: '005930.KS', name: '삼성전자 (Samsung Electronics)' },
    { symbol: '000660.KS', name: 'SK하이닉스 (SK Hynix)' },
    { symbol: 'META', name: 'Meta Platforms' },
    { symbol: 'AMZN', name: 'Amazon.com' },
    { symbol: '035420.KS', name: '네이버 (NAVER)' },
    { symbol: 'INTC', name: 'Intel Corporation' }
  ];

  const fetchSuggestions = useCallback((searchQuery: string) => {
    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      
      // 🔍 개선된 검색 알고리즘
      const filtered = mockAutocomplete.filter(stock => {
        const symbol = stock.symbol.toLowerCase();
        const name = stock.name.toLowerCase();
        
        // 1순위: 심볼이 정확히 일치하는 경우
        if (symbol === query) return true;
        
        // 2순위: 심볼이 시작하는 경우
        if (symbol.startsWith(query)) return true;
        
        // 3순위: 회사명이 정확한 단어로 시작하는 경우
        const nameWords = name.split(' ');
        if (nameWords.some(word => word.startsWith(query))) return true;
        
        // 3.5순위: 한국어 검색 지원 (괄호 안의 한국어 이름도 검색)
        const koreanMatch = name.match(/\((.*?)\)/);
        if (koreanMatch) {
          const koreanName = koreanMatch[1].toLowerCase();
          if (koreanName.includes(query) || koreanName.startsWith(query)) return true;
        }
        
        // 4순위: 심볼에 포함되는 경우
        if (symbol.includes(query)) return true;
        
        // 5순위: 회사명에 포함되는 경우
        if (name.includes(query)) return true;
        
        return false;
      });
      
      // 🎯 우선순위별 정렬
      const sorted = filtered.sort((a, b) => {
        const aSymbol = a.symbol.toLowerCase();
        const bSymbol = b.symbol.toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // 정확한 심볼 매치가 최우선
        if (aSymbol === query && bSymbol !== query) return -1;
        if (bSymbol === query && aSymbol !== query) return 1;
        
        // 심볼 시작 매치
        if (aSymbol.startsWith(query) && !bSymbol.startsWith(query)) return -1;
        if (bSymbol.startsWith(query) && !aSymbol.startsWith(query)) return 1;
        
        // 알파벳 순서
        return aSymbol.localeCompare(bSymbol);
      });
      
      setSuggestions(sorted.slice(0, 8)); // 더 많은 결과 표시
    } else {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(query);
    }, 150); // 🚀 더 빠른 반응속도 (300ms → 150ms)

    return () => clearTimeout(handler);
  }, [query, fetchSuggestions]);
  
  useEffect(() => {
    setQuery(currentTicker);
  }, [currentTicker]);

  const handleSelect = (stock: { symbol: string; name: string }) => {
    setQuery(stock.symbol);
    onSelectTicker(stock.symbol);
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleEnter = () => {
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else {
      const exactMatch = mockAutocomplete.find(s => s.symbol.toUpperCase() === query.toUpperCase());
      if (exactMatch) {
        handleSelect(exactMatch);
      } else {
        onSelectTicker(query);
        setSuggestions([]);
        setIsFocused(false);
      }
    }
  };

  return (
    <div className="relative w-full md:w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="주식 검색 (예: AMD, TSLA, 삼성전자)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 text-lg text-white bg-gray-800 border-gray-600 placeholder:text-gray-400 focus:border-blue-500 transition-colors"
          onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  handleEnter();
              }
          }}
        />
      </div>
      {isFocused && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {suggestions.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-600 bg-gray-700">
                검색 결과
              </div>
              <ul>
                {suggestions.map((stock) => (
                  <li
                    key={stock.symbol}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-700 text-white border-b border-gray-700 last:border-b-0 transition-colors"
                    onMouseDown={() => handleSelect(stock)}
                  >
                    <div className="font-bold text-white text-sm">{stock.symbol}</div>
                    <div className="text-xs text-gray-300 mt-1">{stock.name}</div>
                  </li>
                ))}
              </ul>
            </>
          ) : query.length === 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-600 bg-gray-700">
                🔥 인기 종목
              </div>
              <ul>
                {popularStocks.map((stock) => (
                  <li
                    key={stock.symbol}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-700 text-white border-b border-gray-700 last:border-b-0 transition-colors"
                    onMouseDown={() => handleSelect(stock)}
                  >
                    <div className="font-bold text-white text-sm">{stock.symbol}</div>
                    <div className="text-xs text-gray-300 mt-1">{stock.name}</div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="px-4 py-4 text-center text-gray-400">
              <div className="text-sm">'{query}' 검색 결과가 없습니다</div>
              <div className="text-xs mt-2">직접 입력하려면 Enter를 누르세요</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
