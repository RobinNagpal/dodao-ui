import { EtfMorInfoOptionalWrapper } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/mor-info/route';
import { EtfMorAnalysis, EtfMorHoldings, EtfMorRiskPeriods } from '@/types/prismaTypes';

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
      {subtitle ? <div className="text-xs text-gray-400">{subtitle}</div> : null}
    </div>
  );
}

function MetricCard({ label, value, accent = false }: { label: string; value?: string | null; accent?: boolean }): JSX.Element {
  const displayValue = value && String(value).trim() !== '' ? String(value) : 'N/A';
  const isNA = displayValue === 'N/A';

  return (
    <div className={`px-3 py-2 rounded-lg border ${accent ? 'bg-blue-950/30 border-blue-800/50' : 'bg-gray-800/50 border-gray-700/50'}`}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-sm font-medium ${isNA ? 'text-gray-500' : accent ? 'text-blue-200' : 'text-gray-200'}`}>{displayValue}</div>
    </div>
  );
}

function TextCard({ title, content, className = '' }: { title: string; content?: string | null; className?: string }): JSX.Element {
  if (!content || String(content).trim() === '') {
    return (
      <div className={`bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 ${className}`}>
        <h3 className="text-sm font-medium text-gray-200 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">No {title.toLowerCase()} available.</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-200 mb-3">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{String(content)}</p>
    </div>
  );
}

function MetricGrid({ items }: { items: Array<{ label: string; value: unknown; accent?: boolean }> }): JSX.Element {
  const visible = items.filter((i) => i.value !== null && i.value !== undefined && String(i.value).trim() !== '');
  if (!visible.length) return <div className="text-sm text-gray-400">No data available.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
      {visible.map((i) => (
        <MetricCard key={i.label} label={i.label} value={String(i.value)} accent={i.accent} />
      ))}
    </div>
  );
}

function DataTable({ columns, rows, title }: { columns: string[]; rows: Array<Record<string, unknown>>; title?: string }): JSX.Element {
  if (!rows.length) {
    return (
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4 mt-4">
        {title && <h4 className="text-sm font-medium text-amber-200 mb-2">{title}</h4>}
        <p className="text-sm text-amber-300/70">No data available.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {title && <h4 className="text-sm font-medium text-gray-200 mb-3">{title}</h4>}
      <div className="overflow-x-auto rounded-lg border border-emerald-800/30 bg-emerald-950/20">
        <table className="min-w-full">
          <thead className="bg-emerald-900/40">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-800/20">
            {rows.map((r, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-emerald-950/10' : 'bg-emerald-950/25'}>
                {columns.map((c) => {
                  const cellValue = (r as any)[c];
                  return (
                    <td key={c} className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {cellValue === null || cellValue === undefined || String(cellValue).trim() === '' ? (
                        <span className="text-gray-500">—</span>
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
      <div className="bg-purple-950/20 border border-purple-800/30 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-medium text-purple-200 mb-2">{title}</h4>
        <p className="text-sm text-purple-300/70">No {title.toLowerCase()} data available.</p>
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
      <h4 className="text-sm font-medium text-gray-200 mb-3">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-purple-800/30 bg-purple-950/20">
        <table className="min-w-full">
          <thead className="bg-purple-900/40">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-800/20">
            {tableRows.map((r, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-purple-950/10' : 'bg-purple-950/25'}>
                {columns.map((c) => {
                  const cellValue = (r as any)[c];
                  return (
                    <td key={c} className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {cellValue === null || cellValue === undefined || String(cellValue).trim() === '' ? (
                        <span className="text-gray-500">—</span>
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

function MorAnalysis({ analysis }: { analysis: EtfMorAnalysis | null }): JSX.Element {
  if (!analysis || !analysis.available) {
    return (
      <div className="bg-orange-950/20 border border-orange-800/30 rounded-lg p-4 mt-4">
        <p className="text-sm text-orange-300/70">No analysis available.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Rating & Headline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard label="Medalist Rating" value={analysis.medalistRating} accent />
        <MetricCard label="Headline" value={analysis.headline} />
      </div>

      {/* Analysis Sections */}
      {analysis.sections?.length ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-200">Analysis Sections</h4>
          {analysis.sections.map((s, idx) => {
            const meta = [s.date, s.author, s.rating].filter(Boolean).join(' • ');
            return (
              <div key={idx} className="bg-indigo-950/20 border border-indigo-800/30 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h5 className="text-sm font-semibold text-indigo-200">{s.pillar}</h5>
                  {meta && <div className="text-xs text-indigo-300/70">{meta}</div>}
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
      <div className="bg-teal-950/20 border border-teal-800/30 rounded-lg p-4 mt-4">
        <p className="text-sm text-teal-300/70">No holdings data available.</p>
      </div>
    );
  }

  const metaItems = [
    { label: 'Portfolio Date', value: holdings.currentPortfolioDate },
    { label: 'Equity Holdings', value: holdings.equityHoldings },
    { label: 'Bond Holdings', value: holdings.bondHoldings },
    { label: 'Other Holdings', value: holdings.otherHoldings },
    { label: '% Assets in Top 10', value: holdings.pctAssetsInTop10, accent: true },
  ];

  const top = Array.isArray(holdings.topHoldings) ? holdings.topHoldings : [];
  const rows = top.map((h) => ({
    Name: h.name,
    'Portfolio Weight': h.portfolioWeight ?? '',
    'Market Value': h.marketValue ?? '',
    Sector: h.sector ?? '',
  }));

  return (
    <div className="mt-4 space-y-4">
      <MetricGrid items={metaItems} />
      <DataTable title="Top Holdings" columns={['Name', 'Portfolio Weight', 'Market Value', 'Sector']} rows={rows} />
    </div>
  );
}

function MorRisk({ riskPeriods }: { riskPeriods: EtfMorRiskPeriods | null }): JSX.Element {
  if (!riskPeriods) {
    return (
      <div className="bg-red-950/20 border border-red-800/30 rounded-lg p-4 mt-4">
        <p className="text-sm text-red-300/70">No risk data available.</p>
      </div>
    );
  }

  const periods = (['3-Yr', '5-Yr', '10-Yr'] as const).filter((p) => (riskPeriods as any)?.[p]);
  if (!periods.length) {
    return (
      <div className="bg-red-950/20 border border-red-800/30 rounded-lg p-4 mt-4">
        <p className="text-sm text-red-300/70">No risk periods available.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-6">
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
          <div key={p} className="bg-red-950/20 border border-red-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h4 className="text-sm font-semibold text-red-200">{p} Risk Analysis</h4>
              {d?.period && <div className="text-xs text-red-300/70">{d.period}</div>}
            </div>

            <MetricGrid
              items={[
                { label: 'Risk Score', value: score.riskScore, accent: true },
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

  const hasAny =
    Boolean(analyzer) ||
    Boolean(risk) ||
    Boolean(people) ||
    Boolean(analyzer?.analysis) ||
    Boolean(analyzer?.holdings) ||
    Boolean(risk?.riskPeriods) ||
    Boolean(people?.currentManagers);

  const updatedAt = analyzer?.updatedAt ?? risk?.updatedAt ?? people?.updatedAt ?? analyzer?.createdAt ?? risk?.createdAt ?? people?.createdAt ?? null;
  const updatedLabel = updatedAt ? `Last updated: ${new Date(updatedAt as any).toLocaleString('en-US')}` : undefined;

  return (
    <section id="etf-mor-info" className="bg-gray-900 rounded-lg shadow-sm px-3 py-4 sm:p-6 mt-6">
      <SectionHeading title="Mor Analyzer Data" subtitle={updatedLabel} />

      {!hasAny ? (
        <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 text-center">
          <p className="text-gray-400">No Mor Analyzer data saved yet.</p>
          <p className="text-sm text-gray-500 mt-1">Use the admin panel to trigger data collection.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Overview Section */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Overview</h3>
            <MetricGrid
              items={[
                { label: 'NAV', value: analyzer?.overviewNav, accent: true },
                { label: '1-Day Return', value: analyzer?.overviewOneDayReturn, accent: true },
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
            {analyzer?.strategyText && <TextCard title="Investment Strategy" content={analyzer.strategyText} className="mt-6" />}
          </div>

          {/* Analysis Section */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Analysis</h3>
            <MorAnalysis analysis={analysis} />
          </div>

          {/* Returns Section */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Returns</h3>
            <ReturnsTable title="Annual Returns" rows={returnsAnnual} />
            <ReturnsTable title="Trailing Returns" rows={returnsTrailing} />
          </div>

          {/* Holdings Section */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Holdings</h3>
            <MorHoldings holdings={holdings} />
          </div>

          {/* Risk Section */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Risk Analysis</h3>
            <MorRisk riskPeriods={riskPeriods} />
          </div>

          {/* People Section */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Management</h3>
            <MetricGrid
              items={[
                { label: 'Inception Date', value: people?.inceptionDate },
                { label: 'Number of Managers', value: people?.numberOfManagers, accent: true },
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
