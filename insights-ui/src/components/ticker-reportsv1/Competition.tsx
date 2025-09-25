import { CompetitorTicker, TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

interface CompetitionProps {
  tickerV1: TickerV1FastResponse;
}

export default function Competition({ tickerV1 }: CompetitionProps) {
  const vsCompetition = tickerV1.vsCompetition;
  if (!vsCompetition) {
    return null;
  }
  const competitorTickers: CompetitorTicker[] = [];
  return (
    <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Competition</h2>
      <div className="markdown markdown-body mb-4" dangerouslySetInnerHTML={{ __html: parseMarkdown(vsCompetition.overallAnalysisDetails) }} />

      {competitorTickers && competitorTickers.length > 0 && (
        <ul className="space-y-3 mt-2">
          {competitorTickers.map((competitor, index) => (
            <li key={`${competitor.companyName}-${index}`} className="bg-gray-800 p-4 rounded-md">
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{competitor.companyName}</h3>
                  <div className="flex items-center gap-x-2">
                    {competitor.companySymbol && (
                      <span className="text-sm text-gray-400">
                        {competitor.companySymbol} • {competitor.exchangeName?.toUpperCase()}
                      </span>
                    )}
                    {competitor.existsInSystem && competitor.tickerData ? (
                      <Link
                        href={`/stocks/${competitor.tickerData!.exchange.toUpperCase()}/${competitor.tickerData!.symbol.toUpperCase()}`}
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
                    className="markdown markdown-body "
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(competitor.detailedComparison) }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
