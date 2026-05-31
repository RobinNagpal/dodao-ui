import { computeQuadrantScores, classifyStock, QuadrantDataPoint } from '@/util/quadrant-chart-utils';
import CompetitionQuadrantChart from '@/components/ticker-reportsv1/CompetitionQuadrantChart';
import CardSection from '@/components/ui/sections/CardSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import SplitColumns from '@/components/ui/containers/SplitColumns';
import type { CompetitionResponse } from '@/types/ticker-typesv1';
import Link from 'next/link';
import { use } from 'react';

export interface CompetitionChartSectionProps {
  dataPromise: Promise<CompetitionResponse | null>;
  exchange: string;
  ticker: string;
}

export default function CompetitionChartSection({ dataPromise, exchange, ticker }: CompetitionChartSectionProps): JSX.Element | null {
  const data = use(dataPromise);

  if (!data || !data.ticker) {
    return null;
  }

  const { competitorTickers } = data;
  const tickerData = data.ticker;

  const quadrantDataPoints: QuadrantDataPoint[] = [];

  const mainCached = tickerData.cachedScoreEntry;
  if (mainCached) {
    const { qualityScore, valueScore } = computeQuadrantScores(mainCached);
    quadrantDataPoints.push({
      ticker: tickerData.symbol,
      companyName: tickerData.name,
      qualityScore,
      valueScore,
      classification: classifyStock(qualityScore, valueScore),
      isMainTicker: true,
      exchange: tickerData.exchange,
    });
  }

  for (const competitor of competitorTickers) {
    const cached = competitor.tickerData?.cachedScoreEntry;
    if (!cached || !competitor.existsInSystem) continue;
    const { qualityScore, valueScore } = computeQuadrantScores(cached);
    quadrantDataPoints.push({
      ticker: competitor.tickerData!.symbol,
      companyName: competitor.companyName,
      qualityScore,
      valueScore,
      classification: classifyStock(qualityScore, valueScore),
      isMainTicker: false,
      exchange: competitor.tickerData!.exchange,
    });
  }

  if (quadrantDataPoints.length < 2) {
    return null;
  }

  const comparisonList = (
    <>
      <SectionHeading as="h3" size="sm">
        Quality vs Value Comparison
      </SectionHeading>
      <p className="text-sm text-muted mb-4">
        Compare {tickerData.name} ({tickerData.symbol}) against key competitors on quality and value metrics.
      </p>

      <div className="space-y-2.5">
        {quadrantDataPoints.map((dp) => {
          const tickerLink = !dp.isMainTicker && dp.exchange ? `/stocks/${dp.exchange.toUpperCase()}/${dp.ticker.toUpperCase()}` : null;

          const content = (
            <>
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                style={{
                  backgroundColor: dp.isMainTicker
                    ? '#f59e0b'
                    : dp.classification === 'High Quality'
                    ? '#34d399'
                    : dp.classification === 'Investable'
                    ? '#818cf8'
                    : dp.classification === 'Value Play'
                    ? '#38bdf8'
                    : '#fb7185',
                }}
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={dp.isMainTicker ? 'font-semibold text-amber-400' : 'text-body group-hover:text-link transition-colors'}>
                    {dp.companyName}
                  </span>
                  <span className={dp.isMainTicker ? 'text-amber-400 text-xs' : 'text-muted text-xs'}>({dp.ticker})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span>{dp.classification}</span>
                  <span>·</span>
                  <span>Quality {dp.qualityScore.toFixed(0)}%</span>
                  <span>·</span>
                  <span>Value {dp.valueScore.toFixed(0)}%</span>
                </div>
              </div>
            </>
          );

          return tickerLink ? (
            <Link key={dp.ticker} href={tickerLink} className="flex items-start gap-2.5 text-sm group">
              {content}
            </Link>
          ) : (
            <div key={dp.ticker} className="flex items-start gap-2.5 text-sm">
              {content}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <CardSection id="competition" padding="cozy">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-border">
        <SectionHeading as="h2" weight="bold" className="mb-0">
          Competition
        </SectionHeading>
        <Link
          href={`/stocks/${exchange}/${ticker}/competition`}
          prefetch={false}
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-heading shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
        >
          View Full Analysis →
        </Link>
      </div>

      <SplitColumns gap="md" left={comparisonList} right={<CompetitionQuadrantChart dataPoints={quadrantDataPoints} mainTickerSymbol={ticker} />} />
    </CardSection>
  );
}
