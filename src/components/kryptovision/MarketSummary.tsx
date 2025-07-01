
"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { MarketIndicator } from "@/lib/types";

interface MarketSummaryProps {
    indicators: MarketIndicator[];
}

const IndicatorCard = ({ indicator }: { indicator: MarketIndicator }) => {
    const isPositive = indicator.change >= 0;
    const valueFormatted = indicator.value.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
    const changeFormatted = (isPositive ? '+' : '') + indicator.change.toFixed(2);
    const changePercentFormatted = `(${(isPositive ? '+' : '')}${indicator.changePercent.toFixed(2)}%)`;

    return (
        <div className="flex-shrink-0 w-[220px] rounded-lg border bg-card text-card-foreground p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <p className="font-semibold text-sm text-muted-foreground">{indicator.name}</p>
                {isPositive ? <TrendingUp className="h-5 w-5 text-green-500"/> : <TrendingDown className="h-5 w-5 text-red-500"/>}
            </div>
            <div>
                <p className="text-2xl font-bold">{valueFormatted}</p>
                <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    <span>{changeFormatted}</span>
                    <span className="ml-2">{changePercentFormatted}</span>
                </div>
            </div>
        </div>
    );
};

export default function MarketSummary({ indicators }: MarketSummaryProps) {
    if (!indicators || indicators.length === 0) {
        return (
             <div className="flex w-full gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[220px] h-[110px] rounded-lg border bg-card p-4 flex flex-col justify-between">
                        <Skeleton className="h-4 w-2/3 mb-4"/>
                        <Skeleton className="h-8 w-1/2 mb-2"/>
                        <Skeleton className="h-4 w-1/3"/>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="mb-4">
             <div className="flex w-full gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {indicators.map(indicator => (
                    <IndicatorCard key={indicator.symbol} indicator={indicator} />
                ))}
            </div>
             <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
             `}</style>
        </div>
    );
}
