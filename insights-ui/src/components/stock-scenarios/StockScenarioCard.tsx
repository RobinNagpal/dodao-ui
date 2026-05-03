import Link from 'next/link';
import { StockScenarioListingItem } from '@/app/api/[spaceId]/stock-scenarios/listing/route';
import { StockScenarioDirectionBadge, StockScenarioProbabilityBadge, StockScenarioTimeframeBadge } from './StockScenarioOutlookBadge';

// Tolerate `null` / `undefined` so the listing page renders cleanly during the
// summary-field rollout window — production's old API may still respond
// without a `summary` field while the new build is being deployed.
function firstSentence(md: string | null | undefined, maxLen = 160): string {
  if (!md) return '';
  const cleaned = md.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  const period = cleaned.search(/\.\s+/);
  const base = period > 0 ? cleaned.slice(0, period + 1) : cleaned;
  return base.length > maxLen ? base.slice(0, maxLen).replace(/\s+\S*$/, '') + '…' : base;
}

export default function StockScenarioCard({ scenario }: { scenario: StockScenarioListingItem }): JSX.Element {
  return (
    <Link
      href={`/stock-scenarios/${scenario.slug}`}
      className="group block bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-blue-500 transition-all duration-200 h-full"
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black text-xs font-bold px-2 py-0.5 rounded">#{scenario.scenarioNumber}</span>
        {scenario.archived && <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded">Archived</span>}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <StockScenarioDirectionBadge direction={scenario.direction} />
        <StockScenarioProbabilityBadge bucket={scenario.probabilityBucket} percentage={scenario.probabilityPercentage} />
        <StockScenarioTimeframeBadge timeframe={scenario.timeframe} />
      </div>

      <h3 className="text-white text-lg font-semibold mb-3 line-clamp-2 min-h-[3.25rem] group-hover:text-blue-400 transition-colors">{scenario.title}</h3>

      <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 min-h-[4rem]">{firstSentence(scenario.summary)}</p>

      {scenario.countries.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-gray-800">
          {scenario.countries.map((c) => (
            <span key={c} className="text-[10px] uppercase tracking-wide text-gray-400">
              📍 {c}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
