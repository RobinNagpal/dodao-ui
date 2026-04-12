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
  EtfMorPortfolioFixedIncomeMeasures,
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

/** Morningstar /portfolio scraper payload (etf-portfolio.ts) */
interface PortfolioData {
  assetAllocation?: EtfMorPortfolioAssetAllocation;
  styleMeasures?: EtfMorPortfolioStyleMeasures;
  fixedIncomeMeasures?: EtfMorPortfolioFixedIncomeMeasures;
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

type PortfolioRow = {
  assetAllocation: unknown;
  styleMeasures: unknown;
  fixedIncomeMeasures: unknown;
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
    patch.assetAllocation = (d.assetAllocation ?? null) as object | null;
  }
  if ('styleMeasures' in d) {
    patch.styleMeasures = (d.styleMeasures ?? null) as object | null;
  }
  if ('fixedIncomeMeasures' in d) {
    patch.fixedIncomeMeasures = (d.fixedIncomeMeasures ?? null) as object | null;
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
    patch.bondBreakdown = (d.bondBreakdown ?? null) as object | null;
  }
  if ('holdings' in d) {
    patch.holdings = (d.holdings ?? null) as object | null;
  }

  return patch;
}

function buildPortfolioCreateData(d: PortfolioData): Record<string, unknown> {
  return {
    assetAllocation: ('assetAllocation' in d ? d.assetAllocation ?? null : null) as object | null,
    styleMeasures: ('styleMeasures' in d ? d.styleMeasures ?? null : null) as object | null,
    fixedIncomeMeasures: ('fixedIncomeMeasures' in d ? d.fixedIncomeMeasures ?? null : null) as object | null,
    sectorExposure: ('sectorExposure' in d ? d.sectorExposure ?? null : null) as object | null,
    bondBreakdown: ('bondBreakdown' in d ? d.bondBreakdown ?? null : null) as object | null,
    holdings: ('holdings' in d ? d.holdings ?? null : null) as object | null,
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

    await prisma.etfMorAnalyzerInfo.upsert({
      where: { etfId: etfRecord.id },
      update: {
        overviewNav: overviewMetrics['NAV'] ?? null,
        overviewOneDayReturn: overviewMetrics['1-Day Return'] ?? null,
        overviewTotalAssets: overviewMetrics['Total Assets'] ?? null,
        overviewAdjExpenseRatio: overviewMetrics['Adj. Expense Ratio'] ?? null,
        overviewProspectusNetExpenseRatio: overviewMetrics['Prospectus Net Expense Ratio'] ?? null,
        overviewCategory: overviewMetrics['Category'] ?? null,
        overviewStyleBox: overviewMetrics['Style Box'] ?? overviewMetrics['Equity Style Box'] ?? null,
        overviewSecYield: overviewMetrics['SEC Yield'] ?? null,
        overviewTtmYield: overviewMetrics['TTM Yield'] ?? null,
        overviewTurnover: overviewMetrics['Turnover'] ?? null,
        overviewStatus: overviewMetrics['Status'] ?? null,
        marketNav: marketData['NAV'] ?? null,
        marketOpenPrice: marketData['Open Price'] ?? null,
        marketBidAskSpread: marketData['Bid / Ask / Spread'] ?? null,
        marketVolumeAvg: marketData['Volume / Avg'] ?? null,
        marketDayRange: marketData['Day Range'] ?? null,
        marketYearRange: marketData['Year Range'] ?? null,
        analysis: analysis as any,
        returnsAnnual: (returns.annual ?? []) as any,
        returnsTrailing: (returns.trailing ?? []) as any,
        holdings: holdings as any,
        strategyText: strategy.text ?? null,
      },
      create: {
        etf: { connect: { id: etfRecord.id } },
        overviewNav: overviewMetrics['NAV'] ?? null,
        overviewOneDayReturn: overviewMetrics['1-Day Return'] ?? null,
        overviewTotalAssets: overviewMetrics['Total Assets'] ?? null,
        overviewAdjExpenseRatio: overviewMetrics['Adj. Expense Ratio'] ?? null,
        overviewProspectusNetExpenseRatio: overviewMetrics['Prospectus Net Expense Ratio'] ?? null,
        overviewCategory: overviewMetrics['Category'] ?? null,
        overviewStyleBox: overviewMetrics['Style Box'] ?? overviewMetrics['Equity Style Box'] ?? null,
        overviewSecYield: overviewMetrics['SEC Yield'] ?? null,
        overviewTtmYield: overviewMetrics['TTM Yield'] ?? null,
        overviewTurnover: overviewMetrics['Turnover'] ?? null,
        overviewStatus: overviewMetrics['Status'] ?? null,
        marketNav: marketData['NAV'] ?? null,
        marketOpenPrice: marketData['Open Price'] ?? null,
        marketBidAskSpread: marketData['Bid / Ask / Spread'] ?? null,
        marketVolumeAvg: marketData['Volume / Avg'] ?? null,
        marketDayRange: marketData['Day Range'] ?? null,
        marketYearRange: marketData['Year Range'] ?? null,
        analysis: analysis as any,
        returnsAnnual: (returns.annual ?? []) as any,
        returnsTrailing: (returns.trailing ?? []) as any,
        holdings: holdings as any,
        strategyText: strategy.text ?? null,
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

    await prisma.etfMorPeopleInfo.upsert({
      where: { etfId: etfRecord.id },
      update: {
        inceptionDate: people.inceptionDate ?? null,
        numberOfManagers: people.numberOfManagers ?? null,
        longestTenure: people.longestTenure ?? null,
        advisors: people.advisors ?? null,
        averageTenure: people.averageTenure ?? null,
        currentManagers: managementTeam as any,
      },
      create: {
        etf: { connect: { id: etfRecord.id } },
        inceptionDate: people.inceptionDate ?? null,
        numberOfManagers: people.numberOfManagers ?? null,
        longestTenure: people.longestTenure ?? null,
        advisors: people.advisors ?? null,
        averageTenure: people.averageTenure ?? null,
        currentManagers: managementTeam as any,
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
            fixedIncomeMeasures: existingRow.fixedIncomeMeasures,
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
