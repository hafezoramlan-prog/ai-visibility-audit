export interface AnalyzeRequest {
  brand: string;
  competitors: string[];
  category: string;
  useCase: string;
  url?: string;
  openaiKey: string;
  perplexityKey?: string;
}

export interface ProviderResult {
  provider: 'openai' | 'perplexity';
  query: string;
  responseText: string;
  mentionedBrands: string[];
  citedUrls: string[];
}

export interface BrandMentionStats {
  brand: string;
  mentionRate: number; // 0-1 across all queries, all providers
  citedRate: number; // 0-1, only meaningful for providers that return citations
  avgPosition: number | null; // avg character-order rank among mentioned brands, null if never mentioned
}

export interface AEOCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface AEOScanResult {
  url: string;
  score: number; // 0-100
  checks: AEOCheck[];
}

export interface AnalyzeResponse {
  queries: string[];
  providerResults: ProviderResult[];
  brandStats: BrandMentionStats[];
  aeoScan: AEOScanResult | null;
  overallScore: number; // 0-100, brand's score
  recommendations: string[];
}
