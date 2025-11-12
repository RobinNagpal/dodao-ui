import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry } from '@/types/ticker-typesv1';
import { AnalysisCategoryFactor, TickerV1 } from '@prisma/client';

/**
 * Fetches ticker record with industry and subIndustry information
 */
export async function fetchTickerRecordWithIndustryAndSubIndustry(ticker: string): Promise<TickerV1WithIndustryAndSubIndustry> {
  const spaceId = KoalaGainsSpaceId;
  return await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
    },
  });
}

/**
 * Fetches ticker record with industry and subIndustry information
 */
export async function fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry(
  symbol: string,
  exchange: string
): Promise<TickerV1WithIndustryAndSubIndustry> {
  const spaceId = KoalaGainsSpaceId;
  return await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
    },
  });
}

/**
 * Fetches analysis factors for a specific category
 */
export async function fetchAnalysisFactors(tickerRecord: TickerV1, tickerAnalysisCategory: TickerAnalysisCategory): Promise<AnalysisCategoryFactor[]> {
  const spaceId = KoalaGainsSpaceId;
  return await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: tickerAnalysisCategory,
    },
  });
}

/**
 * Fetches ticker record with all related analysis data
 */
export async function fetchTickerRecordWithAnalysisData(ticker: string): Promise<
  TickerV1WithIndustryAndSubIndustry & {
    categoryAnalysisResults: Array<{
      categoryKey: string;
      summary: string;
      factorResults: Array<{
        analysisCategoryFactor: {
          factorAnalysisKey: string;
        };
        oneLineExplanation: string;
        result: string;
      }>;
    }>;
    vsCompetition?: {
      competitionAnalysisArray: CompetitionAnalysisArray;
    } | null;
  }
> {
  const spaceId = KoalaGainsSpaceId;
  return await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
      categoryAnalysisResults: {
        include: {
          factorResults: {
            include: {
              analysisCategoryFactor: true,
            },
          },
        },
      },
      vsCompetition: true,
    },
  });
}

export async function getCompetitionAnalysisArray(tickerRecord: TickerV1): Promise<CompetitionAnalysisArray> {
  const competitionData = await prisma.tickerV1VsCompetition.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      tickerId: tickerRecord.id,
    },
  });

  return competitionData.competitionAnalysisArray;
}
