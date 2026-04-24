import CompetitorCard from '@/components/competition/CompetitorCard';
import type { EtfCompetitionResponse } from '@/types/etf/etf-analysis-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { use } from 'react';

export interface EtfCompetitionSectionProps {
  dataPromise: Promise<EtfCompetitionResponse | null>;
}

/**
 * Renders the Competition section on the ETF detail page. Mirrors the layout of the
 * ticker detail page's Competition section (overall analysis body + per-peer cards)
 * but reuses the shared `CompetitorCard` and drops the Quality/Value quadrant chart,
 * which is ticker-specific (relies on cached equity scores that ETFs don't have).
 */
export default function EtfCompetitionSection({ dataPromise }: EtfCompetitionSectionProps): JSX.Element | null {
  const data = use(dataPromise);

  if (!data) return null;

  const { vsCompetition, competitors } = data;
  const hasCompetitors = competitors && competitors.length > 0;
  const hasAnalysis = Boolean(vsCompetition?.overallAnalysisDetails?.trim());

  if (!hasCompetitors && !hasAnalysis) return null;

  return (
    <section id="competition" className="mb-8">
      <div className="bg-gray-900 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
          <h2 className="text-xl font-bold">Competition</h2>
        </div>

        {hasAnalysis && (
          <div
            className="markdown markdown-body mb-6 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(vsCompetition!.overallAnalysisDetails) }}
          />
        )}

        {hasCompetitors && (
          <ul className="space-y-3 mt-2">
            {competitors.map((competitor, index) => {
              const href =
                competitor.existsInSystem && competitor.etfData
                  ? `/etfs/${competitor.etfData.exchange.toUpperCase()}/${competitor.etfData.symbol.toUpperCase()}`
                  : null;
              return <CompetitorCard key={`${competitor.companyName}-${index}`} competitor={competitor} href={href} />;
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
