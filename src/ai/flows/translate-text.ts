'use server';

/**
 * @fileOverview Translates an array of texts to a specified language using the DeepL API.
 *
 * - translateTexts - A function that handles text translation.
 * - TranslateTextsInput - The input type for the function.
 * - TranslateTextsOutput - The return type for the function.
 */

import * as deepl from 'deepl-node';

export interface TranslateTextsInput {
  texts: string[];
  targetLanguage: string;
}

export interface TranslateTextsOutput {
  translatedTexts: string[];
}

export async function translateTexts(input: TranslateTextsInput): Promise<TranslateTextsOutput> {
  const { texts, targetLanguage } = input;
  const authKey = process.env.DEEPL_API_KEY;

  if (!authKey) {
    console.error("DeepL API key not found. Please set DEEPL_API_KEY in your .env file. Returning original texts.");
    return { translatedTexts: texts };
  }
  
  if (!texts || texts.length === 0) {
    return { translatedTexts: [] };
  }
  
  if (targetLanguage === 'en') {
    return { translatedTexts: texts };
  }

  const languageMap: { [key: string]: deepl.TargetLanguageCode } = {
    'kr': 'ko',
    'en': 'en-US',
  };
  const deepLTargetLang = languageMap[targetLanguage];

  if (!deepLTargetLang) {
    console.warn(`Unsupported language for translation: ${targetLanguage}. Returning original texts.`);
    return { translatedTexts: texts };
  }

  try {
    const translator = new deepl.Translator(authKey);
    const results = await translator.translateText(texts, 'en', deepLTargetLang);
    const translatedTexts = results.map(result => result.text);
    return { translatedTexts };
  } catch (error) {
    console.error("Error translating texts with DeepL:", error);
    // In case of an error, return the original texts to avoid breaking the UI
    return { translatedTexts: texts };
  }
}
