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
} from '@/types/prismaTypes';
import { revalidateEtfAndExchangeTag } from '@/utils/etf-cache-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

type MorKind = 'quote' | 'risk' | 'people';

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

interface CallbackBody {
  url: string;
  section: string;
  data: QuoteData | EtfMorRiskPeriods | PeopleData;
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
  } else {
    throw new Error(`Unknown kind: ${kind}`);
  }

  revalidateEtfAndExchangeTag(etfRecord.symbol, etfRecord.exchange);

  return { success: true, kind, errors: lambdaErrors };
}

export const POST = withErrorHandlingV2<MorInfoCallbackResponse>(postHandler);
