import EtfCompetitionQuadrantChart from '@/components/etf-reportsv1/EtfCompetitionQuadrantChart';
import type { EtfQuadrantDataPoint } from '@/util/etf-quadrant-chart-utils';
import Link from 'next/link';

export interface EtfCompetitionQuadrantWithLegendProps {
  dataPoints: EtfQuadrantDataPoint[];
  mainEtfSymbol: string;
  mainEtfName: string;
  heading: string;
  headingAs?: 'h2' | 'h3';
  description: string;
  descriptionItemProp?: 'abstract';
}

function dotColor(dp: EtfQuadrantDataPoint): string {
  if (dp.isMainEtf) return '#f59e0b';
  switch (dp.classification) {
    case 'Top Pick':
      return '#34d399';
    case 'Return Focused':
      return '#818cf8';
    case 'Cost Efficient':
      return '#38bdf8';
    case 'Underperform':
      return '#fb7185';
  }
}

export default function EtfCompetitionQuadrantWithLegend({
  dataPoints,
  mainEtfSymbol,
  mainEtfName,
  heading,
  headingAs = 'h3',
  description,
  descriptionItemProp,
}: EtfCompetitionQuadrantWithLegendProps): JSX.Element | null {
  if (dataPoints.length === 0) return null;

  const descriptionProps = descriptionItemProp ? { itemProp: descriptionItemProp } : {};

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="lg:w-1/2">
          {headingAs === 'h2' ? (
            <h2 className="text-xl font-semibold text-color mb-3">{heading}</h2>
          ) : (
            <h3 className="text-lg font-semibold text-color mb-3">{heading}</h3>
          )}

          <p className={headingAs === 'h2' ? 'text-color leading-relaxed mb-5' : 'text-sm text-gray-400 mb-4'} {...descriptionProps}>
            {description}
          </p>

          <div className="space-y-2.5" itemScope itemType="https://schema.org/ItemList">
            {dataPoints.map((dp, index) => {
              const href = !dp.isMainEtf && dp.exchange ? `/etfs/${dp.exchange.toUpperCase()}/${dp.symbol.toUpperCase()}` : null;

              const content = (
                <>
                  <meta itemProp="position" content={String(index + 1)} />
                  <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: dotColor(dp) }} />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className={dp.isMainEtf ? 'font-semibold text-amber-400' : 'text-gray-200 group-hover:text-[#F59E0B] transition-colors'}
                        itemProp="name"
                      >
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
                <Link
                  key={dp.symbol}
                  href={href}
                  className="flex items-start gap-2.5 text-sm group"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  {content}
                </Link>
              ) : (
                <div key={dp.symbol} className="flex items-start gap-2.5 text-sm" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-1/2">
          <EtfCompetitionQuadrantChart dataPoints={dataPoints} mainEtfSymbol={mainEtfSymbol} />
        </div>
      </div>

      {/* SEO-visible fallback table — Chart.js canvas is not crawlable by search engines. */}
      <div className="sr-only" aria-hidden="false">
        <table>
          <caption>
            Returns vs Efficiency comparison of {mainEtfName} ({mainEtfSymbol}) and peer ETFs
          </caption>
          <thead>
            <tr>
              <th>Fund</th>
              <th>Symbol</th>
              <th>Returns Score</th>
              <th>Efficiency Score</th>
              <th>Classification</th>
            </tr>
          </thead>
          <tbody>
            {dataPoints.map((dp) => (
              <tr key={dp.symbol}>
                <td>{dp.name}</td>
                <td>{dp.symbol}</td>
                <td>{dp.returnsScore.toFixed(0)}%</td>
                <td>{dp.efficiencyScore.toFixed(0)}%</td>
                <td>{dp.classification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
