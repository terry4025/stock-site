'use server';

/**
 * @fileOverview Translates and summarizes a news article.
 *
 * - summarizeAndTranslateNews - A function that handles the news summarization and translation.
 * - SummarizeAndTranslateNewsInput - The input type for the function.
 * - SummarizeAndTranslateNewsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAndTranslateNewsInputSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  content: z.string().describe('The content of the news article, which may include HTML.'),
  language: z.string().describe('The target language for the summary, e.g., "en" or "kr".'),
});
export type SummarizeAndTranslateNewsInput = z.infer<typeof SummarizeAndTranslateNewsInputSchema>;

const SummarizeAndTranslateNewsOutputSchema = z.object({
  translatedTitle: z.string().describe('The translated title of the news article.'),
  summary: z.string().describe('The translated summary of the news article.'),
});
export type SummarizeAndTranslateNewsOutput = z.infer<typeof SummarizeAndTranslateNewsOutputSchema>;

export async function summarizeAndTranslateNews(input: SummarizeAndTranslateNewsInput): Promise<SummarizeAndTranslateNewsOutput> {
  return summarizeAndTranslateNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAndTranslateNewsPrompt',
  system: `You are a financial news analyst. Your task is to perform two tasks in the specified language:
1. Translate the news article title.
2. Summarize the provided news article content.

The content may be in HTML format; you must extract the relevant text before summarizing.
If the provided content is too short or lacks meaningful information to summarize (e.g., just a title or a link), your summary must be a message indicating that a summary could not be generated, translated into the target language. For example, in English: "A summary could not be generated from the provided content." or in Korean: "제공된 내용으로는 요약을 생성할 수 없습니다.".

The final output must be a JSON object conforming to the output schema, containing the translated title and the translated summary.`,
  input: {schema: SummarizeAndTranslateNewsInputSchema},
  output: {schema: SummarizeAndTranslateNewsOutputSchema},
  prompt: `Language: {{{language}}}

Article Title:
{{{title}}}

Article Content:
{{{content}}}`,
});

const summarizeAndTranslateNewsFlow = ai.defineFlow(
  {
    name: 'summarizeAndTranslateNewsFlow',
    inputSchema: SummarizeAndTranslateNewsInputSchema,
    outputSchema: SummarizeAndTranslateNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
