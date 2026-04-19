import Link from 'next/link';
import { EtfScenarioListingItem } from '@/app/api/[spaceId]/etf-scenarios/listing/route';
import { EtfScenarioDirectionBadge, EtfScenarioProbabilityBadge, EtfScenarioTimeframeBadge } from './EtfScenarioOutlookBadge';

function firstSentence(md: string, maxLen = 160): string {
  const cleaned = md.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  const period = cleaned.search(/\.\s+/);
  const base = period > 0 ? cleaned.slice(0, period + 1) : cleaned;
  return base.length > maxLen ? base.slice(0, maxLen).replace(/\s+\S*$/, '') + '…' : base;
}

export default function EtfScenarioCard({ scenario }: { scenario: EtfScenarioListingItem }): JSX.Element {
  return (
    <Link
      href={`/etf-scenarios/${scenario.slug}`}
      className="block bg-[#1F2937] border border-[#374151] rounded-lg p-4 hover:border-[#F59E0B] hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-black text-xs font-bold px-2 py-0.5 rounded">#{scenario.scenarioNumber}</span>
        {scenario.archived && <span className="text-xs text-gray-400 bg-[#374151] px-2 py-0.5 rounded">Archived</span>}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <EtfScenarioDirectionBadge direction={scenario.direction} />
        <EtfScenarioProbabilityBadge bucket={scenario.probabilityBucket} percentage={scenario.probabilityPercentage} />
        <EtfScenarioTimeframeBadge timeframe={scenario.timeframe} />
      </div>

      <h3 className="text-white text-base font-medium mb-2 line-clamp-2 min-h-[3rem]">{scenario.title}</h3>

      <p className="text-xs text-gray-400 line-clamp-3 min-h-[3.75rem]">{firstSentence(scenario.underlyingCause)}</p>
    </Link>
  );
}
