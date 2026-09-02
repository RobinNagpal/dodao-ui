import { buildStockAnalysisSubPageUrl, fetchStockAnalysisPage } from '@/utils/stock-analyzer/stock-analysis-fetcher';
import {
  EtfSummaryStats,
  KpisData,
  parseDividendsPage,
  parseEtfSummaryPage,
  parseKpisPage,
  parseStatementPage,
  parseSummaryPage,
  StatementData,
  StatementPeriodType,
} from '@/utils/stock-analyzer/stock-analysis-section-parsers';
import { DividendsData, StockFundamentalsSummary } from '@/types/prismaTypes';

/**
 * In-process replacement for the Stock Analyzer Lambda.
 *
 * The Lambda only fetched a page from the stock-analyze site (configured by
 * `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL`) and parsed its tables, and
 * its statement parsers keyed off `#main-table` — an id the site dropped in a
 * redesign, after which every statement came back as `{ periods: [] }` with a
 * `200 OK`. Owning the scrape here means the parsers live next to the code that
 * reads their output and can be fixed in one deploy.
 */

export type StockAnalyzerSectionId =
  | 'summary'
  | 'dividends'
  | 'income-statement/annual'
  | 'income-statement/quarterly'
  | 'balance-sheet/annual'
  | 'balance-sheet/quarterly'
  | 'cashflow/annual'
  | 'cashflow/quarterly'
  | 'ratios/annual'
  | 'ratios/quarterly'
  | 'kpis/annual'
  | 'kpis/quarterly';

export type ScrapedSectionData = StockFundamentalsSummary | DividendsData | StatementData | KpisData;

export interface ScrapeSectionError {
  where: string;
  message: string;
}

export interface ScrapeSectionResult {
  section: StockAnalyzerSectionId;
  url: string;
  data: ScrapedSectionData;
  errors: ScrapeSectionError[];
}

interface SectionDefinition {
  /** Path appended to the ticker's `stockAnalyzeUrl`. */
  subPath: string;
  /** `?p=quarterly` for quarterly statement pages. */
  searchParams?: Record<string, string>;
  parse: (html: string) => ScrapedSectionData;
  /**
   * Whether a parse produced something worth persisting. A page that renders
   * but yields no rows means the source layout changed — the caller keeps the
   * previously stored data instead of overwriting it with an empty object.
   */
  isUsable: (data: ScrapedSectionData) => boolean;
}

function hasPeriods(data: ScrapedSectionData): boolean {
  const periods: unknown = (data as StatementData | KpisData).periods;
  return Array.isArray(periods) && periods.length > 0;
}

function statementSection(subPath: string, periodType: StatementPeriodType): SectionDefinition {
  return {
    subPath,
    ...(periodType === 'quarterly' ? { searchParams: { p: 'quarterly' } } : {}),
    parse: (html: string): ScrapedSectionData => parseStatementPage(html, periodType),
    isUsable: hasPeriods,
  };
}

function kpisSection(periodType: StatementPeriodType): SectionDefinition {
  return {
    subPath: 'financials/metrics',
    ...(periodType === 'quarterly' ? { searchParams: { p: 'quarterly' } } : {}),
    parse: (html: string): ScrapedSectionData => parseKpisPage(html, periodType),
    isUsable: hasPeriods,
  };
}

const SECTION_DEFINITIONS: Readonly<Record<StockAnalyzerSectionId, SectionDefinition>> = {
  summary: {
    subPath: '',
    parse: (html: string): ScrapedSectionData => parseSummaryPage(html),
    // The quote page always carries a market cap and a previous close; without
    // them the fetch hit a challenge/placeholder page rather than the quote.
    isUsable: (data: ScrapedSectionData): boolean => Object.keys(data as StockFundamentalsSummary).length > 0,
  },
  dividends: {
    subPath: 'dividend',
    parse: (html: string): ScrapedSectionData => parseDividendsPage(html),
    // Non-payers legitimately have no history, so any parsed summary counts.
    isUsable: (data: ScrapedSectionData): boolean => {
      const dividends = data as DividendsData;
      return dividends.history.length > 0 || Object.keys(dividends.summary).length > 0;
    },
  },
  'income-statement/annual': statementSection('financials/income-statement', 'annual'),
  'income-statement/quarterly': statementSection('financials/income-statement', 'quarterly'),
  'balance-sheet/annual': statementSection('financials/balance-sheet', 'annual'),
  'balance-sheet/quarterly': statementSection('financials/balance-sheet', 'quarterly'),
  'cashflow/annual': statementSection('financials/cash-flow-statement', 'annual'),
  'cashflow/quarterly': statementSection('financials/cash-flow-statement', 'quarterly'),
  'ratios/annual': statementSection('financials/ratios', 'annual'),
  'ratios/quarterly': statementSection('financials/ratios', 'quarterly'),
  'kpis/annual': kpisSection('annual'),
  'kpis/quarterly': kpisSection('quarterly'),
};

/** URL of the source-site page backing a section, for logging / debugging. */
export function stockAnalyzerSectionUrl(stockAnalyzeUrl: string, section: StockAnalyzerSectionId): string {
  const definition: SectionDefinition = SECTION_DEFINITIONS[section];
  return buildStockAnalysisSubPageUrl(stockAnalyzeUrl, definition.subPath, definition.searchParams);
}

/**
 * Whether a scraped (or previously stored) payload for a section is usable.
 *
 * Exported so the persistence layer can apply the same test to what is already
 * in the database and re-fetch sections that were stored empty.
 */
export function isScrapedSectionUsable(section: StockAnalyzerSectionId, data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  try {
    return SECTION_DEFINITIONS[section].isUsable(data as ScrapedSectionData);
  } catch {
    return false;
  }
}

/**
 * Fetch and parse one section for a ticker.
 *
 * Throws if the page cannot be fetched; a page that loads but parses to nothing
 * comes back with `errors` populated and `isScrapedSectionUsable(...) === false`
 * so the caller can decide not to overwrite good data with it.
 */
export async function scrapeStockAnalyzerSection(stockAnalyzeUrl: string, section: StockAnalyzerSectionId): Promise<ScrapeSectionResult> {
  const definition: SectionDefinition = SECTION_DEFINITIONS[section];
  const url: string = buildStockAnalysisSubPageUrl(stockAnalyzeUrl, definition.subPath, definition.searchParams);

  const html: string = await fetchStockAnalysisPage(url);

  let data: ScrapedSectionData;
  try {
    data = definition.parse(html);
  } catch (error) {
    throw new Error(`Failed to parse ${section} from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const errors: ScrapeSectionError[] = definition.isUsable(data)
    ? []
    : [{ where: `parse:${section}`, message: `Parsed no usable data from ${url} — the source page layout may have changed` }];

  return { section, url, data, errors };
}

/* =============================================================================
   ETFs
============================================================================= */

export interface ScrapeEtfSummaryResult {
  url: string;
  data: EtfSummaryStats;
  errors: ScrapeSectionError[];
}

/** Whether an ETF quote page produced anything worth persisting. */
export function isEtfSummaryUsable(data: EtfSummaryStats): boolean {
  return Object.keys(data).length > 0;
}

/**
 * Fetch and parse an ETF quote page.
 *
 * ETFs live on the same source site as stocks and their quote page uses the
 * same two-column stat tables, so this shares the fetcher and the stat-table
 * reader. As with the stock sections, a page that loads but parses to nothing
 * comes back with `errors` populated and `isEtfSummaryUsable(...) === false`,
 * so the caller can decline to overwrite what it already has.
 */
export async function scrapeEtfSummary(etfUrl: string): Promise<ScrapeEtfSummaryResult> {
  const url: string = buildStockAnalysisSubPageUrl(etfUrl, '');
  const html: string = await fetchStockAnalysisPage(url);

  let data: EtfSummaryStats;
  try {
    data = parseEtfSummaryPage(html);
  } catch (error) {
    throw new Error(`Failed to parse ETF summary from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const errors: ScrapeSectionError[] = isEtfSummaryUsable(data)
    ? []
    : [{ where: 'parse:etf-summary', message: `Parsed no usable data from ${url} — the source page layout may have changed` }];

  return { url, data, errors };
}
