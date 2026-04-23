import { EtfMorPortfolioHoldingRow, EtfMorPortfolioHoldings } from '@/types/prismaTypes';
import Link from 'next/link';

type HoldingColumnDef = { label: string; field: keyof EtfMorPortfolioHoldingRow };

const HOLDING_FIELD_ORDER: Array<keyof EtfMorPortfolioHoldingRow> = [
  'portfolioWeightPct',
  'firstBought',
  'marketValue',
  'currency',
  'oneYearReturn',
  'forwardPE',
  'maturityDate',
  'couponRate',
  'sector',
];

const HOLDING_FIELD_LABELS: Record<keyof EtfMorPortfolioHoldingRow, string> = {
  name: 'Name',
  portfolioWeightPct: 'Weight %',
  firstBought: 'First bought',
  marketValue: 'Market value',
  marketValueAsOfDate: 'Market value as of',
  currency: 'Cur',
  oneYearReturn: '1Y return',
  forwardPE: 'Fwd P/E',
  maturityDate: 'Maturity',
  couponRate: 'Coupon %',
  sector: 'Sector',
};

function holdingHeaderToField(header: string): keyof EtfMorPortfolioHoldingRow | null {
  const h = header.toLowerCase().replace(/\s+/g, ' ').trim();
  if (h === 'holdings' || h === 'name') return 'name';
  if (h === '% portfolio weight' || h === 'portfolio weight' || h === 'weight %' || h === 'weight') return 'portfolioWeightPct';
  if (h === 'first bought') return 'firstBought';
  if (h.startsWith('market value')) return 'marketValue';
  if (h === 'cur' || h === 'currency') return 'currency';
  if (h === '1-year return' || h === '1 year return' || h === '1y return') return 'oneYearReturn';
  if (h === 'forward p/e' || h === 'fwd p/e') return 'forwardPE';
  if (h === 'maturity date' || h === 'maturity') return 'maturityDate';
  if (h === 'coupon rate' || h === 'coupon' || h === 'coupon %') return 'couponRate';
  if (h === 'sector') return 'sector';
  return null;
}

/**
 * Build the ordered list of columns to render for this ETF's holdings,
 * skipping any column whose rows are all empty. The optional `columns`
 * metadata on the payload preserves the source order when present.
 */
export function buildEtfHoldingColumnDefs(data: EtfMorPortfolioHoldings, rows: EtfMorPortfolioHoldingRow[]): HoldingColumnDef[] {
  const hasValue = (field: keyof EtfMorPortfolioHoldingRow): boolean => rows.some((row) => row[field] != null && String(row[field]).trim() !== '');

  const defs: HoldingColumnDef[] = [];
  const seen = new Set<keyof EtfMorPortfolioHoldingRow>();
  const push = (field: keyof EtfMorPortfolioHoldingRow, label?: string): void => {
    if (seen.has(field)) return;
    if (field !== 'name' && !hasValue(field)) return;
    seen.add(field);
    defs.push({ field, label: label ?? HOLDING_FIELD_LABELS[field] });
  };

  push('name');

  if (Array.isArray(data.columns) && data.columns.length > 0) {
    for (const header of data.columns) {
      const field = holdingHeaderToField(header);
      if (!field || field === 'name') continue;
      push(field, HOLDING_FIELD_LABELS[field]);
    }
  }

  for (const field of HOLDING_FIELD_ORDER) {
    push(field);
  }

  return defs;
}

interface EtfHoldingsProps {
  data: EtfMorPortfolioHoldings | null;
  /** When set, only the first `maxRows` holdings are rendered. */
  maxRows?: number;
  /** When set and the full list is longer than `maxRows`, renders a "View more" link to this href. */
  viewMoreHref?: string;
  title?: string;
}

export default function EtfHoldings({ data, maxRows, viewMoreHref, title = 'Top Holdings' }: EtfHoldingsProps): JSX.Element | null {
  if (!data) return null;
  const list: EtfMorPortfolioHoldingRow[] = Array.isArray(data.holdings) ? data.holdings : [];
  if (list.length === 0) return null;

  const colDefs = buildEtfHoldingColumnDefs(data, list);
  const displayRows = typeof maxRows === 'number' ? list.slice(0, maxRows) : list;
  const showViewMore = Boolean(viewMoreHref) && typeof maxRows === 'number' && list.length > maxRows;

  const marketValueAsOf = list.find((h) => h.marketValueAsOfDate)?.marketValueAsOfDate ?? null;
  const subtitle = marketValueAsOf ? `Market value as of ${marketValueAsOf}.` : null;

  return (
    <section id="etf-holdings" className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mt-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-2 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-100">{title}</h2>
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
              <tr key={`${row.name}-${idx}`} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
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
          <Link href={viewMoreHref} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
            View more holdings &rarr;
          </Link>
        </div>
      ) : null}
    </section>
  );
}
