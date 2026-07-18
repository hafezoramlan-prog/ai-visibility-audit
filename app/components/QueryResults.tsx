import type { ProviderResult } from '../../lib/types';

export default function QueryResults({ results }: { results: ProviderResult[] }) {
  return (
    <div className="space-y-4">
      {results.map((r, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">{r.provider}</span>
            <span className="text-xs text-gray-400">
              {r.mentionedBrands.length > 0
                ? `Mentioned: ${r.mentionedBrands.join(', ')}`
                : 'No tracked brands mentioned'}
            </span>
          </div>
          <p className="text-sm font-medium mb-2">{r.query}</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{r.responseText}</p>
          {r.citedUrls.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Cited sources:</p>
              <ul className="text-xs text-blue-600 space-y-0.5">
                {r.citedUrls.map((u) => (
                  <li key={u} className="truncate">
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
