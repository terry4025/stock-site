// Stock analysis summary flow providing technical, fundamental, and sentiment analysis for a given stock.

'use server';

/**
 * @fileOverview An AI agent that provides a summary of stock analysis, including technical, fundamental, and sentiment analysis.
 *
 * - stockAnalysisSummary - A function that generates a stock analysis summary.
 * - StockAnalysisSummaryInput - The input type for the stockAnalysisSummary function.
 * - StockAnalysisSummaryOutput - The return type for the stockAnalysisSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeNewsSentimentOutputSchema } from '@/ai/schemas';

// Schema for basic stock data (current price, market cap, etc.)
const StockDataSchema = z.object({
  name: z.string().describe("Company name"),
  ticker: z.string().describe("Stock ticker symbol"),
  currentPrice: z.number().describe("Current stock price"),
  marketCap: z.string().describe("Market capitalization"),
  peRatio: z.number().nullable().describe("Price-to-Earnings ratio"),
  fiftyTwoWeekHigh: z.number().describe("52-week high price"),
  fiftyTwoWeekLow: z.number().describe("52-week low price"),
  dividendYield: z.number().nullable().describe("Dividend yield percentage"),
});

// Schema for a single point in the historical chart data
const ChartDataPointSchema = z.object({
  date: z.string().describe("Date for the data point"),
  open: z.number().describe("Opening price"),
  high: z.number().describe("Highest price"),
  low: z.number().describe("Lowest price"),
  close: z.number().describe("Closing price"),
  volume: z.number().describe("Trading volume"),
});

const StockAnalysisSummaryInputSchema = z.object({
  language: z.string().describe('The language for the analysis summary, e.g., "en" or "kr".'),
  stockData: StockDataSchema.describe("Fundamental and current data for the stock."),
  chartData: z.array(ChartDataPointSchema).describe("Historical price and volume data for technical analysis."),
  newsSentiment: AnalyzeNewsSentimentOutputSchema.describe("AI-powered sentiment analysis of recent news headlines."),
});
export type StockAnalysisSummaryInput = z.infer<typeof StockAnalysisSummaryInputSchema>;

const StockAnalysisSummaryOutputSchema = z.object({
  analysisSummary: z.string().describe('A concise summary of the stock analysis, including technical, fundamental, and sentiment analysis, and buy/hold/sell recommendations.'),
  recommendation: z.enum(['Buy', 'Hold', 'Sell']).describe('Your final recommendation as a single word: "Buy", "Hold", or "Sell".'),
  confidenceScore: z.number().min(0).max(1).describe('Confidence score for the recommendation (0-1).'),
});
export type StockAnalysisSummaryOutput = z.infer<typeof StockAnalysisSummaryOutputSchema>;

export async function stockAnalysisSummary(input: StockAnalysisSummaryInput): Promise<StockAnalysisSummaryOutput> {
  return stockAnalysisSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockAnalysisSummaryPrompt',
  system: `You are a professional financial analyst. Your task is to provide a comprehensive stock analysis based on the data provided. Your entire response MUST be a single, valid JSON object that conforms to the output schema. Do not include any other text, markdown, or formatting outside of the JSON object itself.
You must perform a holistic analysis for the given stock. Synthesize the provided fundamental data, technical data from the chart, and news sentiment to generate an investment recommendation.
The analysis summary MUST be in the requested language.
The recommendation MUST be one of "Buy", "Hold", or "Sell".
The confidence score must be a number between 0.0 (low) and 1.0 (high).`,
  input: {schema: StockAnalysisSummaryInputSchema},
  output: {schema: StockAnalysisSummaryOutputSchema},
  prompt: `Language for summary: {{{language}}}

**1. Fundamental Data:**
- **Company:** {{{stockData.name}}} ({{{stockData.ticker}}})
- **Current Price:** {{{stockData.currentPrice}}}
- **Market Cap:** {{{stockData.marketCap}}}
- **P/E Ratio:** {{#if stockData.peRatio}}{{{stockData.peRatio}}}{{else}}N/A{{/if}}
- **52-Week Range:** {{{stockData.fiftyTwoWeekLow}}} - {{{stockData.fiftyTwoWeekHigh}}}
- **Dividend Yield:** {{#if stockData.dividendYield}}{{{stockData.dividendYield}}}%{{else}}N/A{{/if}}

**2. Technical Analysis (from Historical Chart Data):**
The last 90 days of daily chart data are provided. Analyze this data to identify key trends, support/resistance levels, and volume patterns.
{{#each chartData}}- Date: {{date}}, Close: {{close}}, Volume: {{volume}}
{{/each}}

**3. News Sentiment Analysis:**
- **Overall Sentiment:** '{{{newsSentiment.sentiment}}}'
- **Confidence:** {{{newsSentiment.confidenceScore}}}
- **Reasoning:** "{{{newsSentiment.reasoning}}}"
`,
});

const stockAnalysisSummaryFlow = ai.defineFlow(
  {
    name: 'stockAnalysisSummaryFlow',
    inputSchema: StockAnalysisSummaryInputSchema,
    outputSchema: StockAnalysisSummaryOutputSchema,
  },
  async input => {
    // To keep the context small, let's pass only the last 90 days of chart data
    const recentChartData = input.chartData.slice(-90);
    const flowInput = { ...input, chartData: recentChartData };

    // 🎯 Gemini 2.5 Pro 모델을 명시적으로 사용
    const {output} = await prompt(flowInput, {
      model: 'googleai/gemini-2.5-pro',
      config: {
        temperature: 0.3,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1000,
      }
    });
    
    if (!output) {
      console.error("AI analysis did not return a valid output.");
      throw new Error("Failed to get a valid analysis from the AI model.");
    }
    
    return output;
  }
);
