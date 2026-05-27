import { EtfKeyFactsFlagAssessment } from '@/types/etf/etf-analysis-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface EtfKeyFactsFlagsProps {
  greenFlags?: EtfKeyFactsFlagAssessment[] | null;
  redFlags?: EtfKeyFactsFlagAssessment[] | null;
}

/**
 * Pass/Fail assessments for the key-facts report, rendered below the charts on
 * the ETF detail page. Green and red flags share one list under a single "Key
 * Facts" heading: the per-item icon and Pass/Fail badge already convey status,
 * so separate "Green Flags"/"Red Flags" headings only confuse (a green flag can
 * fail and a red flag can pass). Renders nothing for ETFs analysed before this
 * feature (no stored flags), so older reports are unaffected.
 */
export default function EtfKeyFactsFlags({ greenFlags, redFlags }: EtfKeyFactsFlagsProps): JSX.Element | null {
  const flags = [...(greenFlags ?? []), ...(redFlags ?? [])];
  if (flags.length === 0) return null;

  return (
    <section id="key-facts-flags" className="mb-8">
      <h3 className="text-lg font-semibold text-color mb-3">Key Facts</h3>
      <ul className="space-y-2">
        {flags.map((f, i) => {
          const explanation = f.explanation?.trim() || [f.oneLineExplanation, f.detailedExplanation].filter(Boolean).join(' ').trim();
          return (
            <li key={`${f.flag}-${i}`} className="bg-gray-800 rounded-md px-3 py-2 sm:px-4 sm:py-2.5">
              <div className="flex flex-col gap-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {f.result === 'Pass' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <h4 className="font-semibold">{f.flag}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-sm font-medium flex-shrink-0 ${
                      f.result === 'Pass' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {f.result}
                  </span>
                </div>
                {explanation && (
                  <div className="markdown markdown-body text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: parseMarkdown(explanation) }} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
