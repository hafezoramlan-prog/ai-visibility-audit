import OpenAI from 'openai';
import type { ProviderResult } from '../types';
import { buildResult } from './shared';

export async function queryOpenAI(
  apiKey: string,
  query: string,
  allBrands: string[],
): Promise<ProviderResult> {
  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: query }],
    max_tokens: 500,
  });

  const text = completion.choices[0]?.message?.content ?? '';
  return buildResult('openai', query, text, allBrands);
}
