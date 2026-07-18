import type { ProviderResult } from '../types';

/**
 * Case-insensitive whole-word-ish match. Good enough for brand names;
 * flagged in the README as a known limitation (won't catch heavy
 * misspellings or stylized casing like "iPhone" vs "Iphone").
 */
export function findMentionedBrands(text: string, brands: string[]): string[] {
  const lower = text.toLowerCase();
  return brands.filter((b) => lower.includes(b.toLowerCase()));
}

export function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)"'\]]+/g) || [];
  // de-dupe
  return Array.from(new Set(matches));
}

export function buildResult(
  provider: ProviderResult['provider'],
  query: string,
  responseText: string,
  allBrands: string[],
): ProviderResult {
  return {
    provider,
    query,
    responseText,
    mentionedBrands: findMentionedBrands(responseText, allBrands),
    citedUrls: extractUrls(responseText),
  };
}
