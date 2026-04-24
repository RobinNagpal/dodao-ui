import EtfCompetitionQuadrantWithLegend from '@/components/etf-reportsv1/EtfCompetitionQuadrantWithLegend';
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
 * Compact Competition section rendered on the ETF detail page. Renders as a
 * Server Component — only the inner Chart.js canvas ships as client JS, so the
 * peer-list legend, heading, SEO table, and "View Full Analysis" link are all
 * present in the initial server HTML (good for SEO + first paint).
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

        <EtfCompetitionQuadrantWithLegend
          dataPoints={quadrantDataPoints}
          mainEtfSymbol={mainEtf.symbol}
          mainEtfName={mainEtf.name}
          heading="Returns vs Efficiency"
          headingAs="h3"
          description={`Compare ${mainEtf.name} (${mainEtf.symbol}) against peer ETFs on past returns + future outlook (vertical) vs cost efficiency + risk (horizontal).`}
        />
      </div>
    </section>
  );
}
