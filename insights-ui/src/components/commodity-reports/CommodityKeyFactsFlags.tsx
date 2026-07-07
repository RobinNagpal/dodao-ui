import PassFailBadge from '@/components/ui/PassFailBadge';
import { CommodityKeyFactsFlag } from '@/types/commodity/commodity-analysis-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface CommodityKeyFactsFlagsProps {
  flags: CommodityKeyFactsFlag[];
  heading?: string;
}

/**
 * Pass/Fail flag assessments for a commodity, rendered with the exact same card
 * design as the ETF key-facts flags (`EtfKeyFactsFlags`) so the two report types
 * stay visually consistent — one `bg-surface` card, divider-separated rows, a
 * green/red status icon, and a Pass/Fail badge. Green and red flags share one
 * list because the per-row icon + badge already convey status.
 */
export default function CommodityKeyFactsFlags({ flags, heading = 'Green & Red Flags' }: CommodityKeyFactsFlagsProps): JSX.Element | null {
  if (!flags || flags.length === 0) return null;

  return (
    <section id="key-facts-flags" className="mb-8">
      <div className="bg-surface p-3 sm:p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-color mb-3">{heading}</h3>
        <ul className="divide-y divide-border">
          {flags.map((f, i) => (
            <li key={`${f.flag}-${i}`} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {f.result === 'Pass' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <h4 className="font-semibold">{f.flag}</h4>
                  </div>
                  <PassFailBadge passed={f.result === 'Pass'} className="py-0.5 font-medium flex-shrink-0" passLabel={f.result} failLabel={f.result} />
                </div>
                {f.explanation && (
                  <div className="markdown markdown-body text-sm text-muted" dangerouslySetInnerHTML={{ __html: parseMarkdown(f.explanation) }} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
