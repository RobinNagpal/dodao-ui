import { prisma } from '@/prisma';
import {
  EtfMorAnalysis,
  EtfMorCurrentManagers,
  EtfMorHoldings,
  EtfMorOverview,
  EtfMorPeopleSummary,
  EtfMorReturnsRows,
  EtfMorRiskPeriod,
  EtfMorRiskPeriodData,
  EtfMorRiskPeriods,
  EtfMorStrategy,
  EtfMorPortfolioAssetAllocation,
  EtfMorPortfolioBondBreakdown,
  EtfMorPortfolioFixedIncomeStyle,
  EtfMorPortfolioHoldingRow,
  EtfMorPortfolioHoldings,
  EtfMorPortfolioSectorExposure,
  EtfMorPortfolioStyleMeasures,
} from '@/types/prismaTypes';
import { revalidateEtfAndExchangeTag, revalidateEtfHoldingsTag } from '@/utils/etf-cache-utils';
import { jsonArrayIsEmpty, rowsContainerIsEmpty } from '@/utils/etf-analysis-reports/mor-scrape-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

type MorKind = 'quote' | 'risk' | 'people' | 'portfolio';

interface QuoteData {
  overview?: EtfMorOverview;
  analysis?: EtfMorAnalysis;
  returns?: { annual?: EtfMorReturnsRows; trailing?: EtfMorReturnsRows };
  holdings?: EtfMorHoldings;
  strategy?: EtfMorStrategy;
}

interface PeopleData {
  people?: EtfMorPeopleSummary;
  managementTeam?: EtfMorCurrentManagers;
  managerTimeline?: Array<{ name: string; startYear?: number; endYear?: number; source?: string }>;
}

/** MOR /portfolio scraper payload (etf-portfolio.ts) */
interface PortfolioData {
  assetAllocation?: EtfMorPortfolioAssetAllocation;
  styleMeasures?: EtfMorPortfolioStyleMeasures;
  fixedIncomeStyle?: EtfMorPortfolioFixedIncomeStyle;
  sectorExposure?: EtfMorPortfolioSectorExposure;
  bondBreakdown?: EtfMorPortfolioBondBreakdown;
  holdings?: EtfMorPortfolioHoldings;
}

interface CallbackBody {
  url: string;
  section: string;
  data: QuoteData | EtfMorRiskPeriods | PeopleData | PortfolioData;
  errors?: unknown[];
  kind: MorKind;
}

export interface MorInfoCallbackResponse {
  success: boolean;
  kind: MorKind;
  errors: unknown[];
}

function normalizeUpperTrim(v: string | null | undefined): string {
  return (v ?? '').toUpperCase().trim();
}

function sectorExposureIsEmpty(s: EtfMorPortfolioSectorExposure | null | undefined): boolean {
  if (s == null) return true;
  return (s.vsCategoryPct?.length ?? 0) === 0 && (s.vsIndexPct?.length ?? 0) === 0;
}

function bondBreakdownIsEmpty(v: EtfMorPortfolioBondBreakdown | null | undefined): boolean {
  if (v == null) return true;
  return (v.vsCategoryPct?.length ?? 0) === 0 && (v.vsIndexPct?.length ?? 0) === 0;
}

function holdingsIsEmpty(v: EtfMorPortfolioHoldings | null | undefined): boolean {
  if (v == null) return true;
  const listEmpty = !Array.isArray(v.holdings) || v.holdings.length === 0;
  const summaryEmpty = !v.summary || Object.values(v.summary).every((x) => x == null || String(x).trim() === '');
  return listEmpty && summaryEmpty;
}

function isBlank(v: string | null | undefined): boolean {
  return v == null || v.trim() === '';
}

/** Never replace an existing non-blank string column with null/blank. */
function keepPrevString(incoming: string | null | undefined, prev: string | null | undefined): string | null {
  return !isBlank(incoming) ? (incoming as string) : prev ?? null;
}

/**
 * Never replace an existing non-empty JSON column with an empty one. Returns `undefined` (leave the
 * column untouched) when the payload omitted the key.
 */
function keepPrevJson<T>(incoming: T | null | undefined, prev: unknown, isEmpty: (v: T) => boolean): T | undefined {
  if (incoming != null && !isEmpty(incoming)) return incoming;
  if (prev != null && !isEmpty(prev as T)) return prev as T;
  return incoming ?? undefined;
}

function analysisIsEmpty(v: EtfMorAnalysis | null | undefined): boolean {
  return v == null || jsonArrayIsEmpty(v.sections);
}

function quoteHoldingsIsEmpty(v: EtfMorHoldings | null | undefined): boolean {
  return v == null || jsonArrayIsEmpty(v.topHoldings);
}

/** Half-rendered quote page: no overview metrics and no returns tables at all. */
function quotePayloadIsEmpty(d: QuoteData): boolean {
  return Object.keys(d.overview?.overviewMetrics ?? {}).length === 0 && jsonArrayIsEmpty(d.returns?.annual) && jsonArrayIsEmpty(d.returns?.trailing);
}

function riskPeriodIsEmpty(p: EtfMorRiskPeriodData | null | undefined): boolean {
  if (p == null) return true;
  const mvm = p.marketVolatilityMeasures;
  return (
    isBlank(p.portfolioRiskScore?.riskScore) &&
    isBlank(p.portfolioRiskScore?.riskLevel) &&
    isBlank(p.morAnalyzerRiskReturn?.riskVsCategory) &&
    isBlank(p.morAnalyzerRiskReturn?.returnVsCategory) &&
    rowsContainerIsEmpty(p.riskAndVolatilityMeasures) &&
    rowsContainerIsEmpty(mvm?.captureRatios) &&
    rowsContainerIsEmpty(mvm?.drawdown) &&
    rowsContainerIsEmpty(mvm?.drawdownDates)
  );
}

/** Merge per period: an empty incoming period keeps the previously stored one. */
function mergeRiskPeriods(incoming: EtfMorRiskPeriods | null | undefined, prev: EtfMorRiskPeriods | null | undefined): EtfMorRiskPeriods {
  const merged: Record<string, EtfMorRiskPeriodData> = { ...(prev ?? {}) };
  for (const [period, data] of Object.entries(incoming ?? {}) as Array<[EtfMorRiskPeriod, EtfMorRiskPeriodData]>) {
    if (!riskPeriodIsEmpty(data) || riskPeriodIsEmpty(prev?.[period])) merged[period] = data;
  }
  return merged as EtfMorRiskPeriods;
}

const DASH_PLACEHOLDERS = new Set(['—', '–', '−', '-', 'N/A', 'n/a']);

function normalizeDashes<T extends object>(obj: T | undefined | null): T | undefined | null {
  if (obj == null) return obj;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === 'string' && DASH_PLACEHOLDERS.has(v.trim())) {
      out[k] = null;
    } else {
      out[k] = v;
    }
  }
  return out as unknown as T;
}

function normalizeHoldings(h: EtfMorPortfolioHoldings | null | undefined): EtfMorPortfolioHoldings | null | undefined {
  if (h == null) return h;
  return {
    summary: normalizeDashes(h.summary) ?? {},
    columns: Array.isArray(h.columns) ? h.columns : [],
    holdings: Array.isArray(h.holdings) ? h.holdings.map((row) => normalizeDashes(row) as EtfMorPortfolioHoldingRow) : [],
  };
}

type PortfolioRow = {
  assetAllocation: unknown;
  styleMeasures: unknown;
  fixedIncomeStyle: unknown;
  sectorExposure: unknown;
  bondBreakdown: unknown;
  holdings: unknown;
};

/**
 * Only patch JSON keys that appear on the payload. Lambda/JSON omits `undefined` keys — if we treated
 * missing keys as null we would wipe existing DB columns on partial callbacks.
 */
function buildPortfolioUpdatePatch(d: PortfolioData, existing: PortfolioRow | null): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  if ('assetAllocation' in d) {
    const incoming = d.assetAllocation ?? null;
    const prev = existing?.assetAllocation as EtfMorPortfolioAssetAllocation | null | undefined;
    if (incoming != null && rowsContainerIsEmpty(incoming) && prev != null && !rowsContainerIsEmpty(prev)) {
      patch.assetAllocation = prev as object;
    } else {
      patch.assetAllocation = incoming as object | null;
    }
  }
  if ('styleMeasures' in d) {
    const incoming = d.styleMeasures ?? null;
    const prev = existing?.styleMeasures as EtfMorPortfolioStyleMeasures | null | undefined;
    if (incoming != null && rowsContainerIsEmpty(incoming) && prev != null && !rowsContainerIsEmpty(prev)) {
      patch.styleMeasures = prev as object;
    } else {
      patch.styleMeasures = incoming as object | null;
    }
  }
  if ('fixedIncomeStyle' in d) {
    const incoming = d.fixedIncomeStyle ?? null;
    const prev = existing?.fixedIncomeStyle as EtfMorPortfolioFixedIncomeStyle | null | undefined;
    if (incoming != null && rowsContainerIsEmpty(incoming) && prev != null && !rowsContainerIsEmpty(prev)) {
      patch.fixedIncomeStyle = prev as object;
    } else {
      patch.fixedIncomeStyle = incoming as object | null;
    }
  }
  if ('sectorExposure' in d) {
    const incoming = d.sectorExposure ?? null;
    const prev = existing?.sectorExposure as EtfMorPortfolioSectorExposure | null | undefined;
    if (incoming != null && sectorExposureIsEmpty(incoming) && prev != null && !sectorExposureIsEmpty(prev)) {
      patch.sectorExposure = prev as object;
    } else {
      patch.sectorExposure = incoming as object | null;
    }
  }
  if ('bondBreakdown' in d) {
    const incoming = d.bondBreakdown ?? null;
    const prev = existing?.bondBreakdown as EtfMorPortfolioBondBreakdown | null | undefined;
    if (incoming != null && bondBreakdownIsEmpty(incoming) && prev != null && !bondBreakdownIsEmpty(prev)) {
      patch.bondBreakdown = prev as object;
    } else {
      patch.bondBreakdown = incoming as object | null;
    }
  }
  if ('holdings' in d) {
    const incoming = normalizeHoldings(d.holdings ?? null) ?? null;
    const prev = existing?.holdings as EtfMorPortfolioHoldings | null | undefined;
    if (incoming != null && holdingsIsEmpty(incoming) && prev != null && !holdingsIsEmpty(prev)) {
      patch.holdings = prev as object;
    } else {
      patch.holdings = incoming as object | null;
    }
  }

  return patch;
}

function buildPortfolioCreateData(d: PortfolioData): Record<string, unknown> {
  return {
    assetAllocation: ('assetAllocation' in d ? d.assetAllocation ?? null : null) as object | null,
    styleMeasures: ('styleMeasures' in d ? d.styleMeasures ?? null : null) as object | null,
    fixedIncomeStyle: ('fixedIncomeStyle' in d ? d.fixedIncomeStyle ?? null : null) as object | null,
    sectorExposure: ('sectorExposure' in d ? d.sectorExposure ?? null : null) as object | null,
    bondBreakdown: ('bondBreakdown' in d ? d.bondBreakdown ?? null : null) as object | null,
    holdings: ('holdings' in d ? normalizeHoldings(d.holdings ?? null) ?? null : null) as object | null,
  };
}

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<MorInfoCallbackResponse> {
  const body = (await req.json()) as CallbackBody;
  const { kind, data, errors: lambdaErrors = [] } = body;

  const { spaceId, exchange, etf } = await params;
  const ex = normalizeUpperTrim(exchange);
  const symbol = normalizeUpperTrim(etf);

  const etfRecord = await prisma.etf.findFirstOrThrow({
    where: { spaceId, symbol, exchange: ex },
    select: { id: true, symbol: true, exchange: true },
  });

  if (kind === 'quote') {
    const d = data as QuoteData;

    if (quotePayloadIsEmpty(d)) {
      return {
        success: false,
        kind,
        errors: [...lambdaErrors, 'Incomplete quote scrape: overview metrics and returns are empty; existing data left untouched'],
      };
    }

    const overview = d.overview ?? {};
    const overviewMetrics = overview.overviewMetrics ?? {};
    const marketData = overview.marketData ?? {};
    const returns = d.returns ?? {};
    const strategy = d.strategy ?? {};

    const prev = await prisma.etfMorAnalyzerInfo.findUnique({ where: { etfId: etfRecord.id } });

    const analyzerData = {
      overviewNav: keepPrevString(overviewMetrics['NAV'], prev?.overviewNav),
      overviewOneDayReturn: keepPrevString(overviewMetrics['1-Day Return'], prev?.overviewOneDayReturn),
      overviewTotalAssets: keepPrevString(overviewMetrics['Total Assets'], prev?.overviewTotalAssets),
      overviewInvestmentSize: keepPrevString(overviewMetrics['Investment Size'], prev?.overviewInvestmentSize),
      overviewAdjExpenseRatio: keepPrevString(overviewMetrics['Adj. Expense Ratio'], prev?.overviewAdjExpenseRatio),
      overviewProspectusNetExpenseRatio: keepPrevString(overviewMetrics['Prospectus Net Expense Ratio'], prev?.overviewProspectusNetExpenseRatio),
      overviewMer: keepPrevString(overviewMetrics['MER'], prev?.overviewMer),
      overviewCategory: keepPrevString(overviewMetrics['Category'], prev?.overviewCategory),
      overviewStyleBox: keepPrevString(overviewMetrics['Style Box'] ?? overviewMetrics['Equity Style Box'], prev?.overviewStyleBox),
      overviewSecYield: keepPrevString(overviewMetrics['SEC Yield'], prev?.overviewSecYield),
      overviewTtmYield: keepPrevString(overviewMetrics['TTM Yield'], prev?.overviewTtmYield),
      overviewTurnover: keepPrevString(overviewMetrics['Turnover'], prev?.overviewTurnover),
      overviewRiskLevel: keepPrevString(overviewMetrics['Risk Level'], prev?.overviewRiskLevel),
      overviewStatus: keepPrevString(overviewMetrics['Status'], prev?.overviewStatus),
      marketNav: keepPrevString(marketData['NAV'], prev?.marketNav),
      marketOpenPrice: keepPrevString(marketData['Open Price'], prev?.marketOpenPrice),
      marketBidAskSpread: keepPrevString(marketData['Bid / Ask / Spread'], prev?.marketBidAskSpread),
      marketVolumeAvg: keepPrevString(marketData['Volume / Avg'], prev?.marketVolumeAvg),
      marketDayRange: keepPrevString(marketData['Day Range'], prev?.marketDayRange),
      marketYearRange: keepPrevString(marketData['Year Range'], prev?.marketYearRange),
      marketProspectusBenchmark: keepPrevString(marketData['Prospectus Benchmark'], prev?.marketProspectusBenchmark),
      marketDiscount: keepPrevString(marketData['Discount'], prev?.marketDiscount),
      marketPremium: keepPrevString(marketData['Premium'], prev?.marketPremium),
      analysis: keepPrevJson(d.analysis, prev?.analysis, analysisIsEmpty) as any,
      returnsAnnual: (keepPrevJson(returns.annual, prev?.returnsAnnual, jsonArrayIsEmpty) ?? []) as any,
      returnsTrailing: (keepPrevJson(returns.trailing, prev?.returnsTrailing, jsonArrayIsEmpty) ?? []) as any,
      holdings: keepPrevJson(d.holdings, prev?.holdings, quoteHoldingsIsEmpty) as any,
      strategyText: keepPrevString(strategy.text, prev?.strategyText),
    };

    await prisma.etfMorAnalyzerInfo.upsert({
      where: { etfId: etfRecord.id },
      update: analyzerData,
      create: {
        etf: { connect: { id: etfRecord.id } },
        ...analyzerData,
      },
    });
  } else if (kind === 'risk') {
    const d = data as EtfMorRiskPeriods;
    const prev = await prisma.etfMorRiskInfo.findUnique({ where: { etfId: etfRecord.id }, select: { riskPeriods: true } });
    const riskPeriods = mergeRiskPeriods(d, prev?.riskPeriods as EtfMorRiskPeriods | null | undefined);

    await prisma.etfMorRiskInfo.upsert({
      where: { etfId: etfRecord.id },
      update: { riskPeriods: riskPeriods as any },
      create: { etf: { connect: { id: etfRecord.id } }, riskPeriods: riskPeriods as any },
    });
  } else if (kind === 'people') {
    const d = data as PeopleData;
    const people = d.people ?? {};
    const prev = await prisma.etfMorPeopleInfo.findUnique({ where: { etfId: etfRecord.id } });

    const peopleData = {
      inceptionDate: keepPrevString(people.inceptionDate, prev?.inceptionDate),
      numberOfManagers: keepPrevString(people.numberOfManagers, prev?.numberOfManagers),
      longestTenure: keepPrevString(people.longestTenure, prev?.longestTenure),
      advisors: keepPrevString(people.advisors, prev?.advisors),
      subAdvisors: keepPrevString(people.subAdvisors, prev?.subAdvisors),
      averageTenure: keepPrevString(people.averageTenure, prev?.averageTenure),
      currentManagers: (keepPrevJson(d.managementTeam, prev?.currentManagers, jsonArrayIsEmpty) ?? []) as any,
    };

    await prisma.etfMorPeopleInfo.upsert({
      where: { etfId: etfRecord.id },
      update: peopleData,
      create: {
        etf: { connect: { id: etfRecord.id } },
        ...peopleData,
      },
    });
  } else if (kind === 'portfolio') {
    const d = data as PortfolioData;

    const existingRow = await prisma.etfMorPortfolioInfo.findUnique({
      where: { etfId: etfRecord.id },
    });

    const patch = buildPortfolioUpdatePatch(
      d,
      existingRow
        ? {
            assetAllocation: existingRow.assetAllocation,
            styleMeasures: existingRow.styleMeasures,
            fixedIncomeStyle: existingRow.fixedIncomeStyle,
            sectorExposure: existingRow.sectorExposure,
            bondBreakdown: existingRow.bondBreakdown,
            holdings: existingRow.holdings,
          }
        : null
    );

    if (existingRow) {
      if (Object.keys(patch).length > 0) {
        await prisma.etfMorPortfolioInfo.update({
          where: { etfId: etfRecord.id },
          data: patch as any,
        });
      }
    } else {
      await prisma.etfMorPortfolioInfo.create({
        data: {
          etf: { connect: { id: etfRecord.id } },
          ...(buildPortfolioCreateData(d) as any),
        },
      });
    }
  } else {
    throw new Error(`Unknown kind: ${kind}`);
  }

  // Main page renders previews of all 4 MOR sections — always fire umbrella.
  // Holdings subpage only reads morPortfolioInfo, so its narrow tag only fires
  // when this run actually wrote the portfolio section.
  if (kind === 'portfolio') {
    revalidateEtfHoldingsTag(etfRecord.symbol, etfRecord.exchange);
  }
  revalidateEtfAndExchangeTag(etfRecord.symbol, etfRecord.exchange);

  return { success: true, kind, errors: lambdaErrors };
}

export const POST = withErrorHandlingV2<MorInfoCallbackResponse>(postHandler);
