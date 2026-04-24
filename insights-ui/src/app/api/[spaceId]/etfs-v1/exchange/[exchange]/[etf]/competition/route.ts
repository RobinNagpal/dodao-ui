import { prisma } from '@/prisma';
import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import type { EtfCompetitionResponse, EtfCompetitor } from '@/types/etf/etf-analysis-types';
import { CompetitionAnalysis } from '@/types/public-equity/analysis-factors-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(
  _req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfCompetitionResponse> {
  const { spaceId, exchange, etf } = await context.params;
  const where = getEtfWhereClause({ spaceId, exchange, etf });

  const etfRecord = await prisma.etf.findFirst({
    where,
    include: {
      vsCompetition: true,
      cachedScore: true,
    },
  });

  if (!etfRecord) {
    return { vsCompetition: null, competitors: [], etf: undefined };
  }

  const competitionArray = (etfRecord.vsCompetition?.competitionAnalysisArray ?? []) as unknown as CompetitionAnalysis[];
  const competitors = await hydrateEtfCompetitors(competitionArray);

  return {
    vsCompetition: etfRecord.vsCompetition
      ? {
          overallAnalysisDetails: etfRecord.vsCompetition.overallAnalysisDetails,
          createdAt: etfRecord.vsCompetition.createdAt,
          updatedAt: etfRecord.vsCompetition.updatedAt,
        }
      : null,
    competitors,
    etf: {
      id: etfRecord.id,
      name: etfRecord.name,
      symbol: etfRecord.symbol,
      exchange: etfRecord.exchange,
      cachedScoreEntry: etfRecord.cachedScore
        ? {
            performanceAndReturnsScore: etfRecord.cachedScore.performanceAndReturnsScore,
            costEfficiencyAndTeamScore: etfRecord.cachedScore.costEfficiencyAndTeamScore,
            riskAnalysisScore: etfRecord.cachedScore.riskAnalysisScore,
            futurePerformanceOutlookScore: etfRecord.cachedScore.futurePerformanceOutlookScore,
            finalScore: etfRecord.cachedScore.finalScore,
          }
        : null,
      createdAt: etfRecord.createdAt,
      updatedAt: etfRecord.updatedAt,
    },
  };
}

/**
 * For each LLM-produced peer, look up whether we already cover that ETF so the
 * UI can link to its report and plot its cached score on the quadrant chart.
 * Single batched query — no N+1.
 */
async function hydrateEtfCompetitors(competitionArray: CompetitionAnalysis[]): Promise<EtfCompetitor[]> {
  if (!competitionArray.length) return [];

  const symbolsToCheck = competitionArray.map((c) => c.companySymbol?.toUpperCase()).filter((symbol): symbol is string => !!symbol);

  const existingEtfs =
    symbolsToCheck.length > 0
      ? await prisma.etf.findMany({
          where: {
            spaceId: KoalaGainsSpaceId,
            symbol: { in: symbolsToCheck },
          },
          select: {
            id: true,
            name: true,
            symbol: true,
            exchange: true,
            cachedScore: {
              select: {
                performanceAndReturnsScore: true,
                costEfficiencyAndTeamScore: true,
                riskAnalysisScore: true,
                futurePerformanceOutlookScore: true,
                finalScore: true,
              },
            },
          },
        })
      : [];

  const etfMap = new Map(existingEtfs.map((e) => [e.symbol.toUpperCase(), e]));

  return competitionArray.map((entry) => {
    const symbolUpper = entry.companySymbol?.toUpperCase();
    const existing = symbolUpper ? etfMap.get(symbolUpper) : undefined;

    return {
      companyName: entry.companyName,
      companySymbol: entry.companySymbol,
      exchangeSymbol: entry.exchangeSymbol,
      exchangeName: entry.exchangeName,
      detailedComparison: entry.detailedComparison,
      existsInSystem: !!existing,
      etfData: existing
        ? {
            id: existing.id,
            name: existing.name,
            symbol: existing.symbol,
            exchange: existing.exchange,
            cachedScoreEntry: existing.cachedScore,
          }
        : undefined,
    };
  });
}

export const GET = withErrorHandlingV2<EtfCompetitionResponse>(getHandler);
