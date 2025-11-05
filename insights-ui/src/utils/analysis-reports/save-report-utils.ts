import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionAnalysis, LLMFactorAnalysisResponse, LLMInvestorAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { CATEGORY_MAPPINGS, EvaluationResult, INVESTOR_MAPPINGS, InvestorTypes, ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { fetchAnalysisFactors, fetchTickerRecordWithIndustryAndSubIndustry } from '@/utils/analysis-reports/get-report-data-utils';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { bumpUpdatedAtAndInvalidateCache, FullTickerV1CategoryAnalysisResult, updateTickerCachedScore } from '@/utils/ticker-v1-model-utils';
import { getLlmResponse } from '@/scripts/llm‑utils‑gemini';
import { GeminiModelType } from '@/types/llmConstants';
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
export async function saveFinalSummaryResponse(ticker: string, finalSummary: string, metaDescription: string): Promise<void> {
  const tickerRecord = await fetchTickerRecordWithIndustryAndSubIndustry(ticker);

  // Update the ticker's summary and meta description fields
  await prisma.tickerV1.update({
    where: {
      id: tickerRecord.id,
    },
    data: {
      summary: finalSummary,
      metaDescription: metaDescription,
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
function buildBaseAboutReport(tickerRecord: TickerV1 & { vsCompetition?: { competitionAnalysisArray: CompetitionAnalysis[] } | null }): string {
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

/**
 * Generates aboutReport using LLM
 */
async function generateAboutReport(tickerRecord: TickerV1 & { vsCompetition?: { competitionAnalysisArray: CompetitionAnalysis[] } | null }): Promise<string> {
  const baseInfo = buildBaseAboutReport(tickerRecord);

  const prompt = `You are an expert financial writer creating compelling, SEO-friendly introductions for detailed stock analysis reports. Your primary goal is to generate a unique 2-3 sentence summary for each stock to avoid duplicate content penalties from search engines.

**Instructions:**
1. Rewrite the "Base Information" below into a fresh and engaging summary for an investor.
2. The summary MUST be between 2 and 3 sentences.
3. Naturally incorporate all the provided.
4. Vary the sentence structure and vocabulary significantly with each request to ensure uniqueness.
5. The tone should be professional, insightful, and authoritative.

**Base Information:**
${baseInfo}`;

  try {
    const response = await getLlmResponse<{ aboutReport: string }>(prompt, AboutReportSchema, GeminiModelType.GEMINI_2_5_PRO);
    return response.aboutReport;
  } catch (error) {
    console.error('Failed to generate aboutReport:', error);
    return baseInfo;
  }
}

/**
 * Calculates the total score based on category analysis results
 */
function calculateTotalScore(
  tickerRecord: TickerV1 & {
    categoryAnalysisResults?: Array<{
      categoryKey: string;
      factorResults?: Array<{
        result: string;
      }>;
    }>;
  }
): number {
  return Object.entries(CATEGORY_MAPPINGS)
    .map(([categoryKey]) => {
      const report = (tickerRecord.categoryAnalysisResults || []).find((r) => r.categoryKey === categoryKey);

      const scoresArray = report?.factorResults?.map((factorResult) => (factorResult.result === EvaluationResult.Pass ? 1 : 0)) || [];

      const categoryScoreSum: number = scoresArray.reduce((partialSum: number, a) => partialSum + a, 0);

      return categoryScoreSum;
    })
    .reduce((partialSum: number, a) => partialSum + a, 0);
}

/**
 * Saves cached score and about report
 */
export async function saveCachedScoreAndAboutReport(ticker: string): Promise<void> {
  const spaceId = KoalaGainsSpaceId;

  // Get ticker from DB with all necessary data
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      categoryAnalysisResults: {
        include: {
          factorResults: {
            include: {
              analysisCategoryFactor: true,
            },
          },
        },
      },
      investorAnalysisResults: true,
      futureRisks: true,
      vsCompetition: true,
    },
  });

  // Calculate the total score
  const totalScore = calculateTotalScore(tickerRecord);

  // Generate aboutReport using LLM
  const aboutReport = await generateAboutReport(tickerRecord);

  // Update the ticker with the calculated score and about report
  await prisma.tickerV1.update({
    data: {
      cachedScore: totalScore,
      aboutReport: aboutReport,
    },
    where: {
      id: tickerRecord.id,
    },
  });

  revalidateTickerAndExchangeTag(tickerRecord.symbol, tickerRecord.exchange);
}
