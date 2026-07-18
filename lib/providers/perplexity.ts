import type { ProviderResult } from '../types';
import { buildResult, extractUrls } from './shared';

/**
 * Perplexity's API is OpenAI-schema-compatible but also returns a
 * top-level `citations` array of source URLs, separate from whatever
 * URLs happen to appear inline in the text. We merge both.
 */
export async function queryPerplexity(
  apiKey: string,
  query: string,
  allBrands: string[],
): Promise<ProviderResult> {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: query }],
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  const apiCitations: string[] = Array.isArray(data?.citations) ? data.citations : [];

  const base = buildResult('perplexity', query, text, allBrands);
  const mergedUrls = Array.from(new Set([...base.citedUrls, ...apiCitations, ...extractUrls(text)]));

  return { ...base, citedUrls: mergedUrls };
}
