import { prisma } from '@/prisma';
import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfScoresResponse {
  performanceAndReturnsScore: number;
  costEfficiencyAndTeamScore: number;
  riskAnalysisScore: number;
  futurePerformanceOutlookScore: number | null;
  finalScore: number;
}

async function getHandler(
  _req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfScoresResponse | null> {
  const { spaceId, exchange, etf } = await context.params;
  const where = getEtfWhereClause({ spaceId, exchange, etf });

  const etfRecord = await prisma.etf.findFirst({
    where,
    select: { id: true },
  });

  if (!etfRecord) return null;

  const cached = await prisma.etfCachedScore.findUnique({
    where: { etfId: etfRecord.id },
  });

  if (!cached) return null;

  return {
    performanceAndReturnsScore: cached.performanceAndReturnsScore,
    costEfficiencyAndTeamScore: cached.costEfficiencyAndTeamScore,
    riskAnalysisScore: cached.riskAnalysisScore,
    futurePerformanceOutlookScore: cached.futurePerformanceOutlookScore,
    finalScore: cached.finalScore,
  };
}

export const GET = withErrorHandlingV2<EtfScoresResponse | null>(getHandler);
