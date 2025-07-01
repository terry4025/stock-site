'use server';

/**
 * @fileOverview A flow to get stock data using the getGoogleFinanceDataTool.
 *
 * - getStockData - A function that handles fetching stock data.
 * - GetStockDataInput - The input type for the getStockData function.
 * - GetStockDataOutput - The return type for the getStockData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getGoogleFinanceDataTool } from '@/ai/tools/getGoogleFinanceData';
import { GetStockDataOutputSchema } from '@/ai/schemas';

const GetStockDataInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol to look up.'),
});
export type GetStockDataInput = z.infer<typeof GetStockDataInputSchema>;
export type GetStockDataOutput = z.infer<typeof GetStockDataOutputSchema>;


export async function getStockData(input: GetStockDataInput): Promise<GetStockDataOutput> {
  return getStockDataFlow(input);
}


const getStockDataFlow = ai.defineFlow(
  {
    name: 'getStockDataFlow',
    inputSchema: GetStockDataInputSchema,
    outputSchema: GetStockDataOutputSchema,
  },
  async ({ ticker }) => {
    console.log(`[Flow: getStockDataFlow] Getting data for ticker: ${ticker} via Yahoo Finance API`);

    const toolOutput = await getGoogleFinanceDataTool({ ticker });

    if (!toolOutput || !toolOutput.stockData) {
        console.error(`[Flow: getStockDataFlow] Failed to get stock data for ${ticker}.`);
        throw new Error(`Failed to retrieve data for ${ticker}.`);
    }

    return {
      stockData: toolOutput.stockData,
      chartData: toolOutput.chartData,
    };
  }
);
