import { EtfMorReturnsRow } from '@/types/prismaTypes';

const PLACEHOLDER_TOKENS: ReadonlySet<string> = new Set(['', 'n/a', 'na', '-', '—', '–']);

function isPlaceholder(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const normalized = String(value).trim().toLowerCase();
  return PLACEHOLDER_TOKENS.has(normalized);
}

export interface EtfReturnsTableProps {
  rows: EtfMorReturnsRow[] | null | undefined;
  title?: string;
  subtitle?: string;
}

/**
 * Annual returns table sourced from `EtfMorAnalyzerInfo.returnsAnnual`.
 * Hides rows whose every cell is N/A / "—", and hides year columns where
 * none of the visible rows have a real value — so a fund with only YTD
 * data does not show ten empty year columns.
 *
 * Designed to render inside an existing `bg-gray-900` card (e.g. the ETF
 * category article), so it carries no outer card chrome of its own.
 */
export default function EtfReturnsTable({ rows, title = 'Returns', subtitle }: EtfReturnsTableProps): JSX.Element | null {
  const list: EtfMorReturnsRow[] = Array.isArray(rows) ? rows : [];
  if (list.length === 0) return null;

  const visibleRows = list.filter((row) => {
    const values = row?.values ?? {};
    return Object.values(values).some((v) => !isPlaceholder(v));
  });
  if (visibleRows.length === 0) return null;

  const periodOrder: string[] = [];
  const seen = new Set<string>();
  for (const row of visibleRows) {
    for (const key of Object.keys(row.values ?? {})) {
      if (!seen.has(key)) {
        seen.add(key);
        periodOrder.push(key);
      }
    }
  }

  const visiblePeriods = periodOrder.filter((period) => visibleRows.some((row) => !isPlaceholder(row.values?.[period])));
  if (visiblePeriods.length === 0) return null;

  return (
    <section id="etf-returns" className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-2 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-color">{title}</h2>
          {subtitle ? <p className="text-xs text-gray-400 mt-1">{subtitle}</p> : null}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Label</th>
              {visiblePeriods.map((p) => (
                <th key={p} className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {visibleRows.map((row, idx) => (
              <tr key={`${row.label}-${idx}`} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
                <td className="px-4 py-3 text-sm text-gray-200 font-medium whitespace-nowrap">{row.label}</td>
                {visiblePeriods.map((p) => {
                  const cell = row.values?.[p];
                  const empty = isPlaceholder(cell);
                  return (
                    <td key={p} className="px-4 py-3 text-sm text-gray-300 text-right whitespace-nowrap">
                      {empty ? <span className="text-gray-500">&mdash;</span> : String(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
