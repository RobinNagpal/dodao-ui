import CompetitorCard from '@/components/competition/CompetitorCard';
import EtfCompetitionQuadrantWithLegend from '@/components/etf-reportsv1/EtfCompetitionQuadrantWithLegend';
import type { EtfCompetitionResponse } from '@/types/etf/etf-analysis-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { buildEtfQuadrantDataPoints } from '@/utils/etf-competition-utils';
import Link from 'next/link';

export interface EtfCompetitionFullViewProps {
  data: EtfCompetitionResponse;
}

/**
 * Full Competition view rendered on the dedicated `/etfs/.../competition` page.
 * Shows the quadrant chart, the long-form markdown analysis, and per-peer cards.
 */
export default function EtfCompetitionFullView({ data }: EtfCompetitionFullViewProps): JSX.Element | null {
  const { vsCompetition, competitors, etf } = data;

  if (!etf || (!vsCompetition && (!competitors || competitors.length === 0))) {
    return null;
  }

  const createdAtRaw = vsCompetition?.createdAt ?? etf.createdAt ?? new Date();
  const updatedAtRaw = vsCompetition?.updatedAt ?? etf.updatedAt ?? new Date();
  const publishedDate = new Date(createdAtRaw);
  const modifiedDate = new Date(updatedAtRaw);
  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const quadrantDataPoints = buildEtfQuadrantDataPoints(data);
  const hasAnalysis = Boolean(vsCompetition?.overallAnalysisDetails?.trim());

  const competitorListText =
    competitors.length === 0
      ? 'its closest peer ETFs'
      : competitors.length === 1
      ? competitors[0].companyName
      : `${competitors
          .slice(0, -1)
          .map((c) => c.companyName)
          .join(', ')} and ${competitors[competitors.length - 1].companyName}`;

  const executiveSummary = `A peer-vs-peer read of ${etf.name} (${etf.symbol}) against ${competitorListText} on past returns, future outlook, cost efficiency, and risk.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <article className="bg-gray-900 rounded-lg shadow-sm border border-color p-6 md:p-8" itemScope itemType="https://schema.org/Article">
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        <header className="mb-6 pb-4 border-b border-color">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-color mb-2" itemProp="headline">
                {etf.name} <span className="text-muted-foreground">({etf.symbol})</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                  {etf.exchange}
                </span>
                <span className="text-muted-foreground">•</span>
                <time dateTime={modifiedDate.toISOString()} className="text-muted-foreground text-sm" itemProp="dateModified">
                  {formattedModifiedDate}
                </time>
              </div>
            </div>

            <Link
              href={`/etfs/${etf.exchange}/${etf.symbol}`}
              className="link-color hover:underline text-sm font-medium whitespace-nowrap flex items-center gap-1"
            >
              View Full Report →
            </Link>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          {quadrantDataPoints.length >= 2 ? (
            <section className="mb-6">
              <EtfCompetitionQuadrantWithLegend
                dataPoints={quadrantDataPoints}
                mainEtfSymbol={etf.symbol}
                mainEtfName={etf.name}
                heading="Executive Summary"
                headingAs="h2"
                description={executiveSummary}
                descriptionItemProp="abstract"
              />
            </section>
          ) : (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Executive Summary</h2>
              <p className="text-color leading-relaxed" itemProp="abstract">
                {executiveSummary}
              </p>
            </section>
          )}

          {hasAnalysis && (
            <section className="mb-6" itemProp="articleBody">
              <h2 className="text-xl font-semibold text-color mb-3">Comprehensive Analysis</h2>
              <div
                className="markdown markdown-body prose-headings:text-color prose-p:text-color prose-strong:text-color prose-code:text-color prose-a:text-primary hover:prose-a:text-primary/80"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(vsCompetition!.overallAnalysisDetails) }}
              />
            </section>
          )}

          {competitors && competitors.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Competitor Details</h2>
              <ul className="space-y-3 mt-2">
                {competitors.map((competitor, index) => {
                  const href =
                    competitor.existsInSystem && competitor.etfData
                      ? `/etfs/${competitor.etfData.exchange.toUpperCase()}/${competitor.etfData.symbol.toUpperCase()}`
                      : null;
                  return <CompetitorCard key={`${competitor.companyName}-${index}`} competitor={competitor} href={href} />;
                })}
              </ul>
            </section>
          )}
        </div>

        <footer className="mt-8 pt-6 border-t border-color">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <span>Last updated by </span>
              <span itemProp="author" itemScope itemType="https://schema.org/Organization">
                <span itemProp="name">KoalaGains</span>
              </span>
              <span> on </span>
              <time dateTime={modifiedDate.toISOString()} itemProp="dateModified">
                {formattedModifiedDate}
              </time>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                ETF Analysis
              </span>
              <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-300">
                Competitive Analysis
              </span>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
