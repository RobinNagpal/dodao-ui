import { EtfMorInfoOptionalWrapper } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/mor-info/route';
import {
  EtfMorAnalysis,
  EtfMorHoldings,
  EtfMorRiskPeriods,
  EtfMorPortfolioAssetAllocation,
  EtfMorPortfolioAssetAllocationRow,
  EtfMorPortfolioBondBreakdown,
  EtfMorPortfolioFixedIncomeStyle,
  EtfMorPortfolioHoldings,
  EtfMorPortfolioHoldingRow,
  EtfMorPortfolioSectorExposure,
  EtfMorPortfolioSectorExposureRow,
  EtfMorPortfolioStyleMeasures,
} from '@/types/prismaTypes';

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-2 border-b border-gray-700">
      <h2 className="text-xl font-bold text-gray-100">{title}</h2>
      {subtitle ? <div className="text-xs text-gray-400">{subtitle}</div> : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value?: string | null }): JSX.Element {
  const displayValue = value && String(value).trim() !== '' ? String(value) : 'N/A';
  const isNA = displayValue === 'N/A';

  return (
    <div className="bg-gray-800 px-3 py-2 rounded-md">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-sm font-medium ${isNA ? 'text-gray-500' : 'text-gray-200'}`}>{displayValue}</div>
    </div>
  );
}

function TextCard({ title, content, className = '' }: { title: string; content?: string | null; className?: string }): JSX.Element {
  if (!content || String(content).trim() === '') {
    return (
      <div className={`bg-gray-800 rounded-md p-4 ${className}`}>
        <h3 className="text-sm font-medium text-gray-200 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">No {title.toLowerCase()} available.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-md p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-200 mb-3">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{String(content)}</p>
    </div>
  );
}

function MetricGrid({ items }: { items: Array<{ label: string; value: unknown }> }): JSX.Element {
  const visible = items.filter((i) => i.value !== null && i.value !== undefined && String(i.value).trim() !== '');
  if (!visible.length) return <div className="text-sm text-gray-400">No data available.</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {visible.map((i) => (
        <MetricCard key={i.label} label={i.label} value={String(i.value)} />
      ))}
    </div>
  );
}

function DataTable({ columns, rows, title }: { columns: string[]; rows: Array<Record<string, unknown>>; title?: string }): JSX.Element {
  if (!rows.length) {
    return (
      <div className="bg-gray-800 rounded-md p-4 mt-4">
        {title && <h4 className="text-sm font-medium text-gray-200 mb-2">{title}</h4>}
        <p className="text-sm text-gray-500">No data available.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {title && <h4 className="text-sm font-medium text-gray-200 mb-3">{title}</h4>}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rows.map((r, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
                {columns.map((c) => {
                  const cellValue = (r as any)[c];
                  return (
                    <td key={c} className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {cellValue === null || cellValue === undefined || String(cellValue).trim() === '' ? (
                        <span className="text-gray-500">&mdash;</span>
                      ) : (
                        String(cellValue)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReturnsTable({ title, rows }: { title: string; rows: any }): JSX.Element {
  const r = (Array.isArray(rows) ? rows : []) as Array<{ label: string; values: Record<string, string> }>;
  if (!r.length) {
    return (
      <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h4 className="text-sm font-medium text-gray-200">{title}</h4>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-400">No {title.toLowerCase()} data available.</p>
        </div>
      </div>
    );
  }

  const columns = ['Label', ...Array.from(new Set(r.flatMap((x) => Object.keys(x.values ?? {}))))];
  const tableRows = r.map((x) => ({
    Label: x.label,
    ...x.values,
  }));

  return (
    <div className="mt-4">
      <div className="rounded-lg border border-gray-700 bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 sm:px-6">
          <h4 className="text-sm font-medium text-gray-100">{title}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap sm:px-6">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {tableRows.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-700">
                  {columns.map((c) => {
                    const cellValue = (r as any)[c];
                    return (
                      <td key={c} className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap sm:px-6">
                        {cellValue === null || cellValue === undefined || String(cellValue).trim() === '' ? (
                          <span className="text-gray-500">&mdash;</span>
                        ) : (
                          String(cellValue)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MorAnalysis({ analysis }: { analysis: EtfMorAnalysis | null }): JSX.Element {
  if (!analysis || !analysis.available) {
    return (
      <div className="bg-gray-800 rounded-md p-4">
        <p className="text-sm text-gray-400">No analysis available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <MetricCard label="Medalist Rating" value={analysis.medalistRating} />
        <MetricCard label="Headline" value={analysis.headline} />
      </div>

      {analysis.sections?.length ? (
        <div className="space-y-3">
          {analysis.sections.map((s, idx) => {
            const meta = [s.date, s.author, s.rating].filter(Boolean).join(' \u2022 ');
            return (
              <div key={idx} className="bg-gray-800 rounded-md px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <h5 className="text-sm font-semibold text-gray-200">{s.pillar}</h5>
                  {meta && <div className="text-xs text-gray-400">{meta}</div>}
                </div>
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{s.content}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-400">No analysis sections available.</div>
      )}
    </div>
  );
}

function MorHoldings({ holdings }: { holdings: EtfMorHoldings | null }): JSX.Element {
  if (!holdings) {
    return (
      <div className="bg-gray-800 rounded-md p-4">
        <p className="text-sm text-gray-400">No holdings data available.</p>
      </div>
    );
  }

  const metaItems = [
    { label: 'Portfolio Date', value: holdings.currentPortfolioDate },
    { label: 'Equity Holdings', value: holdings.equityHoldings },
    { label: 'Bond Holdings', value: holdings.bondHoldings },
    { label: 'Other Holdings', value: holdings.otherHoldings },
    { label: '% Assets in Top 10', value: holdings.pctAssetsInTop10 },
  ];

  const top = Array.isArray(holdings.topHoldings) ? holdings.topHoldings : [];
  const rows = top.map((h) => ({
    Name: h.name,
    'Portfolio Weight': h.portfolioWeight ?? '',
    'Market Value': h.marketValue ?? '',
    Sector: h.sector ?? '',
  }));

  return (
    <div className="space-y-4">
      <MetricGrid items={metaItems} />
      <DataTable title="Top Holdings" columns={['Name', 'Portfolio Weight', 'Market Value', 'Sector']} rows={rows} />
    </div>
  );
}

function MorRisk({ riskPeriods }: { riskPeriods: EtfMorRiskPeriods | null }): JSX.Element {
  if (!riskPeriods) {
    return (
      <div className="bg-gray-800 rounded-md p-4">
        <p className="text-sm text-gray-400">No risk data available.</p>
      </div>
    );
  }

  const periods = (['3-Yr', '5-Yr', '10-Yr'] as const).filter((p) => (riskPeriods as any)?.[p]);
  if (!periods.length) {
    return (
      <div className="bg-gray-800 rounded-md p-4">
        <p className="text-sm text-gray-400">No risk periods available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {periods.map((p) => {
        const d: any = (riskPeriods as any)[p];
        const score = d?.portfolioRiskScore ?? {};
        const rr = d?.morAnalyzerRiskReturn ?? {};
        const tables: Array<{ title: string; table: any }> = [
          { title: 'Risk & Volatility Measures', table: d?.riskAndVolatilityMeasures },
          { title: 'Capture Ratios', table: d?.marketVolatilityMeasures?.captureRatios },
          { title: 'Drawdown', table: d?.marketVolatilityMeasures?.drawdown },
          { title: 'Drawdown Dates', table: d?.marketVolatilityMeasures?.drawdownDates },
        ];

        return (
          <div key={p} className="bg-gray-800 rounded-md p-4">
            <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-gray-700">
              <h4 className="text-sm font-semibold text-gray-200">{p} Risk Analysis</h4>
              {d?.period && <div className="text-xs text-gray-400">{d.period}</div>}
            </div>

            <MetricGrid
              items={[
                { label: 'Risk Score', value: score.riskScore },
                { label: 'Risk Level', value: score.riskLevel },
                { label: 'Risk vs Category', value: rr.riskVsCategory },
                { label: 'Return vs Category', value: rr.returnVsCategory },
              ]}
            />

            {tables.map((t) => {
              const table = t.table as any;
              const columns = Array.isArray(table?.columns) ? (['Label', ...table.columns] as string[]) : null;
              const rows = Array.isArray(table?.rows)
                ? table.rows.map((r: any) => ({
                    Label: r.label,
                    ...(r.values ?? {}),
                  }))
                : [];
              if (!columns || !rows.length) return null;
              return <DataTable key={t.title} title={t.title} columns={columns} rows={rows} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

const ALLOCATION_FALLBACK_ORDER: Array<{ key: keyof EtfMorPortfolioAssetAllocationRow; label: string }> = [
  { key: 'investment', label: 'Investment' },
  { key: 'net', label: 'Net' },
  { key: 'short', label: 'Short' },
  { key: 'long', label: 'Long' },
  { key: 'category', label: 'Category' },
  { key: 'index', label: 'Index' },
];

function headerToAllocationField(header: string): keyof EtfMorPortfolioAssetAllocationRow | null {
  const h = header.toLowerCase().replace(/[.\s%]/g, '');
  if (h === 'net') return 'net';
  if (h === 'short') return 'short';
  if (h === 'long') return 'long';
  if (h === 'investment' || h === 'inv') return 'investment';
  if (h === 'cat' || h === 'category' || h === 'cataverage' || h === 'catavg') return 'category';
  if (h === 'index') return 'index';
  return null;
}

function MorPortfolioAssetAllocationBlock({ data }: { data: EtfMorPortfolioAssetAllocation | null }): JSX.Element | null {
  const rows = data?.rows?.length ? data.rows : [];
  if (!rows.length) return null;

  // Prefer the column headers the lambda captured — they carry the exact
  // MOR wording ("Net", "Cat.", "Investment", etc.) that matches the
  // data keys on each row. Fall back to inferring columns from populated
  // row keys if the payload is missing headers.
  let colDefs: Array<{ label: string; field: keyof EtfMorPortfolioAssetAllocationRow }> = [];

  if (data?.columns?.length) {
    for (const label of data.columns) {
      const field = headerToAllocationField(label);
      if (!field) continue;
      if (!rows.some((r) => r[field] != null && String(r[field]).trim() !== '')) continue;
      colDefs.push({ label, field });
    }
  }

  if (!colDefs.length) {
    colDefs = ALLOCATION_FALLBACK_ORDER.filter((c) => rows.some((r) => r[c.key] != null && String(r[c.key]).trim() !== '')).map((c) => ({
      label: c.label,
      field: c.key,
    }));
  }

  if (!colDefs.length) return null;

  const tableRows = rows.map((r) => {
    const row: Record<string, unknown> = { 'Asset class': r.assetClass };
    for (const { label, field } of colDefs) {
      row[label] = r[field] ?? '';
    }
    return row;
  });

  const columns = ['Asset class', ...colDefs.map((c) => c.label)];

  return <DataTable title="Asset allocation" columns={columns} rows={tableRows} />;
}

function MorPortfolioStyleMeasuresBlock({ data }: { data: EtfMorPortfolioStyleMeasures | null }): JSX.Element | null {
  const rows = data?.rows?.length ? data.rows : [];
  if (!rows.length) return null;
  const tableRows = rows.map((r) => ({
    Measure: r.measure,
    Investment: r.investment ?? '',
    'Cat. average': r.categoryAverage ?? '',
    Index: r.index ?? '',
  }));
  return <DataTable title="Style measures" columns={['Measure', 'Investment', 'Cat. average', 'Index']} rows={tableRows} />;
}

function MorPortfolioFixedIncomeStyleBlock({ data }: { data: EtfMorPortfolioFixedIncomeStyle | null }): JSX.Element | null {
  const rows = data?.rows?.length ? data.rows : [];
  if (!rows.length) return null;
  const tableRows = rows.map((r) => ({
    Measure: r.measure,
    Investment: r.investment ?? '',
    'Category average': r.categoryAverage ?? '',
  }));
  return <DataTable title="Fixed income style" columns={['Measure', 'Investment', 'Category average']} rows={tableRows} />;
}

function sectorRowsToTable(rows: EtfMorPortfolioSectorExposureRow[], showGroup: boolean): Array<Record<string, unknown>> {
  return rows.map((r) => {
    const row: Record<string, unknown> = { Sector: r.sector };
    if (showGroup) row.Group = r.group ?? '';
    row['Investment %'] = r.investmentPct ?? '';
    row['Comparison %'] = r.comparisonPct ?? '';
    return row;
  });
}

function MorPortfolioSectorExposureBlock({ data }: { data: EtfMorPortfolioSectorExposure | null }): JSX.Element | null {
  if (!data) return null;
  const cat = data.vsCategoryPct ?? [];
  const idx = data.vsIndexPct ?? [];
  if (!cat.length && !idx.length) return null;

  // Equity sector rows carry a Cyclical/Sensitive/Defensive group label;
  // fixed income sector rows do not. Drop the column when there's nothing
  // to show in it.
  const showGroup = data.type === 'EQUITY' || cat.some((r) => r.group && r.group.trim() !== '') || idx.some((r) => r.group && r.group.trim() !== '');

  const columns = showGroup ? ['Sector', 'Group', 'Investment %', 'Comparison %'] : ['Sector', 'Investment %', 'Comparison %'];

  return (
    <div className="space-y-4">
      {cat.length > 0 ? <DataTable title="Sector exposure (vs. category %)" columns={columns} rows={sectorRowsToTable(cat, showGroup)} /> : null}
      {idx.length > 0 ? <DataTable title="Sector exposure (vs. index %)" columns={columns} rows={sectorRowsToTable(idx, showGroup)} /> : null}
    </div>
  );
}

function MorPortfolioBondBreakdownBlock({ data }: { data: EtfMorPortfolioBondBreakdown | null }): JSX.Element | null {
  if (!data) return null;
  const cat = data.vsCategoryPct ?? [];
  const idx = data.vsIndexPct ?? [];
  if (!cat.length && !idx.length) return null;

  const toRows = (rows: typeof cat) =>
    rows.map((r) => ({
      Grade: r.grade,
      'Investment %': r.investmentPct ?? '',
      'Comparison %': r.comparisonPct ?? '',
    }));

  return (
    <div className="space-y-4">
      {cat.length > 0 ? <DataTable title="Credit quality (vs. category %)" columns={['Grade', 'Investment %', 'Comparison %']} rows={toRows(cat)} /> : null}
      {idx.length > 0 ? <DataTable title="Credit quality (vs. index %)" columns={['Grade', 'Investment %', 'Comparison %']} rows={toRows(idx)} /> : null}
    </div>
  );
}

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

function buildHoldingColumnDefs(data: EtfMorPortfolioHoldings): HoldingColumnDef[] {
  const list = Array.isArray(data.holdings) ? data.holdings : [];
  const hasValue = (field: keyof EtfMorPortfolioHoldingRow): boolean => list.some((row) => row[field] != null && String(row[field]).trim() !== '');

  const defs: HoldingColumnDef[] = [];
  const seen = new Set<keyof EtfMorPortfolioHoldingRow>();
  const push = (field: keyof EtfMorPortfolioHoldingRow, label?: string): void => {
    if (seen.has(field)) return;
    if (field !== 'name' && !hasValue(field)) return;
    seen.add(field);
    defs.push({ field, label: label ?? HOLDING_FIELD_LABELS[field] });
  };

  push('name');

  // If the scraper captured the MOR column order, prefer it so the
  // table matches what the user sees on MOR.com. Skip premium /
  // unknown columns that don't map to a known field.
  if (Array.isArray(data.columns) && data.columns.length > 0) {
    for (const header of data.columns) {
      const field = holdingHeaderToField(header);
      if (!field || field === 'name') continue;
      push(field, HOLDING_FIELD_LABELS[field]);
    }
  }

  // Backfill any fields that have values but weren't in the header list
  // (e.g. scraped currency that lambda inferred but header omitted).
  for (const field of HOLDING_FIELD_ORDER) {
    push(field);
  }

  return defs;
}

function MorPortfolioHoldingsBlock({ data }: { data: EtfMorPortfolioHoldings | null }): JSX.Element | null {
  if (!data) return null;
  const summary = data.summary ?? {};
  const metaItems = [
    { label: 'Equity holdings', value: summary.equityHoldings },
    { label: 'Bond holdings', value: summary.bondHoldings },
    { label: 'Other holdings', value: summary.otherHoldings },
    { label: 'Total holdings', value: summary.totalHoldings },
    { label: '% assets in top 10', value: summary.pctAssetsInTop10Holdings },
    { label: 'Reported turnover %', value: summary.reportedTurnoverPct },
    { label: 'Turnover as of', value: summary.turnoverAsOfDate },
    { label: 'Women directors %', value: summary.womenDirectorsPct },
    { label: 'Women executives %', value: summary.womenExecutivesPct },
  ];

  const list = Array.isArray(data.holdings) ? data.holdings : [];
  const colDefs = buildHoldingColumnDefs(data);

  const holdingRows = list.map((h) => {
    const row: Record<string, unknown> = {};
    for (const { label, field } of colDefs) {
      row[label] = h[field] ?? '';
    }
    return row;
  });

  const hasSummary = metaItems.some((m) => m.value != null && String(m.value).trim() !== '');
  const hasList = holdingRows.length > 0;

  if (!hasSummary && !hasList) return null;

  // Surface the "market value as of" date once at the block level instead of
  // forcing it into every row — all rows share the same date within a fund.
  const marketValueAsOf = list.find((h) => h.marketValueAsOfDate)?.marketValueAsOfDate ?? null;
  const detailSubtitle = marketValueAsOf ? `Full holdings from MOR. Market value as of ${marketValueAsOf}.` : 'Full holdings from MOR.';

  return (
    <div className="space-y-4">
      {hasSummary ? <MetricGrid items={metaItems} /> : null}
      {hasList ? (
        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
            <h4 className="text-sm font-medium text-gray-200">Holdings detail ({holdingRows.length})</h4>
            <p className="text-xs text-gray-500 mt-1">{detailSubtitle}</p>
          </div>
          <div className="max-h-[32rem] overflow-auto -mt-4">
            <DataTable columns={colDefs.map((c) => c.label)} rows={holdingRows} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function morPortfolioHasContent(portfolio: EtfMorInfoOptionalWrapper['morPortfolioInfo']): boolean {
  if (!portfolio) return false;
  const aa = portfolio.assetAllocation as EtfMorPortfolioAssetAllocation | null;
  if (aa?.rows?.length) return true;
  const sm = portfolio.styleMeasures as EtfMorPortfolioStyleMeasures | null;
  if (sm?.rows?.length) return true;
  const fi = portfolio.fixedIncomeStyle as EtfMorPortfolioFixedIncomeStyle | null;
  if (fi?.rows?.length) return true;
  const se = portfolio.sectorExposure as EtfMorPortfolioSectorExposure | null;
  if (se?.vsCategoryPct?.length || se?.vsIndexPct?.length) return true;
  const bb = portfolio.bondBreakdown as EtfMorPortfolioBondBreakdown | null;
  if (bb?.vsCategoryPct?.length || bb?.vsIndexPct?.length) return true;
  const h = portfolio.holdings as EtfMorPortfolioHoldings | null;
  if (h?.holdings?.length) return true;
  if (h?.summary && Object.values(h.summary).some((v) => v != null && String(v).trim() !== '')) return true;
  return false;
}

function MorPortfolio({ portfolio }: { portfolio: NonNullable<EtfMorInfoOptionalWrapper['morPortfolioInfo']> }): JSX.Element {
  const assetAllocation = portfolio.assetAllocation as EtfMorPortfolioAssetAllocation | null;
  const styleMeasures = portfolio.styleMeasures as EtfMorPortfolioStyleMeasures | null;
  const fixedIncomeStyle = portfolio.fixedIncomeStyle as EtfMorPortfolioFixedIncomeStyle | null;
  const sectorExposure = portfolio.sectorExposure as EtfMorPortfolioSectorExposure | null;
  const bondBreakdown = portfolio.bondBreakdown as EtfMorPortfolioBondBreakdown | null;
  const holdings = portfolio.holdings as EtfMorPortfolioHoldings | null;

  return (
    <div className="space-y-6">
      <MorPortfolioAssetAllocationBlock data={assetAllocation} />
      <MorPortfolioStyleMeasuresBlock data={styleMeasures} />
      <MorPortfolioFixedIncomeStyleBlock data={fixedIncomeStyle} />
      <MorPortfolioSectorExposureBlock data={sectorExposure} />
      <MorPortfolioBondBreakdownBlock data={bondBreakdown} />
      <MorPortfolioHoldingsBlock data={holdings} />
    </div>
  );
}

export default function EtfMorInfo({ data }: { data: EtfMorInfoOptionalWrapper }): JSX.Element {
  const analyzer = data.morAnalyzerInfo;
  const people = data.morPeopleInfo;
  const risk = data.morRiskInfo;
  const portfolio = data.morPortfolioInfo;

  const analysis = (analyzer?.analysis ?? null) as unknown as EtfMorAnalysis | null;
  const holdings = (analyzer?.holdings ?? null) as unknown as EtfMorHoldings | null;
  const riskPeriods = (risk?.riskPeriods ?? null) as unknown as EtfMorRiskPeriods | null;

  const returnsAnnual = analyzer?.returnsAnnual ?? null;
  const returnsTrailing = analyzer?.returnsTrailing ?? null;

  const currentManagers = (people?.currentManagers ?? []) as any[];
  const currentManagerRows = Array.isArray(currentManagers)
    ? currentManagers.map((m) => ({
        Name: m.name ?? '',
        'Start Date': m.startDate ?? '',
        'End Date': m.endDate ?? '',
        Range: m.dateRangeText ?? '',
      }))
    : [];

  const hasAny =
    Boolean(analyzer) ||
    Boolean(risk) ||
    Boolean(people) ||
    Boolean(analyzer?.analysis) ||
    Boolean(analyzer?.holdings) ||
    Boolean(risk?.riskPeriods) ||
    Boolean(people?.currentManagers) ||
    morPortfolioHasContent(portfolio);

  const updatedAt =
    analyzer?.updatedAt ??
    risk?.updatedAt ??
    people?.updatedAt ??
    portfolio?.updatedAt ??
    analyzer?.createdAt ??
    risk?.createdAt ??
    people?.createdAt ??
    portfolio?.createdAt ??
    null;
  const updatedLabel = updatedAt ? `Last updated: ${new Date(updatedAt as any).toLocaleString('en-US')}` : undefined;

  return (
    <section id="etf-mor-info" className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mt-6">
      <SectionHeading title="Detailed Financial Data" subtitle={updatedLabel} />

      {!hasAny ? (
        <div className="mt-6 bg-gray-800 rounded-md p-6 text-center">
          <p className="text-gray-400">No detailed financial data saved yet.</p>
          <p className="text-sm text-gray-500 mt-1">Use the admin panel to trigger data collection.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Overview</h3>
            <MetricGrid
              items={[
                { label: 'NAV', value: analyzer?.overviewNav },
                { label: '1-Day Return', value: analyzer?.overviewOneDayReturn },
                { label: 'Total Assets', value: analyzer?.overviewTotalAssets },
                { label: 'Adj. Expense Ratio', value: analyzer?.overviewAdjExpenseRatio },
                { label: 'Prospectus Net Expense Ratio', value: analyzer?.overviewProspectusNetExpenseRatio },
                { label: 'Category', value: analyzer?.overviewCategory },
                { label: 'Style Box', value: analyzer?.overviewStyleBox },
                { label: 'SEC Yield', value: analyzer?.overviewSecYield },
                { label: 'TTM Yield', value: analyzer?.overviewTtmYield },
                { label: 'Turnover', value: analyzer?.overviewTurnover },
                { label: 'Status', value: analyzer?.overviewStatus },
                { label: 'Market NAV', value: analyzer?.marketNav },
                { label: 'Open Price', value: analyzer?.marketOpenPrice },
                { label: 'Bid / Ask / Spread', value: analyzer?.marketBidAskSpread },
                { label: 'Volume / Avg', value: analyzer?.marketVolumeAvg },
                { label: 'Day Range', value: analyzer?.marketDayRange },
                { label: 'Year Range', value: analyzer?.marketYearRange },
              ]}
            />
            {analyzer?.strategyText && <TextCard title="Investment Strategy" content={analyzer.strategyText} className="mt-4" />}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Analysis</h3>
            <MorAnalysis analysis={analysis} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Returns</h3>
            <ReturnsTable title="Annual Returns" rows={returnsAnnual} />
            <ReturnsTable title="Trailing Returns" rows={returnsTrailing} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Holdings</h3>
            <MorHoldings holdings={holdings} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Portfolio breakdown</h3>
            <p className="text-xs text-gray-500 mb-4">Asset mix, style and sector exposure, bond quality views, and full holdings page.</p>
            {portfolio && morPortfolioHasContent(portfolio) ? (
              <MorPortfolio portfolio={portfolio} />
            ) : (
              <div className="bg-gray-800 rounded-md p-4">
                <p className="text-sm text-gray-400">No portfolio breakdown saved yet.</p>
                <p className="text-sm text-gray-500 mt-1">Trigger &quot;Mor Portfolio&quot; from the admin ETF reports tool to collect this data.</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Risk Analysis</h3>
            <MorRisk riskPeriods={riskPeriods} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Management</h3>
            <MetricGrid
              items={[
                { label: 'Inception Date', value: people?.inceptionDate },
                { label: 'Number of Managers', value: people?.numberOfManagers },
                { label: 'Longest Tenure', value: people?.longestTenure },
                { label: 'Advisors', value: people?.advisors },
                { label: 'Average Tenure', value: people?.averageTenure },
              ]}
            />
            <DataTable title="Current Managers" columns={['Name', 'Start Date', 'End Date', 'Range']} rows={currentManagerRows} />
          </div>
        </div>
      )}
    </section>
  );
}
