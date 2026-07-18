import type { AEOScanResult, BrandMentionStats, ProviderResult } from './types';

/**
 * Computes per-brand mention/citation stats across all provider results.
 * "Position" is approximated by where the brand name first appears in the
 * response text relative to other mentioned brands in that same response -
 * a proxy for prominence, not a guarantee of the model's actual ranking.
 */
export function computeBrandStats(
  results: ProviderResult[],
  brands: string[],
): BrandMentionStats[] {
  return brands.map((brand) => {
    let mentionCount = 0;
    let citedCount = 0;
    const positions: number[] = [];

    results.forEach((r) => {
      const mentioned = r.mentionedBrands.includes(brand);
      if (mentioned) {
        mentionCount += 1;

        // rank among mentioned brands in this response, by index of first occurrence
        const withIndex = r.mentionedBrands
          .map((b) => ({ b, idx: r.responseText.toLowerCase().indexOf(b.toLowerCase()) }))
          .filter((x) => x.idx !== -1)
          .sort((a, b2) => a.idx - b2.idx);
        const rank = withIndex.findIndex((x) => x.b === brand);
        if (rank !== -1) positions.push(rank + 1);
      }

      const citedThisBrand = r.citedUrls.some((u) => u.toLowerCase().includes(brand.toLowerCase().replace(/\s+/g, '')));
      if (citedThisBrand) citedCount += 1;
    });

    const total = results.length || 1;

    return {
      brand,
      mentionRate: mentionCount / total,
      citedRate: citedCount / total,
      avgPosition: positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : null,
    };
  });
}

/**
 * Weighted score for the primary brand: 60% mention rate, 20% citation rate,
 * 20% on-page AEO readiness. Weights are a starting point, not a researched
 * formula - documented in the README as tunable.
 */
export function computeOverallScore(
  brandStats: BrandMentionStats,
  aeoScan: AEOScanResult | null,
): number {
  const mentionScore = brandStats.mentionRate * 100;
  const citationScore = brandStats.citedRate * 100;
  const aeoScore = aeoScan?.score ?? 0;

  const weighted = mentionScore * 0.6 + citationScore * 0.2 + aeoScore * 0.2;
  return Math.round(weighted);
}

export function buildRecommendations(
  brandStats: BrandMentionStats,
  competitorStats: BrandMentionStats[],
  aeoScan: AEOScanResult | null,
): string[] {
  const recs: string[] = [];

  if (brandStats.mentionRate < 0.5) {
    recs.push(
      'Mention rate is below 50% across test queries. Publish comparison and "best X for Y" content targeting the exact phrasing buyers use in AI prompts.',
    );
  }

  const topCompetitor = [...competitorStats].sort((a, b) => b.mentionRate - a.mentionRate)[0];
  if (topCompetitor && topCompetitor.mentionRate > brandStats.mentionRate) {
    recs.push(
      `${topCompetitor.brand} is mentioned more often than you across these queries. Review what content of theirs is likely being cited and identify the gap.`,
    );
  }

  if (brandStats.citedRate < 0.3) {
    recs.push(
      'Low citation rate suggests answer engines are not pulling from your site directly. Add clearly structured, citable content (FAQs, definitions, data points) that is easy to extract.',
    );
  }

  if (aeoScan) {
    aeoScan.checks
      .filter((c) => !c.passed)
      .forEach((c) => {
        recs.push(`On-page gap: ${c.label}. ${c.detail}`);
      });
  }

  if (recs.length === 0) {
    recs.push('Visibility looks strong across tested queries. Focus on maintaining content freshness and monitoring new competitor entries.');
  }

  return recs;
}
