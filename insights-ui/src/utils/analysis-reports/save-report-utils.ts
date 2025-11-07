import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionAnalysis, LLMFactorAnalysisResponse, LLMInvestorAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { CATEGORY_MAPPINGS, INVESTOR_MAPPINGS, InvestorTypes, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { fetchAnalysisFactors, fetchTickerRecordWithIndustryAndSubIndustry } from '@/utils/analysis-reports/get-report-data-utils';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { bumpUpdatedAtAndInvalidateCache, updateTickerCachedScore } from '@/utils/ticker-v1-model-utils';
import { z, ZodObject } from 'zod';
import { TickerV1 } from '@prisma/client';

/**
 * Saves factor analysis response for any category
 */
export async function saveFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, tickerAnalysisCategory);

  // Store category analysis result (upsert)
  await prisma.tickerV1CategoryAnalysisResult.upsert({
    where: {
      spaceId_tickerId_categoryKey: {
        spaceId,
        tickerId: tickerRecord.id,
        categoryKey: tickerAnalysisCategory,
      },
    },
    update: {
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      categoryKey: tickerAnalysisCategory,
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  });

  // Store factor results (upsert each one)

  for (const factor of response.factors) {
    const analysisFactorRecord = analysisFactors.find((af) => af.factorAnalysisKey === factor.factorAnalysisKey);

    if (analysisFactorRecord) {
      await prisma.tickerV1AnalysisCategoryFactorResult.upsert({
        where: {
          spaceId_tickerId_analysisCategoryFactorId: {
            spaceId,
            tickerId: tickerRecord.id,
            analysisCategoryFactorId: analysisFactorRecord.id,
          },
        },
        update: {
          oneLineExplanation: factor.oneLineExplanation,
          detailedExplanation: factor.detailedExplanation,
          result: factor.result,
          updatedAt: new Date(),
        },
        create: {
          spaceId,
          tickerId: tickerRecord.id,
          categoryKey: tickerAnalysisCategory,
          analysisCategoryFactorId: analysisFactorRecord.id,
          oneLineExplanation: factor.oneLineExplanation,
          detailedExplanation: factor.detailedExplanation,
          result: factor.result,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
    }
  }

  // Calculate score (number of passed factors out of total)
  const score = response.factors.filter((factor) => factor.result && factor.result.toLowerCase().includes('pass')).length;

  // Update cached score using the utility function
  await updateTickerCachedScore(tickerRecord, tickerAnalysisCategory, score);

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);
}

// Category-specific functions that use the generic saveFactorAnalysisResponse function

export async function saveBusinessAndMoatFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

export async function savePastPerformanceFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

export async function saveFutureGrowthFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

export async function saveFinancialAnalysisFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

export async function saveFairValueFactorAnalysisResponse(
  ticker: string,
  response: LLMFactorAnalysisResponse,
  tickerAnalysisCategory: TickerAnalysisCategory
): Promise<void> {
  await saveFactorAnalysisResponse(ticker, response, tickerAnalysisCategory);
}

/**
 * Saves investor analysis response
 */
export async function saveInvestorAnalysisResponse(ticker: string, response: LLMInvestorAnalysisResponse, investorKey: InvestorTypes): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Store investor analysis result (upsert)
  await prisma.tickerV1InvestorAnalysisResult.upsert({
    where: {
      spaceId_tickerId_investorKey: {
        spaceId,
        tickerId: tickerRecord.id,
        investorKey,
      },
    },
    update: {
      summary: response.summary,
      verdict: response.verdict,
      willInvest: response.willInvest,
      topCompaniesToConsider: response.topCompaniesToConsider,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      investorKey,
      summary: response.summary,
      verdict: response.verdict,
      willInvest: response.willInvest,
      topCompaniesToConsider: response.topCompaniesToConsider,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  });

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);
}

/**
 * Saves competition analysis response
 */
export async function saveCompetitionAnalysisResponse(
  ticker: string,
  response: {
    summary: string;
    overallAnalysisDetails: string;
    competitionAnalysisArray: Array<{
      companyName: string;
      companySymbol?: string;
      exchangeSymbol?: string;
      exchangeName?: string;
      detailedComparison: string;
    }>;
  }
): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Store competition analysis result (upsert)
  await prisma.tickerV1VsCompetition.upsert({
    where: {
      spaceId_tickerId: {
        spaceId,
        tickerId: tickerRecord.id,
      },
    },
    update: {
      summary: response.summary,
      overallAnalysisDetails: response.overallAnalysisDetails,
      competitionAnalysisArray: response.competitionAnalysisArray,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      summary: response.summary,
      overallAnalysisDetails: response.overallAnalysisDetails,
      competitionAnalysisArray: response.competitionAnalysisArray,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  });

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);
}

/**
 * Saves future risk response
 */
export async function saveFutureRiskResponse(
  ticker: string,
  response: {
    summary: string;
    detailedAnalysis: string;
  }
): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Store future risk analysis result (upsert)
  await prisma.tickerV1FutureRisk.upsert({
    where: {
      spaceId_tickerId: {
        spaceId,
        tickerId: tickerRecord.id,
      },
    },
    update: {
      summary: response.summary,
      detailedAnalysis: response.detailedAnalysis,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      tickerId: tickerRecord.id,
      summary: response.summary,
      detailedAnalysis: response.detailedAnalysis,
    },
  });

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);
}

/**
 * Saves final summary response
 */
export async function saveFinalSummaryResponse(ticker: string, finalSummary: string, metaDescription: string, aboutReport: string): Promise<void> {
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Update the ticker's summary, meta description, and about report fields
  await prisma.tickerV1.update({
    where: {
      id: tickerRecord.id,
    },
    data: {
      summary: finalSummary,
      metaDescription: metaDescription,
      aboutReport: aboutReport,
      updatedAt: new Date(),
    },
  });

  revalidateTickerAndExchangeTag(tickerRecord.symbol, tickerRecord.exchange);
}

// Zod schema for the aboutReport response
const AboutReportSchema: ZodObject<{ aboutReport: z.ZodString }> = z.object({
  aboutReport: z.string().describe('A 2-3 sentence summary for the stock analysis report'),
});

/**
 * Gets the top 3 competitors from the competition analysis
 */
function getTopCompetitors(tickerRecord: TickerV1 & { vsCompetition?: { competitionAnalysisArray: CompetitionAnalysis[] } | null }): {
  comp1: string;
  comp2: string;
  comp3: string;
  totalCount: number;
} {
  const defaultComp1 = 'Apple Inc. (AAPL)';
  const defaultComp2 = 'Microsoft Corporation (MSFT)';
  const defaultComp3 = 'Google Inc. (GOOGL)';

  if (!tickerRecord.vsCompetition?.competitionAnalysisArray) {
    return { comp1: defaultComp1, comp2: defaultComp2, comp3: defaultComp3, totalCount: 3 };
  }

  const allCompetitors = tickerRecord.vsCompetition.competitionAnalysisArray.filter((comp: CompetitionAnalysis) => comp.companyName && comp.companySymbol);

  const competitors = allCompetitors.slice(0, 3); // Get first 3
  const totalCount = allCompetitors.length;

  if (competitors.length === 0) {
    return { comp1: defaultComp1, comp2: defaultComp2, comp3: defaultComp3, totalCount: 3 };
  }

  if (competitors.length === 1) {
    return {
      comp1: `${competitors[0].companyName} (${competitors[0].companySymbol})`,
      comp2: defaultComp2,
      comp3: defaultComp3,
      totalCount,
    };
  }

  if (competitors.length === 2) {
    return {
      comp1: `${competitors[0].companyName} (${competitors[0].companySymbol})`,
      comp2: `${competitors[1].companyName} (${competitors[1].companySymbol})`,
      comp3: defaultComp3,
      totalCount,
    };
  }

  return {
    comp1: `${competitors[0].companyName} (${competitors[0].companySymbol})`,
    comp2: `${competitors[1].companyName} (${competitors[1].companySymbol})`,
    comp3: `${competitors[2].companyName} (${competitors[2].companySymbol})`,
    totalCount,
  };
}

/**
 * Builds the base aboutReport text
 */
export function buildBaseAboutReport(tickerRecord: TickerV1 & { vsCompetition?: { competitionAnalysisArray: CompetitionAnalysis[] } | null }): string {
  const { comp1, comp2, comp3, totalCount } = getTopCompetitors(tickerRecord);

  // Get all category names (factors)
  const factors = Object.values(CATEGORY_MAPPINGS).join(', ');

  // Get 2 investor names
  const investorKeys = Object.keys(INVESTOR_MAPPINGS);
  const investor1 = INVESTOR_MAPPINGS[investorKeys[0] as keyof typeof INVESTOR_MAPPINGS];
  const investor2 = INVESTOR_MAPPINGS[investorKeys[1] as keyof typeof INVESTOR_MAPPINGS];

  // Use today's date instead of ticker's updatedAt
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build competitors string with "and X more" logic
  let competitorsText = '';
  if (totalCount <= 3) {
    // Show all competitors if 3 or fewer
    if (totalCount === 1) {
      competitorsText = comp1;
    } else if (totalCount === 2) {
      competitorsText = `${comp1} and ${comp2}`;
    } else {
      competitorsText = `${comp1}, ${comp2} and ${comp3}`;
    }
  } else {
    // Show first 3 and mention how many more
    const remainingCount = totalCount - 3;
    competitorsText = `${comp1}, ${comp2}, ${comp3} and ${remainingCount} more`;
  }

  const baseInfo = `This report examines ${tickerRecord.name} (${tickerRecord.symbol}) on five angles—${factors}. It also benchmarks against ${competitorsText}, and maps takeaways to ${investor1}/${investor2} styles. Last updated ${today}.`;

  return baseInfo;
}
