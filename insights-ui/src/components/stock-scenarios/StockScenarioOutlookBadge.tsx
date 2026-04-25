import { ScenarioDirection, ScenarioProbabilityBucket, ScenarioTimeframe } from '@/types/scenarioEnums';

const BUCKET_STYLES: Record<ScenarioProbabilityBucket, { label: string; className: string }> = {
  HIGH: { label: 'High', className: 'bg-red-500/15 text-red-300 border-red-500/40' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  LOW: { label: 'Low', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
};

const DIRECTION_STYLES: Record<ScenarioDirection, { label: string; className: string }> = {
  UPSIDE: { label: 'Upside', className: 'bg-sky-500/15 text-sky-300 border-sky-500/40' },
  DOWNSIDE: { label: 'Downside', className: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40' },
};

const TIMEFRAME_STYLES: Record<ScenarioTimeframe, { label: string; className: string }> = {
  FUTURE: { label: 'Future', className: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40' },
  IN_PROGRESS: { label: 'In progress', className: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40' },
  PAST: { label: 'Past', className: 'bg-gray-500/15 text-gray-300 border-gray-500/40' },
};

export function StockScenarioProbabilityBadge({
  bucket,
  percentage,
  asOfDate,
}: {
  bucket: ScenarioProbabilityBucket;
  percentage?: number | null;
  asOfDate?: string | null;
}): JSX.Element {
  const style = BUCKET_STYLES[bucket];
  const dateText = asOfDate ? new Date(asOfDate).toISOString().slice(0, 10) : null;

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
      <span className="uppercase tracking-wide">{style.label}</span>
      {typeof percentage === 'number' && <span className="text-[10px] opacity-80">~{percentage}%</span>}
      {dateText && <span className="text-[10px] opacity-70">as of {dateText}</span>}
    </span>
  );
}

export function StockScenarioDirectionBadge({ direction }: { direction: ScenarioDirection }): JSX.Element {
  const style = DIRECTION_STYLES[direction];
  return (
    <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${style.className}`}>
      {style.label}
    </span>
  );
}

export function StockScenarioTimeframeBadge({ timeframe }: { timeframe: ScenarioTimeframe }): JSX.Element {
  const style = TIMEFRAME_STYLES[timeframe];
  return (
    <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${style.className}`}>
      {style.label}
    </span>
  );
}
