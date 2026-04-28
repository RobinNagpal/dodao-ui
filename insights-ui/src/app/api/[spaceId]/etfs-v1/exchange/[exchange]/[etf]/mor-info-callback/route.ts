import { prisma } from '@/prisma';
import {
  EtfMorAnalysis,
  EtfMorCurrentManagers,
  EtfMorHoldings,
  EtfMorOverview,
  EtfMorPeopleSummary,
  EtfMorReturnsRows,
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
import { revalidateEtfAndExchangeTag } from '@/utils/etf-cache-utils';
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

function rowsContainerIsEmpty(v: { rows?: unknown[] } | null | undefined): boolean {
  if (v == null) return true;
  return (v.rows?.length ?? 0) === 0;
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
    const overview = d.overview ?? {};
    const overviewMetrics = overview.overviewMetrics ?? {};
    const marketData = overview.marketData ?? {};
    const analysis = d.analysis;
    const returns = d.returns ?? {};
    const holdings = d.holdings;
    const strategy = d.strategy ?? {};

    const analyzerData = {
      overviewNav: overviewMetrics['NAV'] ?? null,
      overviewOneDayReturn: overviewMetrics['1-Day Return'] ?? null,
      overviewTotalAssets: overviewMetrics['Total Assets'] ?? null,
      overviewInvestmentSize: overviewMetrics['Investment Size'] ?? null,
      overviewAdjExpenseRatio: overviewMetrics['Adj. Expense Ratio'] ?? null,
      overviewProspectusNetExpenseRatio: overviewMetrics['Prospectus Net Expense Ratio'] ?? null,
      overviewMer: overviewMetrics['MER'] ?? null,
      overviewCategory: overviewMetrics['Category'] ?? null,
      overviewStyleBox: overviewMetrics['Style Box'] ?? overviewMetrics['Equity Style Box'] ?? null,
      overviewSecYield: overviewMetrics['SEC Yield'] ?? null,
      overviewTtmYield: overviewMetrics['TTM Yield'] ?? null,
      overviewTurnover: overviewMetrics['Turnover'] ?? null,
      overviewRiskLevel: overviewMetrics['Risk Level'] ?? null,
      overviewStatus: overviewMetrics['Status'] ?? null,
      marketNav: marketData['NAV'] ?? null,
      marketOpenPrice: marketData['Open Price'] ?? null,
      marketBidAskSpread: marketData['Bid / Ask / Spread'] ?? null,
      marketVolumeAvg: marketData['Volume / Avg'] ?? null,
      marketDayRange: marketData['Day Range'] ?? null,
      marketYearRange: marketData['Year Range'] ?? null,
      marketProspectusBenchmark: marketData['Prospectus Benchmark'] ?? null,
      marketDiscount: marketData['Discount'] ?? null,
      marketPremium: marketData['Premium'] ?? null,
      analysis: analysis as any,
      returnsAnnual: (returns.annual ?? []) as any,
      returnsTrailing: (returns.trailing ?? []) as any,
      holdings: holdings as any,
      strategyText: strategy.text ?? null,
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

    await prisma.etfMorRiskInfo.upsert({
      where: { etfId: etfRecord.id },
      update: { riskPeriods: d as any },
      create: { etf: { connect: { id: etfRecord.id } }, riskPeriods: d as any },
    });
  } else if (kind === 'people') {
    const d = data as PeopleData;
    const people = d.people ?? {};
    const managementTeam = d.managementTeam ?? [];

    const peopleData = {
      inceptionDate: people.inceptionDate ?? null,
      numberOfManagers: people.numberOfManagers ?? null,
      longestTenure: people.longestTenure ?? null,
      advisors: people.advisors ?? null,
      subAdvisors: people.subAdvisors ?? null,
      averageTenure: people.averageTenure ?? null,
      currentManagers: managementTeam as any,
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

  revalidateEtfAndExchangeTag(etfRecord.symbol, etfRecord.exchange);

  return { success: true, kind, errors: lambdaErrors };
}

export const POST = withErrorHandlingV2<MorInfoCallbackResponse>(postHandler);
