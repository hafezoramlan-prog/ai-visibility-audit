import type { AEOScanResult } from '../../lib/types';

export default function AEOChecklist({ scan }: { scan: AEOScanResult | null }) {
  if (!scan) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
        No URL provided, on-page AEO scan skipped. Add a URL to check schema markup, heading
        structure, and FAQ formatting.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-medium">On-page AEO readiness</h3>
        <span className="text-2xl font-semibold">{scan.score}/100</span>
      </div>
      <ul className="space-y-2 text-sm">
        {scan.checks.map((c) => (
          <li key={c.label} className="flex gap-2">
            <span>{c.passed ? '✅' : '⚠️'}</span>
            <div>
              <p className="font-medium">{c.label}</p>
              <p className="text-gray-500">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
