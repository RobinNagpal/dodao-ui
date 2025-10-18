import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1, TickerV1Industry, TickerV1SubIndustry, TickerV1VsCompetition } from '@prisma/client';
import { NextRequest } from 'next/server';

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

export const GET = withErrorHandlingV2<TickerV1VsCompetitionWithRelations[]>(getHandler);
