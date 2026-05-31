import PassFailBadge from '@/components/ui/PassFailBadge';
import { EtfKeyFactsFlagAssessment } from '@/types/etf/etf-analysis-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface EtfKeyFactsFlagsProps {
  greenFlags?: EtfKeyFactsFlagAssessment[] | null;
  redFlags?: EtfKeyFactsFlagAssessment[] | null;
}

/**
 * Pass/Fail assessments for the key-facts report. Rendered as a single card
 * (matching the stock detail page's report-type cards) with flag rows split by
 * dividers — green and red flags share one list because the per-row icon and
 * Pass/Fail badge already convey status, and grouping them under separate
 * "Green Flags"/"Red Flags" headings only confused readers when a green flag
 * Failed or a red flag Passed.
 */
export default function EtfKeyFactsFlags({ greenFlags, redFlags }: EtfKeyFactsFlagsProps): JSX.Element | null {
  const flags = [...(greenFlags ?? []), ...(redFlags ?? [])];
  if (flags.length === 0) return null;

  return (
    <section id="key-facts-flags" className="mb-8">
      <div className="bg-surface p-3 sm:p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-color mb-3">Key Facts</h3>
        <ul className="divide-y divide-border">
          {flags.map((f, i) => {
            const explanation = f.explanation?.trim() || [f.oneLineExplanation, f.detailedExplanation].filter(Boolean).join(' ').trim();
            return (
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
                  {explanation && (
                    <div className="markdown markdown-body text-sm text-muted" dangerouslySetInnerHTML={{ __html: parseMarkdown(explanation) }} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
