import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1VsCompetition } from '@prisma/client';
import { NextRequest } from 'next/server';

/** Case-insensitive variant */
export async function findByCompanySymbolCI(symbol: string): Promise<TickerV1VsCompetition[]> {
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

  return rows;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1VsCompetition[]> {
  const { ticker } = await context.params;

  const competitionRecords = await findByCompanySymbolCI(ticker);

  return competitionRecords;
}

export const GET = withErrorHandlingV2<TickerV1VsCompetition[]>(getHandler);
