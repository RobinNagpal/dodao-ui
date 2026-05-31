import { EtfMorPortfolioHoldingRow, EtfMorPortfolioHoldings } from '@/types/prismaTypes';
import { buildEtfHoldingColumnDefs } from '@/utils/etf-holdings-utils';
import CardSection from '@/components/ui/sections/CardSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EtfHoldingsProps {
  data: EtfMorPortfolioHoldings | null;
  /** When set, only the first `maxRows` holdings are rendered. */
  maxRows?: number;
  /** When set and the full list is longer than `maxRows`, renders a "View more" link to this href. */
  viewMoreHref?: string;
  title?: string;
  /** Optional content rendered inside the same black card, after the holdings table. */
  relatedSections?: ReactNode;
}

export default function EtfHoldings({ data, maxRows, viewMoreHref, title, relatedSections }: EtfHoldingsProps): JSX.Element | null {
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
    <CardSection id="etf-holdings" padding="normal" mt="md" mb="lg">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-2 border-b border-border">
        <div>
          <SectionHeading as="h2" weight="bold" className="text-heading mb-0">
            {resolvedTitle}
          </SectionHeading>
          {subtitle ? <p className="text-xs text-muted mt-1">{subtitle}</p> : null}
        </div>
        <div className="text-xs text-muted">
          Showing {displayRows.length} of {list.length}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full">
          <thead className="bg-surface-2">
            <tr>
              {colDefs.map((c) => (
                <th key={c.field} className="px-4 py-3 text-left text-xs font-medium text-body uppercase tracking-wider whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayRows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-2'}>
                {colDefs.map((c) => {
                  const cellValue = row[c.field];
                  const isEmpty = cellValue === null || cellValue === undefined || String(cellValue).trim() === '';
                  return (
                    <td key={c.field} className="px-4 py-3 text-sm text-body whitespace-nowrap">
                      {isEmpty ? <span className="text-muted">&mdash;</span> : String(cellValue)}
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

      {relatedSections}
    </CardSection>
  );
}
