import type { BrandMentionStats } from '../../lib/types';

export default function ScoreCard({
  overallScore,
  brandStats,
}: {
  overallScore: number;
  brandStats: BrandMentionStats[];
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-5xl font-semibold">{overallScore}</span>
        <span className="text-gray-500">/ 100 visibility score</span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="py-2 font-medium">Brand</th>
            <th className="py-2 font-medium">Mention rate</th>
            <th className="py-2 font-medium">Citation rate</th>
            <th className="py-2 font-medium">Avg. position</th>
          </tr>
        </thead>
        <tbody>
          {brandStats.map((s) => (
            <tr key={s.brand} className="border-b border-gray-100 last:border-0">
              <td className="py-2 font-medium">{s.brand}</td>
              <td className="py-2">{Math.round(s.mentionRate * 100)}%</td>
              <td className="py-2">{Math.round(s.citedRate * 100)}%</td>
              <td className="py-2">{s.avgPosition ? s.avgPosition.toFixed(1) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
