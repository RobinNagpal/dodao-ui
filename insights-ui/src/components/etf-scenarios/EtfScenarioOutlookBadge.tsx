import { EtfScenarioOutlookBucket } from '@prisma/client';

const BUCKET_STYLES: Record<EtfScenarioOutlookBucket, { label: string; className: string }> = {
  HIGH: { label: 'High', className: 'bg-red-500/15 text-red-300 border-red-500/40' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  LOW: { label: 'Low', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
  IN_PROGRESS: { label: 'In progress', className: 'bg-gray-500/15 text-gray-300 border-gray-500/40' },
};

interface EtfScenarioOutlookBadgeProps {
  bucket: EtfScenarioOutlookBucket;
  asOfDate?: string | null;
}

export default function EtfScenarioOutlookBadge({ bucket, asOfDate }: EtfScenarioOutlookBadgeProps): JSX.Element {
  const style = BUCKET_STYLES[bucket];
  const dateText = asOfDate ? new Date(asOfDate).toISOString().slice(0, 10) : null;

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
      <span className="uppercase tracking-wide">{style.label}</span>
      {dateText && <span className="text-[10px] opacity-70">as of {dateText}</span>}
    </span>
  );
}
