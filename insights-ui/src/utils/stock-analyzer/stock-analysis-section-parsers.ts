import * as cheerio from 'cheerio';
import {
  BalanceAnnualData,
  BalanceQuarterlyData,
  CashFlowAnnualData,
  CashFlowQuarterlyData,
  DividendHistoryRow,
  DividendsData,
  FinancialMeta,
  IncomeAnnualData,
  IncomeQuarterlyData,
  KpisAnnualData,
  KpisQuarterlyData,
  RatiosAnnualData,
  RatiosQuarterlyData,
  StockFundamentalsSummary,
} from '@/types/prismaTypes';
import { normalizeCellValue, ParsedFinancialTable, parseFinancialTables, toValueKey } from '@/utils/stock-analyzer/stock-analysis-table-parser';

/**
 * Page-shape-specific parsers built on top of {@link parseFinancialTables}.
 *
 * Every parser returns the exact JSON shape already persisted on
 * `TickerV1StockAnalyzerScrapperInfo`, so nothing downstream (chart route,
 * financial-info route, analysis prompts) has to change.
 */

export type StatementData =
  | IncomeAnnualData
  | IncomeQuarterlyData
  | BalanceAnnualData
  | BalanceQuarterlyData
  | CashFlowAnnualData
  | CashFlowQuarterlyData
  | RatiosAnnualData
  | RatiosQuarterlyData;

export type KpisData = KpisAnnualData | KpisQuarterlyData;

export type StatementPeriodType = 'annual' | 'quarterly';

/** Column headings that are not a fiscal period and must not become a data point. */
const NON_PERIOD_COLUMN_LABELS: ReadonlySet<string> = new Set(['Current', 'TTM', 'Upgrade']);

const QUARTER_LABEL_PATTERN = /^Q[1-4]\s+\d{4}$/;
const FISCAL_YEAR_LABEL_PATTERN = /^FY\s+\d{4}$/;

/**
 * Row labels whose camelCase form would not match the key the rest of the app
 * reads. `quarterly-chart-data/route.ts` looks for `revenue`, `grossMargin`,
 * `ebit`, `freeCashFlow`, `eps` and `sharesOutstanding`; the source page spells
 * the last two "EPS (Diluted)" and "Shares Outstanding (Diluted)".
 */
const ROW_LABEL_TO_VALUE_KEY: Readonly<Record<string, string>> = {
  'EPS (Diluted)': 'eps',
  'EPS (Basic)': 'basicEps',
  'Shares Outstanding (Diluted)': 'sharesOutstanding',
  'Shares Outstanding (Basic)': 'basicSharesOutstanding',
  'Revenue (Total)': 'totalRevenue',
  "Shareholders' Equity": 'shareholdersEquity',
};

function valueKeyForRowLabel(label: string): string {
  return ROW_LABEL_TO_VALUE_KEY[label] ?? toValueKey(label);
}

function isPeriodColumn(label: string, periodType: StatementPeriodType): boolean {
  if (!label || NON_PERIOD_COLUMN_LABELS.has(label)) {
    return false;
  }
  return periodType === 'quarterly' ? QUARTER_LABEL_PATTERN.test(label) : FISCAL_YEAR_LABEL_PATTERN.test(label);
}

/**
 * Read the "Financials in millions USD. Fiscal year is January - December."
 * caption that sits above the tables.
 */
function parseFinancialMeta(html: string): FinancialMeta {
  const $: cheerio.CheerioAPI = cheerio.load(html);
  const main = $('main');
  const pageText: string = (main.length > 0 ? main : $('body')).text().replace(/\s+/g, ' ');

  const meta: FinancialMeta = {};

  const unitAndCurrency: RegExpMatchArray | null = pageText.match(/in (thousands|millions|billions)\s+([A-Z]{3})\b/);
  if (unitAndCurrency) {
    meta.unit = unitAndCurrency[1];
    meta.currency = unitAndCurrency[2];
  } else {
    const currencyOnly: RegExpMatchArray | null = pageText.match(/Financials in ([A-Z]{3})\b/);
    if (currencyOnly) {
      meta.currency = currencyOnly[1];
    }
  }

  const fiscalYearNote: RegExpMatchArray | null = pageText.match(/Fiscal year is [^.]+\./);
  if (fiscalYearNote) {
    meta.fiscalYearNote = fiscalYearNote[0].trim();
  }

  return meta;
}

/**
 * Parse a statement page (income statement / balance sheet / cash flow /
 * ratios) into `{ meta, periods }`.
 *
 * A page splits its rows over several tables that share the same period
 * columns, so all of them are merged into one flat `values` map per period —
 * which is what the persisted shape has always been.
 */
export function parseStatementPage(html: string, periodType: StatementPeriodType): StatementData {
  const tables: ParsedFinancialTable[] = parseFinancialTables(html);
  const meta: FinancialMeta = parseFinancialMeta(html);

  // Period identity is the column label; a page can order/repeat columns
  // differently per table, so index by label and keep first-seen order.
  const valuesByPeriod: Map<string, Record<string, string | number | null>> = new Map();
  const periodEndByPeriod: Map<string, string | null> = new Map();

  for (const table of tables) {
    for (const row of table.rows) {
      const key: string = valueKeyForRowLabel(row.label);

      table.columns.forEach((column, columnIndex) => {
        if (!isPeriodColumn(column.label, periodType)) {
          return;
        }
        if (!valuesByPeriod.has(column.label)) {
          valuesByPeriod.set(column.label, {});
          periodEndByPeriod.set(column.label, column.periodEnd);
        }
        const values: Record<string, string | number | null> = valuesByPeriod.get(column.label)!;
        // First table wins for a duplicated row label (e.g. "Net Income"
        // appears on both the cash-flow and supplementary tables).
        if (!(key in values)) {
          values[key] = normalizeCellValue(row.cells[columnIndex] ?? null);
        }
      });
    }
  }

  const periods = Array.from(valuesByPeriod.entries()).map(([label, values]) => {
    const periodEnd: string | null = periodEndByPeriod.get(label) ?? null;
    const periodKey = periodType === 'quarterly' ? { fiscalQuarter: label } : { fiscalYear: label };
    return {
      ...periodKey,
      ...(periodEnd ? { periodEnd } : {}),
      values,
    };
  });

  return { meta, periods } as StatementData;
}

/**
 * Parse the metrics ("KPIs") page.
 *
 * Unlike the statements, the KPI tables are kept grouped by their heading —
 * `{ revenue: {...}, revenueByGeography: {...}, keyPerformanceIndicators: {...} }`
 * — which is the shape already stored for this section.
 */
export function parseKpisPage(html: string, periodType: StatementPeriodType): KpisData {
  const tables: ParsedFinancialTable[] = parseFinancialTables(html);
  const meta: FinancialMeta = parseFinancialMeta(html);

  const groupsByPeriod: Map<string, Record<string, Record<string, string | number | null>>> = new Map();
  const periodEndByPeriod: Map<string, string | null> = new Map();

  for (const table of tables) {
    const groupKey: string = table.sectionTitle ? toValueKey(table.sectionTitle) : 'metrics';

    for (const row of table.rows) {
      const key: string = valueKeyForRowLabel(row.label);

      table.columns.forEach((column, columnIndex) => {
        if (!isPeriodColumn(column.label, periodType)) {
          return;
        }
        if (!groupsByPeriod.has(column.label)) {
          groupsByPeriod.set(column.label, {});
          periodEndByPeriod.set(column.label, column.periodEnd);
        }
        const groups: Record<string, Record<string, string | number | null>> = groupsByPeriod.get(column.label)!;
        const group: Record<string, string | number | null> = (groups[groupKey] ??= {});
        if (!(key in group)) {
          group[key] = normalizeCellValue(row.cells[columnIndex] ?? null);
        }
      });
    }
  }

  const periods = Array.from(groupsByPeriod.entries()).map(([label, groups]) => {
    const periodEnd: string | null = periodEndByPeriod.get(label) ?? null;
    const periodKey = periodType === 'quarterly' ? { fiscalQuarter: label } : { fiscalYear: label };
    return {
      ...periodKey,
      ...(periodEnd ? { periodEnd } : {}),
      values: groups as unknown as Record<string, string | number | null>,
    };
  });

  return { meta, periods } as KpisData;
}

/* =============================================================================
   SUMMARY (the quote page's two stat tables)
============================================================================= */

function parseStatTables(html: string): Record<string, string> {
  const $: cheerio.CheerioAPI = cheerio.load(html);
  const stats: Record<string, string> = {};

  $('table tr').each((_index, row) => {
    const cells = $(row).find('td').toArray();
    if (cells.length !== 2) {
      return;
    }
    const label: string = $(cells[0]).text().replace(/\s+/g, ' ').trim();
    const value: string = $(cells[1]).text().replace(/\s+/g, ' ').trim();
    if (label && value && !(label in stats)) {
      stats[label] = value;
    }
  });

  return stats;
}

/** `69.08B -55.8%` => `69.08B`; the trailing change is a separate stat. */
function firstToken(value: string | undefined): string | undefined {
  const token: string | undefined = value?.trim().split(/\s+/)[0];
  return token && token !== 'n/a' ? token : undefined;
}

function toNumber(value: string | undefined): number | undefined {
  const token: string | undefined = firstToken(value);
  if (token === undefined) {
    return undefined;
  }
  const parsed: number = Number(token.replace(/[,$]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toRange(value: string | undefined): { low: number; high: number } | undefined {
  const match: RegExpMatchArray | undefined | null = value?.match(/^([\d.,]+)\s*-\s*([\d.,]+)$/);
  if (!match) {
    return undefined;
  }
  const low: number = Number(match[1].replace(/,/g, ''));
  const high: number = Number(match[2].replace(/,/g, ''));
  return Number.isFinite(low) && Number.isFinite(high) ? { low, high } : undefined;
}

function toDate(value: string | undefined): Date | undefined {
  const trimmed: string | undefined = value?.trim();
  if (!trimmed || trimmed === 'n/a') {
    return undefined;
  }
  const parsed: Date = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/** `$0.53 (2.41%)` => `{ amount: 0.53, yieldPct: '2.41%' }` */
function parseDividendStat(value: string | undefined): { amount?: number; yieldPct?: string } | undefined {
  if (!value || value.trim() === 'n/a') {
    return undefined;
  }
  const amount: number | undefined = toNumber(value);
  const yieldMatch: RegExpMatchArray | null = value.match(/\(([\d.]+%)\)/);
  if (amount === undefined && !yieldMatch) {
    return undefined;
  }
  return {
    ...(amount === undefined ? {} : { amount }),
    ...(yieldMatch ? { yieldPct: yieldMatch[1] } : {}),
  };
}

/**
 * Parse the quote page into {@link StockFundamentalsSummary}.
 *
 * Note the key names come from the persisted type, not from the source page:
 * `financial-info/route.ts` reads `epsTtm` / `averageVolume`, so those are the
 * keys written here.
 */
export function parseSummaryPage(html: string): StockFundamentalsSummary {
  const stats: Record<string, string> = parseStatTables(html);

  const summary: StockFundamentalsSummary = {};

  const assign = <K extends keyof StockFundamentalsSummary>(key: K, value: StockFundamentalsSummary[K] | undefined): void => {
    if (value !== undefined) {
      summary[key] = value;
    }
  };

  assign('marketCap', firstToken(stats['Market Cap']));
  assign('revenueTtm', firstToken(stats['Revenue (ttm)']));
  assign('netIncomeTtm', firstToken(stats['Net Income']));
  assign('sharesOut', firstToken(stats['Shares Out']));
  assign('epsTtm', toNumber(stats['EPS']));
  assign('peRatio', toNumber(stats['PE Ratio']));
  assign('forwardPE', toNumber(stats['Forward PE']));
  assign('dividend', parseDividendStat(stats['Dividend']));
  assign('exDividendDate', toDate(stats['Ex-Dividend Date']));
  assign('volume', toNumber(stats['Volume']));
  assign('averageVolume', toNumber(stats['Average Volume']));
  assign('open', toNumber(stats['Open']));
  assign('previousClose', toNumber(stats['Previous Close']));
  assign('daysRange', toRange(stats["Day's Range"]));
  assign('week52Range', toRange(stats['52-Week Range']));
  assign('beta', toNumber(stats['Beta']));
  assign('rsi', toNumber(stats['RSI (14)']));
  assign('earningsDate', toDate(stats['Earnings Date']));

  return summary;
}

/* =============================================================================
   DIVIDENDS
============================================================================= */

/**
 * The dividend page shows its headline stats as
 * `<div>Payout Ratio <div class="… font-semibold …">63.71%</div></div>` cards.
 */
function parseDividendStatCards(html: string): Record<string, string> {
  const $: cheerio.CheerioAPI = cheerio.load(html);
  const cards: Record<string, string> = {};

  $('div.font-semibold').each((_index, valueElement) => {
    const container = $(valueElement).parent();
    const value: string = $(valueElement).text().replace(/\s+/g, ' ').trim();
    const label: string = container.clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
    if (label && value && !(label in cards)) {
      cards[label] = value;
    }
  });

  return cards;
}

export function parseDividendsPage(html: string): DividendsData {
  const cards: Record<string, string> = parseDividendStatCards(html);
  const $: cheerio.CheerioAPI = cheerio.load(html);

  const history: DividendHistoryRow[] = [];
  $('table').each((_tableIndex, table) => {
    const headers: string[] = $(table)
      .find('thead tr')
      .last()
      .find('th')
      .toArray()
      .map((cell) => $(cell).text().replace(/\s+/g, ' ').trim());

    if (!headers.includes('Ex-Dividend Date') || !headers.includes('Cash Amount')) {
      return;
    }

    $(table)
      .find('tbody tr')
      .each((_rowIndex, row) => {
        const cells: string[] = $(row)
          .find('td')
          .toArray()
          .map((cell) => $(cell).text().replace(/\s+/g, ' ').trim());
        if (cells.length < headers.length) {
          return;
        }
        const cellByHeader = (header: string): string | undefined => {
          const index: number = headers.indexOf(header);
          return index >= 0 ? cells[index] : undefined;
        };

        const exDividendDate: Date | undefined = toDate(cellByHeader('Ex-Dividend Date'));
        const amount: number | undefined = toNumber(cellByHeader('Cash Amount'));
        if (!exDividendDate && amount === undefined) {
          return;
        }
        history.push({
          ...(exDividendDate ? { exDividendDate } : {}),
          ...(amount === undefined ? {} : { amount }),
          ...(toDate(cellByHeader('Record Date')) ? { recordDate: toDate(cellByHeader('Record Date')) } : {}),
          ...(toDate(cellByHeader('Pay Date')) ? { payDate: toDate(cellByHeader('Pay Date')) } : {}),
        });
      });
  });

  const summary: DividendsData['summary'] = {};
  const annualDividend: number | undefined = toNumber(cards['Annual Dividend']);
  if (annualDividend !== undefined) summary.annualDividend = annualDividend;
  if (cards['Dividend Yield'] && cards['Dividend Yield'] !== 'n/a') summary.yieldPct = cards['Dividend Yield'];
  const exDividendDate: Date | undefined = toDate(cards['Ex-Dividend Date']);
  if (exDividendDate) summary.exDividendDate = exDividendDate;
  if (cards['Payout Ratio'] && cards['Payout Ratio'] !== 'n/a') summary.payoutRatioPct = cards['Payout Ratio'];
  const growth: string | undefined = cards['Dividend Growth(1Y)'] ?? cards['Dividend Growth'];
  if (growth && growth !== 'n/a') summary.dividendGrowth1Y = growth;

  // Kept even when it reads `n/a`: a company that has never paid a dividend
  // still renders the stat cards, and this is the field that distinguishes
  // "scraped a real page, this stock pays nothing" from "scraped nothing at
  // all". Without it a non-payer would look like a failed scrape forever.
  if (cards['Payout Frequency']) summary.payoutFrequency = cards['Payout Frequency'];

  return { meta: {}, summary, history };
}
