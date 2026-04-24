import { EtfMorPortfolioHoldingRow, EtfMorPortfolioHoldings } from '@/types/prismaTypes';
import { buildEtfHoldingColumnDefs } from '@/utils/etf-holdings-utils';
import Link from 'next/link';

interface EtfHoldingsProps {
  data: EtfMorPortfolioHoldings | null;
  /** When set, only the first `maxRows` holdings are rendered. */
  maxRows?: number;
  /** When set and the full list is longer than `maxRows`, renders a "View more" link to this href. */
  viewMoreHref?: string;
  title?: string;
}

export default function EtfHoldings({ data, maxRows, viewMoreHref, title }: EtfHoldingsProps): JSX.Element | null {
  if (!data) return null;
  const list: EtfMorPortfolioHoldingRow[] = Array.isArray(data.holdings) ? data.holdings : [];
  if (list.length === 0) return null;

  const colDefs = buildEtfHoldingColumnDefs(data, list);
  const displayRows = typeof maxRows === 'number' ? list.slice(0, maxRows) : list;
  const showViewMore = Boolean(viewMoreHref) && typeof maxRows === 'number' && list.length > maxRows;

  const marketValueAsOf = list.find((h) => h.marketValueAsOfDate)?.marketValueAsOfDate ?? null;
  const subtitle = marketValueAsOf ? `Market value as of ${marketValueAsOf}.` : null;
  const resolvedTitle = title ?? (typeof maxRows === 'number' && list.length > maxRows ? `Top ${displayRows.length} Holdings` : 'Holdings');

  return (
    <section id="etf-holdings" className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mt-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-2 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-100">{resolvedTitle}</h2>
          {subtitle ? <p className="text-xs text-gray-400 mt-1">{subtitle}</p> : null}
        </div>
        <div className="text-xs text-gray-400">
          Showing {displayRows.length} of {list.length}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              {colDefs.map((c) => (
                <th key={c.field} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayRows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
                {colDefs.map((c) => {
                  const cellValue = row[c.field];
                  const isEmpty = cellValue === null || cellValue === undefined || String(cellValue).trim() === '';
                  return (
                    <td key={c.field} className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {isEmpty ? <span className="text-gray-500">&mdash;</span> : String(cellValue)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showViewMore && viewMoreHref ? (
        <div className="mt-4 flex justify-end">
          <Link href={viewMoreHref} className="text-sm font-medium link-color hover:underline">
            View more holdings &rarr;
          </Link>
        </div>
      ) : null}
    </section>
  );
}
