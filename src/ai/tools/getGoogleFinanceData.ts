'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockChartData, mockStockData } from '@/lib/mock-data';
import type { StockData, ChartDataPoint } from '@/lib/types';
import { GetStockDataOutputSchema } from '@/ai/schemas';

const GetYahooFinanceDataInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol, e.g., AAPL, 005930.KS.'),
});

// Helper to format large numbers into T, B, M
function formatMarketCap(value: number | undefined | null): string {
    if (!value) return "N/A";
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toString();
}

export const getGoogleFinanceDataTool = ai.defineTool(
  {
    name: 'getYahooFinanceData',
    description: 'Fetches real-time stock and chart data for a given stock ticker using public Yahoo Finance API endpoints.',
    inputSchema: GetYahooFinanceDataInputSchema,
    outputSchema: GetStockDataOutputSchema,
  },
  async ({ ticker }) => {
    console.log(`[Tool: getYahooFinanceData] Calling Yahoo Finance API for ticker: ${ticker}`);

    try {
        // Use Promise.all to fetch chart and quote data concurrently
        const [chartResponse, quoteResponse] = await Promise.all([
            fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?region=US&lang=en-US&interval=1d&range=1y`),
            fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`)
        ]);

        if (!chartResponse.ok) {
            throw new Error(`Yahoo Finance Chart API request failed with status: ${chartResponse.status}`);
        }
        if (!quoteResponse.ok) {
            throw new Error(`Yahoo Finance Quote API request failed with status: ${quoteResponse.status}`);
        }

        const chartJson = await chartResponse.json();
        const quoteJson = await quoteResponse.json();

        const chartResult = chartJson?.chart?.result?.[0];
        const quoteResult = quoteJson?.quoteResponse?.result?.[0];

        if (!chartResult || !quoteResult) {
            throw new Error(`No data returned from Yahoo Finance for ticker ${ticker}`);
        }
        
        const { timestamp, indicators } = chartResult;
        const prices = indicators?.quote?.[0];

        if (!timestamp || !prices) {
             throw new Error('Invalid chart data structure from Yahoo Finance API.');
        }

        const stockData: StockData = {
            ticker: quoteResult.symbol,
            name: quoteResult.longName || quoteResult.shortName || ticker,
            exchange: quoteResult.fullExchangeName || 'N/A',
            currentPrice: quoteResult.regularMarketPrice || 0,
            dailyChange: {
                value: quoteResult.regularMarketChange || 0,
                percentage: quoteResult.regularMarketChangePercent || 0,
            },
            volume: quoteResult.regularMarketVolume?.toLocaleString() || 'N/A',
            marketCap: formatMarketCap(quoteResult.marketCap),
            peRatio: quoteResult.trailingPE || null,
            fiftyTwoWeekHigh: quoteResult.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: quoteResult.fiftyTwoWeekLow || 0,
            dividendYield: quoteResult.trailingAnnualDividendYield ? quoteResult.trailingAnnualDividendYield * 100 : null,
            beta: quoteResult.beta || null,
        };
        
        const chartData: ChartDataPoint[] = timestamp.map((ts: number, i: number) => ({
            date: new Date(ts * 1000).toISOString().split('T')[0],
            open: prices.open[i],
            high: prices.high[i],
            low: prices.low[i],
            close: prices.close[i],
            range: [prices.low[i], prices.high[i]] as [number, number],
            volume: prices.volume[i],
        })).filter((d: any) => d.open !== null && d.high !== null && d.low !== null && d.close !== null);

        // Make sure we have chart data, otherwise it can break the chart component
        if(chartData.length === 0){
             throw new Error('No valid chart data points found.');
        }

        return { stockData, chartData };

    } catch (error) {
        console.error(`[Tool: getYahooFinanceData] Critical error fetching from Yahoo Finance for ${ticker}:`, error);
        // Fallback to mock data on any error
        const fallbackTicker = ticker.toUpperCase();
        return {
            stockData: mockStockData[fallbackTicker] || mockStockData['AAPL'],
            chartData: mockChartData[fallbackTicker] || mockChartData['AAPL'],
        };
    }
  },
);
