import * as cheerio from 'cheerio';
import type { AEOCheck, AEOScanResult } from './types';

/**
 * Fetches a brand's homepage and checks a handful of on-page signals
 * that make content easier for LLMs / answer engines to parse and cite.
 * This is intentionally simple - a signal check, not a full SEO crawler.
 */
export async function scanAEO(url: string): Promise<AEOScanResult> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  const res = await fetch(normalizedUrl, {
    headers: { 'User-Agent': 'ai-visibility-audit/0.1 (portfolio project)' },
  });

  if (!res.ok) {
    throw new Error(`Could not fetch ${normalizedUrl}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const checks: AEOCheck[] = [];

  // 1. Structured data (schema.org JSON-LD)
  const jsonLdBlocks = $('script[type="application/ld+json"]');
  const schemaTypes: string[] = [];
  jsonLdBlocks.each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach((item) => {
        if (item && typeof item === 'object' && '@type' in item) {
          schemaTypes.push(String(item['@type']));
        }
      });
    } catch {
      // malformed JSON-LD, ignore
    }
  });
  checks.push({
    label: 'Structured data (schema.org)',
    passed: schemaTypes.length > 0,
    detail: schemaTypes.length > 0 ? `Found: ${schemaTypes.join(', ')}` : 'No JSON-LD structured data found',
  });

  // 2. FAQ-style content
  const hasFAQSchema = schemaTypes.some((t) => t.toLowerCase().includes('faq'));
  const bodyText = $('body').text().toLowerCase();
  const hasFAQHeading = /frequently asked questions|faqs?\b/.test(bodyText);
  checks.push({
    label: 'FAQ-formatted content',
    passed: hasFAQSchema || hasFAQHeading,
    detail: hasFAQSchema
      ? 'FAQPage schema detected'
      : hasFAQHeading
        ? 'FAQ heading/section detected in page text'
        : 'No FAQ schema or heading found',
  });

  // 3. Heading hierarchy
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  checks.push({
    label: 'Clear heading hierarchy',
    passed: h1Count === 1 && h2Count > 0,
    detail: `Found ${h1Count} <h1> and ${h2Count} <h2> tags (ideal: exactly one H1, multiple H2s)`,
  });

  // 4. Meta description
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  checks.push({
    label: 'Meta description quality',
    passed: metaDescription.length >= 50 && metaDescription.length <= 160,
    detail: metaDescription
      ? `${metaDescription.length} characters (ideal: 50-160)`
      : 'No meta description found',
  });

  // 5. Title tag
  const title = $('title').text();
  checks.push({
    label: 'Descriptive title tag',
    passed: title.length >= 10,
    detail: title ? `"${title}"` : 'No title tag found',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return { url: normalizedUrl, score, checks };
}
