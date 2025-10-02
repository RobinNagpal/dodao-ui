import type { CompetitorTicker } from '@/utils/ticker-v1-model-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { use } from 'react';

/** Matches the payload the page fetcher provides. */
export type VsCompetition = Readonly<{ overallAnalysisDetails: string }>;
export interface CompetitionPayload {
  vsCompetition: VsCompetition | null;
  competitorTickers: CompetitorTicker[];
}

export interface CompetitionProps {
  /** Promise-based fetch (resolved via `use()` to keep Suspense at the caller). */
  dataPromise: Promise<CompetitionPayload>;
}

export default function Competition({ dataPromise }: CompetitionProps): JSX.Element | null {
  const { vsCompetition, competitorTickers }: Readonly<CompetitionPayload> = use(dataPromise);

  if (!vsCompetition && (!competitorTickers || competitorTickers.length === 0)) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Competition</h2>

      {vsCompetition?.overallAnalysisDetails && (
        <div className="markdown markdown-body mb-4" dangerouslySetInnerHTML={{ __html: parseMarkdown(vsCompetition.overallAnalysisDetails) }} />
      )}

      {competitorTickers && competitorTickers.length > 0 && (
        <ul className="space-y-3 mt-2">
          {competitorTickers.map((competitor, index) => {
            const tickerLink =
              competitor.existsInSystem && competitor.tickerData
                ? `/stocks/${competitor.tickerData.exchange.toUpperCase()}/${competitor.tickerData.symbol.toUpperCase()}`
                : null;
            return (
              <li key={`${competitor.companyName}-${index}`} className="bg-gray-800 p-4 rounded-md">
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center justify-between">
                    {tickerLink ? (
                      <Link href={tickerLink} title="View detailed report" className="flex gap-x-2 items-center link-color">
                        <h3 className="font-semibold link-color">{competitor.companyName}</h3>
                        <ArrowTopRightOnSquareIcon className="size-4 text-primary-text" title="Report not available in our system" />
                      </Link>
                    ) : (
                      <h3 className="font-semibold">{competitor.companyName}</h3>
                    )}
                    <div className="flex items-center gap-x-2">
                      {competitor.companySymbol && (
                        <span className="text-sm text-gray-400">
                          {competitor.companySymbol} • {competitor.exchangeName?.toUpperCase()}
                        </span>
                      )}
                      {tickerLink ? (
                        <Link
                          href={tickerLink}
                          className="inline-flex items-center gap-x-1 text-sm font-medium text-[#F59E0B] hover:text-[#F97316] transition-colors"
                          title="View detailed report"
                        >
                          <ArrowTopRightOnSquareIcon className="size-4" />
                        </Link>
                      ) : (
                        <ArrowTopRightOnSquareIcon className="size-4 text-gray-500" title="Report not available in our system" />
                      )}
                    </div>
                  </div>
                  {competitor.detailedComparison && (
                    <div
                      id={slugify(competitor.companyName)}
                      className="markdown markdown-body"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(competitor.detailedComparison) }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
