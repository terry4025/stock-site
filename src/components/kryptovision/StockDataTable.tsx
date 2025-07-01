"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { StockData } from "@/lib/types";

interface StockDataTableProps {
  data: StockData;
}

export default function StockDataTable({ data }: StockDataTableProps) {
  const { t } = useLanguage();
  if (!data) return null;

  const dailyChangePositive = data.dailyChange.value >= 0;

  const formatNumber = (num: number | null | undefined, options?: Intl.NumberFormatOptions) => {
    if (num === null || num === undefined || num === 0) return "N/A";
    return num.toLocaleString(undefined, options);
  }

  const metrics = [
    { label: t('market_cap'), value: data.marketCap },
    { label: t('pe_ratio'), value: formatNumber(data.peRatio, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: t('52_week_high'), value: formatNumber(data.fiftyTwoWeekHigh, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: t('52_week_low'), value: formatNumber(data.fiftyTwoWeekLow, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: t('dividend_yield'), value: data.dividendYield ? `${data.dividendYield.toFixed(2)}%` : "N/A" },
    { label: t('beta'), value: formatNumber(data.beta, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl text-white">{data.name} ({data.ticker})</CardTitle>
                <CardDescription>{data.exchange}</CardDescription>
            </div>
            <div className="text-right pt-4 md:pt-0">
                <p className="text-3xl font-bold font-headline text-white">{data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="flex items-center justify-end gap-2">
                    {dailyChangePositive ? <TrendingUp className="h-4 w-4 text-green-500"/> : <TrendingDown className="h-4 w-4 text-red-500"/>}
                    <span className={`font-semibold ${dailyChangePositive ? "text-green-500" : "text-red-500"}`}>
                        {dailyChangePositive ? '+' : ''}{data.dailyChange.value.toFixed(2)} ({dailyChangePositive ? '+' : ''}{data.dailyChange.percentage.toFixed(2)}%)
                    </span>
                    <Badge variant="secondary">{t('volume')}: {data.volume}</Badge>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              {metrics.slice(0, 3).map(metric => (
                <TableCell key={metric.label}>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="font-medium text-white">{metric.value}</div>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
               {metrics.slice(3, 6).map(metric => (
                <TableCell key={metric.label}>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="font-medium text-white">{metric.value}</div>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
