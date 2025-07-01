"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";

interface FearGreedIndexProps {
  value: number | null;
  loading: boolean;
}

export default function FearGreedIndex({ value, loading }: FearGreedIndexProps) {
  const { t } = useLanguage();

  const getLabel = (val: number) => {
    if (val < 25) return t('extreme_fear');
    if (val < 45) return t('fear');
    if (val <= 55) return t('neutral');
    if (val <= 75) return t('greed');
    return t('extreme_greed');
  };

  if (loading || value === null) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const percentage = value / 100;
  const angle = percentage * 180;
  const color = `hsl(${120 * (1 - percentage)}, 80%, 50%)`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('fear_greed_index_title')}</CardTitle>
        <CardDescription>{t('fear_greed_index_subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[250px]" style={{ aspectRatio: '2 / 1' }}>
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff4500" />
                <stop offset="25%" stopColor="#ff8c00" />
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="75%" stopColor="#9acd32" />
                <stop offset="100%" stopColor="#32cd32" />
              </linearGradient>
            </defs>
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              stroke="url(#gauge-gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            <g transform={`rotate(${angle} 100 100)`}>
              <path d="M 100 100 L 100 20" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="100" r="5" fill="hsl(var(--foreground))" />
            </g>
          </svg>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <span className="text-4xl font-bold font-headline" style={{color}}>{value}</span>
            <p className="text-lg font-semibold" style={{color}}>{getLabel(value)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
