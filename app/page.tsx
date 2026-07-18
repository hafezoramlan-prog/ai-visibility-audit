'use client';

import { useState } from 'react';
import ScoreCard from './components/ScoreCard';
import QueryResults from './components/QueryResults';
import AEOChecklist from './components/AEOChecklist';
import type { AnalyzeResponse } from '../lib/types';

export default function Home() {
  const [brand, setBrand] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [category, setCategory] = useState('');
  const [useCase, setUseCase] = useState('');
  const [url, setUrl] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          competitors: competitors.split(',').map((c) => c.trim()).filter(Boolean),
          category,
          useCase,
          url: url || undefined,
          openaiKey,
          perplexityKey: perplexityKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-1">AI Visibility Audit</h1>
      <p className="text-gray-500 mb-8 text-sm">
        See how a brand shows up in AI answer engines vs traditional search, and where the
        content gaps are.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Atomix Logistics"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Competitors (comma separated)</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="Competitor A, Competitor B"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="logistics software"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Use case</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="small business shipping"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Brand URL (optional, enables AEO scan)</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">OpenAI API key</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Perplexity API key (optional)</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              type="password"
              value={perplexityKey}
              onChange={(e) => setPerplexityKey(e.target.value)}
              placeholder="pplx-..."
            />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Keys are sent directly to the API route for this request only and are never stored or
          logged. Bring your own key so this demo stays free to run.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Run audit'}
        </button>
      </form>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded p-4 mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8">
          <ScoreCard overallScore={result.overallScore} brandStats={result.brandStats} />

          <div>
            <h2 className="font-medium mb-3">Recommendations</h2>
            <ul className="space-y-2 text-sm">
              {result.recommendations.map((r, i) => (
                <li key={i} className="border border-gray-200 rounded p-3 bg-white">
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <AEOChecklist scan={result.aeoScan} />

          <div>
            <h2 className="font-medium mb-3">Query-by-query results</h2>
            <QueryResults results={result.providerResults} />
          </div>
        </div>
      )}
    </main>
  );
}
