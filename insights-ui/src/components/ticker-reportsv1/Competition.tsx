import { parseMarkdown } from '@/util/parse-markdown';
import type { CompetitorTicker } from '@/utils/ticker-v1-model-utils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import React, { use } from 'react';
import AddTickerAdminButton from './AddTickerAdminButton';

/** Matches the payload the page fetcher provides. */
export type VsCompetition = Readonly<{ overallAnalysisDetails: string }>;
export interface CompetitionPayload {
  vsCompetition: VsCompetition | null;
  competitorTickers: CompetitorTicker[];
}

export interface CompetitionProps {
  exchange: string;
  ticker: string;
  /** Promise-based fetch (resolved via `use()` to keep Suspense at the caller). */
  dataPromise: Promise<CompetitionPayload>;
}

export default function Competition({ exchange, ticker, dataPromise }: CompetitionProps): JSX.Element | null {
  const { vsCompetition, competitorTickers }: Readonly<CompetitionPayload> = use(dataPromise);

  if (!vsCompetition && (!competitorTickers || competitorTickers.length === 0)) {
    return null;
  }

  return (
    <div id="competition" className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
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
                      <Link
                        href={tickerLink}
                        title="View detailed report"
                        className="flex gap-x-2 items-center text-[#F59E0B] hover:text-[#F97316] transition-colors"
                      >
                        <h3 className="font-semibold">{competitor.companyName}</h3>
                        <ArrowTopRightOnSquareIcon className="size-4 text-primary-text" />
                      </Link>
                    ) : (
                      <h3 className="font-semibold">{competitor.companyName}</h3>
                    )}
                    <div className="flex">
                      <div className="flex items-center gap-x-2">
                        {competitor.companySymbol && (
                          <span className="text-sm text-gray-400">
                            {competitor.companySymbol} • {competitor.exchangeName?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <AddTickerAdminButton competitor={competitor} />
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
