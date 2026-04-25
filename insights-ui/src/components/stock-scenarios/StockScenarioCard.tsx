import Link from 'next/link';
import { StockScenarioListingItem } from '@/app/api/[spaceId]/stock-scenarios/listing/route';
import { StockScenarioDirectionBadge, StockScenarioProbabilityBadge, StockScenarioTimeframeBadge } from './StockScenarioOutlookBadge';

function firstSentence(md: string, maxLen = 160): string {
  const cleaned = md.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  const period = cleaned.search(/\.\s+/);
  const base = period > 0 ? cleaned.slice(0, period + 1) : cleaned;
  return base.length > maxLen ? base.slice(0, maxLen).replace(/\s+\S*$/, '') + '…' : base;
}

export default function StockScenarioCard({ scenario }: { scenario: StockScenarioListingItem }): JSX.Element {
  return (
    <Link
      href={`/stock-scenarios/${scenario.slug}`}
      className="block bg-[#1F2937] border border-[#374151] rounded-lg p-4 hover:border-[#F59E0B] hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black text-xs font-bold px-2 py-0.5 rounded">#{scenario.scenarioNumber}</span>
        {scenario.archived && <span className="text-xs text-gray-400 bg-[#374151] px-2 py-0.5 rounded">Archived</span>}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <StockScenarioDirectionBadge direction={scenario.direction} />
        <StockScenarioProbabilityBadge bucket={scenario.probabilityBucket} percentage={scenario.probabilityPercentage} />
        <StockScenarioTimeframeBadge timeframe={scenario.timeframe} />
      </div>

      {scenario.countries.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {scenario.countries.map((c) => (
            <span key={c} className="text-[10px] uppercase tracking-wide text-gray-300 bg-[#111827] border border-[#374151] rounded px-1.5 py-0.5">
              {c}
            </span>
          ))}
        </div>
      )}

      <h3 className="text-white text-base font-medium mb-2 line-clamp-2 min-h-[3rem]">{scenario.title}</h3>

      <p className="text-xs text-gray-400 line-clamp-3 min-h-[3.75rem]">{firstSentence(scenario.underlyingCause)}</p>
    </Link>
  );
}
