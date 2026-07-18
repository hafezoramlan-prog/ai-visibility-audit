import { NextRequest, NextResponse } from 'next/server';
import { generateQueries } from '../../../lib/queryGenerator';
import { queryOpenAI } from '../../../lib/providers/openai';
import { queryPerplexity } from '../../../lib/providers/perplexity';
import { scanAEO } from '../../../lib/scanner';
import { computeBrandStats, computeOverallScore, buildRecommendations } from '../../../lib/scoring';
import type { AnalyzeRequest, AnalyzeResponse, ProviderResult } from '../../../lib/types';

export async function POST(req: NextRequest) {
  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { brand, competitors, category, useCase, url, openaiKey, perplexityKey } = body;

  if (!brand || !category || !useCase || !openaiKey) {
    return NextResponse.json(
      { error: 'brand, category, useCase, and openaiKey are required' },
      { status: 400 },
    );
  }

  const allBrands = [brand, ...(competitors || [])].filter(Boolean);
  const queries = generateQueries(category, useCase);

  const providerResults: ProviderResult[] = [];
  const errors: string[] = [];

  for (const query of queries) {
    try {
      const openaiResult = await queryOpenAI(openaiKey, query, allBrands);
      providerResults.push(openaiResult);
    } catch (err) {
      errors.push(`OpenAI query failed for "${query}": ${(err as Error).message}`);
    }

    if (perplexityKey) {
      try {
        const perplexityResult = await queryPerplexity(perplexityKey, query, allBrands);
        providerResults.push(perplexityResult);
      } catch (err) {
        errors.push(`Perplexity query failed for "${query}": ${(err as Error).message}`);
      }
    }
  }

  const brandStatsAll = computeBrandStats(providerResults, allBrands);
  const brandStats = brandStatsAll.find((s) => s.brand === brand)!;
  const competitorStats = brandStatsAll.filter((s) => s.brand !== brand);

  let aeoScan = null;
  if (url) {
    try {
      aeoScan = await scanAEO(url);
    } catch (err) {
      errors.push(`AEO scan failed: ${(err as Error).message}`);
    }
  }

  const overallScore = computeOverallScore(brandStats, aeoScan);
  const recommendations = buildRecommendations(brandStats, competitorStats, aeoScan);

  const response: AnalyzeResponse & { errors?: string[] } = {
    queries,
    providerResults,
    brandStats: brandStatsAll,
    aeoScan,
    overallScore,
    recommendations,
    ...(errors.length > 0 ? { errors } : {}),
  };

  return NextResponse.json(response);
}
