import { z } from 'genkit';

export const AnalyzeNewsSentimentOutputSchema = z.object({
  sentiment: z
    .enum(['positive', 'negative', 'neutral'])
    .describe('The overall sentiment of the news articles.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('A score between 0 and 1 indicating the confidence in the sentiment analysis.'),
  reasoning: z.string().describe('The reasoning behind the sentiment analysis.'),
});

// New Schemas for Stock Data
export const StockDataSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  exchange: z.string(),
  currentPrice: z.number(),
  dailyChange: z.object({
    value: z.number(),
    percentage: z.number(),
  }),
  volume: z.string(),
  marketCap: z.string(),
  peRatio: z.number().nullable(),
  fiftyTwoWeekHigh: z.number(),
  fiftyTwoWeekLow: z.number(),
  dividendYield: z.number().nullable(),
  beta: z.number().nullable(),
});

export const ChartDataPointSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  range: z.tuple([z.number(), z.number()]),
  volume: z.number(),
});

export const GetStockDataOutputSchema = z.object({
    stockData: StockDataSchema.nullable(),
    chartData: z.array(ChartDataPointSchema),
});
