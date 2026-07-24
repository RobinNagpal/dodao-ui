import Link from 'next/link';
import { EtfScenarioListingItem } from '@/app/api/[spaceId]/etf-scenarios/listing/route';
import { EtfScenarioDirectionBadge, EtfScenarioProbabilityBadge, EtfScenarioTimeframeBadge } from './EtfScenarioOutlookBadge';
import StatusBadge from '@/components/ui/StatusBadge';

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

export default function EtfScenarioCard({ scenario }: { scenario: EtfScenarioListingItem }): JSX.Element {
  return (
    <Link
      href={`/etf-scenarios/${scenario.slug}`}
      className="group block bg-bg border border-border rounded-2xl p-5 hover:border-primary transition-all duration-200 h-full"
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded">#{scenario.scenarioNumber}</span>
        {scenario.archived && <StatusBadge variant="archived" size="sm" label="Archived" />}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <EtfScenarioDirectionBadge direction={scenario.direction} />
        <EtfScenarioProbabilityBadge bucket={scenario.probabilityBucket} percentage={scenario.probabilityPercentage} />
        <EtfScenarioTimeframeBadge timeframe={scenario.timeframe} />
      </div>

      <h3 className="text-heading text-lg font-semibold mb-3 line-clamp-2 min-h-[3.25rem] group-hover:text-heading transition-colors">{scenario.title}</h3>

      <p className="text-sm text-muted leading-relaxed line-clamp-3 min-h-[4rem]">{firstSentence(scenario.summary)}</p>

      {scenario.countries.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-border">
          {scenario.countries.map((c) => (
            <span key={c} className="text-[10px] uppercase tracking-wide text-muted">
              📍 {c}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
