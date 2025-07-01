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

  const fetchSuggestions = useCallback((searchQuery: string) => {
    if (searchQuery.length > 0) {
      const filtered = mockAutocomplete.filter(stock =>
        stock.symbol.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // debounce time

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
          placeholder="Search for a stock (e.g., AAPL)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 text-lg text-white bg-gray-800 border-gray-600 placeholder:text-gray-400"
          onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  handleEnter();
              }
          }}
        />
      </div>
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg">
          {suggestions.map((stock) => (
            <li
              key={stock.symbol}
              className="px-4 py-2 cursor-pointer hover:bg-gray-700 text-white"
              onMouseDown={() => handleSelect(stock)}
            >
              <div className="font-bold text-white">{stock.symbol}</div>
              <div className="text-sm text-gray-300">{stock.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
