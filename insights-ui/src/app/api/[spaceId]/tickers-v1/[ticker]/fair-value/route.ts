import { getLLMResponseForPromptViaInvocation } from '@/util/get-llm-response';
import { bumpUpdatedAtAndInvalidateCache, updateTickerCachedScore } from '@/utils/ticker-v1-model-utils';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForAnalysis } from '@/utils/stock-analyzer-scraper-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { CompetitionAnalysisArray, LLMFactorAnalysisResponse, TickerAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerAnalysisResponse> {
  const { spaceId, ticker } = await params;

  // Get ticker from DB
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
      financialInfo: true,
    },
  });

  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Get competition analysis (required for fair value analysis)
  const competitionData = await prisma.tickerV1VsCompetition.findFirstOrThrow({
    where: {
      spaceId,
      tickerId: tickerRecord.id,
    },
  });

  // Extract comprehensive financial data for analysis
  const financialData = extractFinancialDataForAnalysis(scraperInfo);

  // Get analysis factors for FairValue category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.FairValue,
    },
  });

  const fi = tickerRecord.financialInfo;

  // Prepare input for the prompt
  const inputJson = {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    industryKey: tickerRecord.industryKey,
    industryName: tickerRecord.industry.name,
    industryDescription: tickerRecord.industry.summary,
    subIndustryKey: tickerRecord.subIndustryKey,
    subIndustryName: tickerRecord.subIndustry.name,
    subIndustryDescription: tickerRecord.subIndustry.summary,
    categoryKey: TickerAnalysisCategory.FairValue,
    factorAnalysisArray: analysisFactors.map((factor) => ({
      factorAnalysisKey: factor.factorAnalysisKey,
      factorAnalysisTitle: factor.factorAnalysisTitle,
      factorAnalysisDescription: factor.factorAnalysisDescription,
      factorAnalysisMetrics: factor.factorAnalysisMetrics || '',
    })),
    competitionAnalysisArray: competitionData.competitionAnalysisArray as CompetitionAnalysisArray,

    // Market Snapshot
    marketSummary: JSON.stringify(financialData.marketSummary),

    // Financial Statements - last 5 annuals
    incomeStatement: JSON.stringify(financialData.incomeStatement),
    balanceSheet: JSON.stringify(financialData.balanceSheet),
    cashFlow: JSON.stringify(financialData.cashFlow),
    ratios: JSON.stringify(financialData.ratios),
    dividends: JSON.stringify(financialData.dividends),
  };

  // Call the LLM
  const result = await getLLMResponseForPromptViaInvocation({
    spaceId,
    inputJson,
    promptKey: 'US/public-equities-v1/fair-value',
    llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
    model: GeminiModel.GEMINI_2_5_PRO,
    requestFrom: 'ui',
  });

  if (!result) {
    throw new Error('Failed to get response from LLM');
  }

  const response = result.response as LLMFactorAnalysisResponse;

  // Store category analysis result (upsert)
  const categoryResult = await prisma.tickerV1CategoryAnalysisResult.upsert({
    where: {
      spaceId_tickerId_categoryKey: {
        spaceId,
        tickerId: tickerRecord.id,
        categoryKey: TickerAnalysisCategory.FairValue,
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
      categoryKey: TickerAnalysisCategory.FairValue,
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
    },
  });

  // Store factor results (upsert each one)
  const factorResults = [];
  for (const factor of response.factors) {
    const analysisFactorRecord = analysisFactors.find((af) => af.factorAnalysisKey === factor.factorAnalysisKey);

    if (analysisFactorRecord) {
      const factorResult = await prisma.tickerV1AnalysisCategoryFactorResult.upsert({
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
          categoryKey: TickerAnalysisCategory.FairValue,
          analysisCategoryFactorId: analysisFactorRecord.id,
          oneLineExplanation: factor.oneLineExplanation,
          detailedExplanation: factor.detailedExplanation,
          result: factor.result,
        },
      });
      factorResults.push(factorResult);
    }
  }

  // Calculate fair value score (number of passed factors out of 5)
  const fairValueScore = response.factors.filter((factor) => factor.result && factor.result.toLowerCase().includes('pass')).length;

  // Update cached score using the utility function
  await updateTickerCachedScore(tickerRecord, TickerAnalysisCategory.FairValue, fairValueScore);

  await bumpUpdatedAtAndInvalidateCache(tickerRecord);

  return {
    success: true,
    invocationId: result.invocationId,
  };
}

export const POST = withErrorHandlingV2<TickerAnalysisResponse>(postHandler);
