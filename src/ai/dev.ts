import { config } from 'dotenv';
config();

import '@/ai/flows/stock-analysis-summary.ts';
import '@/ai/flows/news-sentiment-analysis.ts';
import '@/ai/flows/fear-greed-index.ts';
import '@/ai/flows/summarize-news.ts';
import '@/ai/flows/getStockDataFlow.ts';
