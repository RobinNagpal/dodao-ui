import { EtfMorInfoOptionalWrapper } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/mor-info/route';
import { EtfMorAnalysis, EtfMorHoldings, EtfMorRiskPeriods } from '@/types/prismaTypes';

function SectionHeading({ title }: { title: string }): JSX.Element {
  return <h2 className="text-lg font-semibold text-gray-100">{title}</h2>;
}

function KeyValueGrid({ items }: { items: Array<{ label: string; value: unknown }> }): JSX.Element {
  const visible = items.filter((i) => i.value !== null && i.value !== undefined && String(i.value).trim() !== '');
  if (!visible.length) return <div className="text-sm text-gray-400">No data available.</div>;

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
      {visible.map((i) => (
        <div key={i.label} className="flex justify-between gap-4 border-b border-gray-800/70 py-2">
          <dt className="text-sm text-gray-400">{i.label}</dt>
          <dd className="text-sm text-gray-200 text-right break-words">{String(i.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: Array<Record<string, unknown>> }): JSX.Element {
  if (!rows.length) return <div className="text-sm text-gray-400">No rows.</div>;

  return (
    <div className="overflow-x-auto mt-3">
      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-gray-900/60">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((r, idx) => (
            <tr key={idx} className="bg-gray-900/20">
              {columns.map((c) => (
                <td key={c} className="px-3 py-2 text-sm text-gray-200 whitespace-nowrap">
                  {r[c] === null || r[c] === undefined || String(r[c]).trim() === '' ? '—' : String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderReturnsBlock(title: string, rows: any): JSX.Element {
  const r = (Array.isArray(rows) ? rows : []) as Array<{ label: string; values: Record<string, string> }>;
  if (!r.length) return <div className="text-sm text-gray-400 mt-2">No {title.toLowerCase()} data.</div>;

  const columns = ['Label', ...Array.from(new Set(r.flatMap((x) => Object.keys(x.values ?? {}))))];
  const tableRows = r.map((x) => ({
    Label: x.label,
    ...x.values,
  }));

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-gray-200">{title}</div>
      <SimpleTable columns={columns} rows={tableRows} />
    </div>
  );
}

function MorAnalysis({ analysis }: { analysis: EtfMorAnalysis | null }): JSX.Element {
  if (!analysis || !analysis.available) {
    return <div className="text-sm text-gray-400 mt-2">No Morningstar analysis available.</div>;
  }

  return (
    <div className="mt-3 space-y-3">
      <KeyValueGrid
        items={[
          { label: 'Medalist Rating', value: analysis.medalistRating },
          { label: 'Headline', value: analysis.headline },
        ]}
      />
      {analysis.sections?.length ? (
        <div className="mt-4 space-y-4">
          {analysis.sections.map((s, idx) => (
            <div key={idx} className="rounded-md border border-gray-800 bg-gray-900/30 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm font-semibold text-gray-100">{s.pillar}</div>
                <div className="text-xs text-gray-400">{[s.date, s.author, s.rating].filter(Boolean).join(' • ')}</div>
              </div>
              <div className="text-sm text-gray-200 mt-2 whitespace-pre-wrap">{s.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400">No analysis sections.</div>
      )}
    </div>
  );
}

function MorHoldings({ holdings }: { holdings: EtfMorHoldings | null }): JSX.Element {
  if (!holdings) return <div className="text-sm text-gray-400 mt-2">No holdings data.</div>;

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
    <div className="mt-3">
      <KeyValueGrid items={metaItems} />
      <div className="mt-4">
        <div className="text-sm font-medium text-gray-200">Top Holdings</div>
        <SimpleTable columns={['Name', 'Portfolio Weight', 'Market Value', 'Sector']} rows={rows} />
      </div>
    </div>
  );
}

function MorRisk({ riskPeriods }: { riskPeriods: EtfMorRiskPeriods | null }): JSX.Element {
  if (!riskPeriods) return <div className="text-sm text-gray-400 mt-2">No risk data.</div>;

  const periods = (['3-Yr', '5-Yr', '10-Yr'] as const).filter((p) => (riskPeriods as any)?.[p]);
  if (!periods.length) return <div className="text-sm text-gray-400 mt-2">No risk periods available.</div>;

  return (
    <div className="mt-3 space-y-4">
      {periods.map((p) => {
        const d: any = (riskPeriods as any)[p];
        const score = d?.portfolioRiskScore ?? {};
        const rr = d?.morningstarRiskReturn ?? {};
        const tables: Array<{ title: string; table: any }> = [
          { title: 'Risk & Volatility Measures', table: d?.riskAndVolatilityMeasures },
          { title: 'Capture Ratios', table: d?.marketVolatilityMeasures?.captureRatios },
          { title: 'Drawdown', table: d?.marketVolatilityMeasures?.drawdown },
          { title: 'Drawdown Dates', table: d?.marketVolatilityMeasures?.drawdownDates },
        ];

        return (
          <div key={p} className="rounded-md border border-gray-800 bg-gray-900/30 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-100">{p}</div>
              <div className="text-xs text-gray-400">{d?.period}</div>
            </div>

            <KeyValueGrid
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
              if (!columns) return null;
              return (
                <div key={t.title} className="mt-4">
                  <div className="text-sm font-medium text-gray-200">{t.title}</div>
                  <SimpleTable columns={columns} rows={rows} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function EtfMorInfo({ data }: { data: EtfMorInfoOptionalWrapper }): JSX.Element {
  const analyzer = data.morAnalyzerInfo;
  const people = data.morPeopleInfo;
  const risk = data.morRiskInfo;

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

  return (
    <section id="etf-mor-info" className="bg-gray-900 rounded-lg shadow-sm px-2 py-2 sm:p-3 mt-6">
      <SectionHeading title="Morningstar Data" />

      <div className="mt-5 space-y-8">
        <div>
          <div className="text-sm font-semibold text-gray-100">Overview</div>
          <KeyValueGrid
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
              { label: 'Strategy', value: analyzer?.strategyText },
            ]}
          />
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-100">Analysis</div>
          <MorAnalysis analysis={analysis} />
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-100">Returns</div>
          {renderReturnsBlock('Annual Returns', returnsAnnual)}
          {renderReturnsBlock('Trailing Returns', returnsTrailing)}
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-100">Holdings</div>
          <MorHoldings holdings={holdings} />
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-100">Risk</div>
          <MorRisk riskPeriods={riskPeriods} />
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-100">People</div>
          <KeyValueGrid
            items={[
              { label: 'Inception Date', value: people?.inceptionDate },
              { label: 'Number of Managers', value: people?.numberOfManagers },
              { label: 'Longest Tenure', value: people?.longestTenure },
              { label: 'Advisors', value: people?.advisors },
              { label: 'Average Tenure', value: people?.averageTenure },
            ]}
          />
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-200">Current Managers</div>
            <SimpleTable columns={['Name', 'Start Date', 'End Date', 'Range']} rows={currentManagerRows} />
          </div>
        </div>
      </div>
    </section>
  );
}
