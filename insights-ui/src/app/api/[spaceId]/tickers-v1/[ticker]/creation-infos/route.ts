import { prisma } from '@/prisma';
import { ExchangeId } from '@/utils/exchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1, TickerV1Industry, TickerV1SubIndustry, TickerV1VsCompetition } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface NewTickerSubmission {
  name: string;
  symbol: string;
  exchange: ExchangeId;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl: string;
  /** optional in API, keep as empty string when not provided */
  stockAnalyzeUrl: string;
}

export interface TickerV1VsCompetitionWithRelations extends TickerV1VsCompetition {
  ticker: TickerV1 & {
    industry: TickerV1Industry;
    subIndustry: TickerV1SubIndustry;
  };
}

/** Case-insensitive variant */
async function findByCompanySymbolCI(symbol: string): Promise<TickerV1VsCompetitionWithRelations[]> {
  const rows: TickerV1VsCompetition[] = await prisma.$queryRaw<TickerV1VsCompetition[]>(Prisma.sql`
    SELECT
      id,
      summary,
      introduction_to_analysis AS "overallAnalysisDetails",
      competition_analysis      AS "competitionAnalysisArray",
      ticker_id                 AS "tickerId",
      space_id                  AS "spaceId",
      created_at                AS "createdAt",
      updated_at                AS "updatedAt",
      created_by                AS "createdBy",
      updated_by                AS "updatedBy"
    FROM public.ticker_v1_vs_competition t
    WHERE EXISTS (
      SELECT 1
      FROM unnest(t.competition_analysis) AS elem
      WHERE (elem ->> 'companySymbol') ILIKE ${symbol}
    )
  `);

  return prisma.tickerV1VsCompetition.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    include: {
      ticker: {
        include: {
          industry: true,
          subIndustry: true,
        },
      },
    },
  });
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1VsCompetitionWithRelations[]> {
  const { ticker } = await context.params;

  const competitionRecords = await findByCompanySymbolCI(ticker);

  return competitionRecords;
}

async function createTickerFomCompetition(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1> {
  const { spaceId, ticker } = await context.params;

  const body: NewTickerSubmission = await req.json();

  if (!body.exchange || !body.name || !body.industryKey || !body.subIndustryKey || !body.websiteUrl) {
    throw new Error('exchange, name, industryKey, subIndustryKey, and websiteUrl are required');
  }

  const currentTicker = await prisma.tickerV1.findFirst({
    where: {
      spaceId: spaceId,
      symbol: ticker.toUpperCase(),
    },
  });

  if (currentTicker) {
    throw new Error('Ticker already exists');
  }

  const tickerRecord = await prisma.tickerV1.create({
    data: {
      spaceId: spaceId,
      symbol: ticker.toUpperCase(),
      exchange: body.exchange,
      name: body.name,
      industryKey: body.industryKey,
      subIndustryKey: body.subIndustryKey,
      websiteUrl: body.websiteUrl,
      stockAnalyzeUrl: body.stockAnalyzeUrl,
    },
  });

  await prisma.tickerV1GenerationRequest.create({
    data: {
      tickerId: tickerRecord.id,
      regenerateCompetition: true,
      regenerateFinancialAnalysis: true,
      regenerateBusinessAndMoat: true,
      regeneratePastPerformance: true,
      regenerateFutureGrowth: true,
      regenerateFairValue: true,
      regenerateFutureRisk: true,
      regenerateWarrenBuffett: true,
      regenerateCharlieMunger: true,
      regenerateBillAckman: true,
      regenerateFinalSummary: true,
      regenerateCachedScore: true,
    },
  });

  return tickerRecord;
}

export const POST = withErrorHandlingV2<TickerV1>(createTickerFomCompetition);

export const GET = withErrorHandlingV2<TickerV1VsCompetitionWithRelations[]>(getHandler);
