import { EtfIndexStrategyFlagAssessment } from '@/types/etf/etf-analysis-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface EtfIndexStrategyFlagsProps {
  greenFlags?: EtfIndexStrategyFlagAssessment[] | null;
  redFlags?: EtfIndexStrategyFlagAssessment[] | null;
}

function FlagList({ title, flags }: { title: string; flags: EtfIndexStrategyFlagAssessment[] }): JSX.Element | null {
  if (flags.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-color mb-3">{title}</h2>
      <ul className="space-y-3 mt-2">
        {flags.map((f, i) => (
          <li key={`${f.flag}-${i}`} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {f.result === 'Pass' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                  )}
                  <h3 className="font-semibold">{f.flag}</h3>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
                    f.result === 'Pass' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                  }`}
                >
                  {f.result}
                </span>
              </div>
              {f.oneLineExplanation && <p className="text-sm text-gray-400">{f.oneLineExplanation}</p>}
              {f.detailedExplanation && (
                <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(f.detailedExplanation) }} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Green/red flag Pass/Fail assessments for the index-strategy report, rendered
 * below the charts on the ETF detail page. Renders nothing for ETFs analysed
 * before this feature (no stored flags), so older reports are unaffected.
 */
export default function EtfIndexStrategyFlags({ greenFlags, redFlags }: EtfIndexStrategyFlagsProps): JSX.Element | null {
  const green = greenFlags ?? [];
  const red = redFlags ?? [];
  if (green.length === 0 && red.length === 0) return null;

  return (
    <section id="index-strategy-flags" className="mb-8">
      <FlagList title="Green Flags" flags={green} />
      <FlagList title="Red Flags" flags={red} />
    </section>
  );
}
