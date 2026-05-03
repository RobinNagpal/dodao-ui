'use client';

import { computeQuadrantScores, classifyStock, QuadrantDataPoint } from '@/util/quadrant-chart-utils';
import CompetitionQuadrantChart from '@/components/ticker-reportsv1/CompetitionQuadrantChart';
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

  return (
    <section id="competition" className="mb-8">
      <div className="bg-gray-900 rounded-lg shadow-sm p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
          <h2 className="text-xl font-bold">Competition</h2>
          <Link
            href={`/stocks/${exchange}/${ticker}/competition`}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
          >
            View Full Analysis →
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/2">
            <h3 className="text-lg font-semibold text-color mb-3">Quality vs Value Comparison</h3>
            <p className="text-sm text-gray-400 mb-4">
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
                        <span className={dp.isMainTicker ? 'font-semibold text-amber-400' : 'text-gray-200 group-hover:text-[#F59E0B] transition-colors'}>
                          {dp.companyName}
                        </span>
                        <span className={dp.isMainTicker ? 'text-amber-400 text-xs' : 'text-gray-500 text-xs'}>({dp.ticker})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
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
          </div>

          <div className="lg:w-1/2">
            <CompetitionQuadrantChart dataPoints={quadrantDataPoints} mainTickerSymbol={ticker} />
          </div>
        </div>
      </div>
    </section>
  );
}
