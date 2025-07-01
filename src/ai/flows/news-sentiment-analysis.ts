'use server';

/**
 * @fileOverview Analyzes the sentiment of news articles related to a specific stock.
 *
 * - analyzeNewsSentiment - A function that analyzes the sentiment of news articles.
 * - AnalyzeNewsSentimentInput - The input type for the analyzeNewsSentiment function.
 * - AnalyzeNewsSentimentOutput - The return type for the analyzeNewsSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeNewsSentimentOutputSchema } from '@/ai/schemas';

const AnalyzeNewsSentimentInputSchema = z.object({
  articleTitles: z
    .array(z.string())
    .describe('An array of titles from recent news articles related to a specific stock.'),
  language: z.string().describe('The language for the sentiment analysis, e.g., "en" or "kr".'),
});
export type AnalyzeNewsSentimentInput = z.infer<typeof AnalyzeNewsSentimentInputSchema>;

export type AnalyzeNewsSentimentOutput = z.infer<typeof AnalyzeNewsSentimentOutputSchema>;

export async function analyzeNewsSentiment(input: AnalyzeNewsSentimentInput): Promise<AnalyzeNewsSentimentOutput> {
  return analyzeNewsSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeNewsSentimentPrompt',
  system: `You are an expert financial sentiment analyst. Your task is to analyze the sentiment of the provided news article titles and provide your reasoning in the specified language.
Your response MUST be a single, valid JSON object and NOTHING ELSE.
Do NOT include any explanatory text, markdown formatting like \`\`\`json, or any other characters before or after the JSON object.
Your entire response must start with '{' and end with '}'.
If the list of titles is empty or contains no meaningful information, you MUST return a 'neutral' sentiment with a low confidence score (e.g., 0.1) and appropriate reasoning.`,
  input: {schema: AnalyzeNewsSentimentInputSchema},
  output: {schema: AnalyzeNewsSentimentOutputSchema},
  prompt: `Language for reasoning: {{{language}}}

Article Titles:
{{#each articleTitles}}
- {{{this}}}
{{/each}}
`,
});

const analyzeNewsSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeNewsSentimentFlow',
    inputSchema: AnalyzeNewsSentimentInputSchema,
    outputSchema: AnalyzeNewsSentimentOutputSchema,
  },
  async input => {
    console.log('analyzeNewsSentimentFlow에 전달된 입력값:', JSON.stringify(input, null, 2));

    try {
      const response = await prompt(input);
      const output = response.output;

      console.log("AI의 원본 응답 텍스트:", response.text);

      if (!output) {
        console.error("AI가 유효한 JSON을 반환하지 않았습니다. Input was:", input);
        throw new Error("AI가 유효한 JSON을 반환하지 않았습니다. 원본 응답을 확인하세요.");
      }
      
      console.log("성공적으로 파싱된 AI 결과:", output);
      return output;

    } catch (error) {
      console.error("analyzeNewsSentimentFlow 실행 중 심각한 에러 발생:", error);
      throw error;
    }
  }
);
