'use client';

import EtfCompetitionQuadrantChart from '@/components/etf-reportsv1/EtfCompetitionQuadrantChart';
import type { EtfCompetitionResponse } from '@/types/etf/etf-analysis-types';
import { buildEtfQuadrantDataPoints } from '@/utils/etf-competition-utils';
import Link from 'next/link';
import { use } from 'react';

export interface EtfCompetitionChartSectionProps {
  dataPromise: Promise<EtfCompetitionResponse | null>;
  exchange: string;
  etf: string;
}

/**
 * Compact Competition section rendered on the ETF detail page. Shows the
 * Returns × Efficiency quadrant chart + a short peer list and links out to
 * the full `/etfs/{exchange}/{etf}/competition` page for the long analysis.
 * Intentionally mirrors the ticker detail page's `CompetitionChartSection`.
 */
export default function EtfCompetitionChartSection({ dataPromise, exchange, etf }: EtfCompetitionChartSectionProps): JSX.Element | null {
  const data = use(dataPromise);

  if (!data || !data.etf) return null;

  const quadrantDataPoints = buildEtfQuadrantDataPoints(data);

  // Chart needs the main ETF plus at least one peer with cached scores to be
  // meaningful. If we don't have that yet, skip the section entirely — the
  // full competition page can still be reached from the admin / URL directly.
  if (quadrantDataPoints.length < 2) return null;

  const mainEtf = data.etf;

  return (
    <section id="competition" className="mb-8">
      <div className="bg-gray-900 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
          <h2 className="text-xl font-bold">Competition</h2>
          <Link
            href={`/etfs/${exchange}/${etf}/competition`}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
          >
            View Full Analysis →
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/2">
            <h3 className="text-lg font-semibold text-color mb-3">Returns vs Efficiency</h3>
            <p className="text-sm text-gray-400 mb-4">
              Compare {mainEtf.name} ({mainEtf.symbol}) against peer ETFs on past returns + future outlook (vertical) vs cost efficiency + risk (horizontal).
            </p>

            <div className="space-y-2.5">
              {quadrantDataPoints.map((dp) => {
                const href = !dp.isMainEtf && dp.exchange ? `/etfs/${dp.exchange.toUpperCase()}/${dp.symbol.toUpperCase()}` : null;

                const content = (
                  <>
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{
                        backgroundColor: dp.isMainEtf
                          ? '#f59e0b'
                          : dp.classification === 'Top Pick'
                          ? '#34d399'
                          : dp.classification === 'Return Focused'
                          ? '#818cf8'
                          : dp.classification === 'Cost Efficient'
                          ? '#38bdf8'
                          : '#fb7185',
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={dp.isMainEtf ? 'font-semibold text-amber-400' : 'text-gray-200 group-hover:text-[#F59E0B] transition-colors'}>
                          {dp.name}
                        </span>
                        <span className={dp.isMainEtf ? 'text-amber-400 text-xs' : 'text-gray-500 text-xs'}>({dp.symbol})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{dp.classification}</span>
                        <span>·</span>
                        <span>Returns {dp.returnsScore.toFixed(0)}%</span>
                        <span>·</span>
                        <span>Efficiency {dp.efficiencyScore.toFixed(0)}%</span>
                      </div>
                    </div>
                  </>
                );

                return href ? (
                  <Link key={dp.symbol} href={href} className="flex items-start gap-2.5 text-sm group">
                    {content}
                  </Link>
                ) : (
                  <div key={dp.symbol} className="flex items-start gap-2.5 text-sm">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:w-1/2">
            <EtfCompetitionQuadrantChart dataPoints={quadrantDataPoints} mainEtfSymbol={mainEtf.symbol} />
          </div>
        </div>
      </div>
    </section>
  );
}
