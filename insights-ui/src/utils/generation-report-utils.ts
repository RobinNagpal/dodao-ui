import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { GenerationRequestStatus, ReportType, TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry, VERDICT_DEFINITIONS } from '@/types/ticker-typesv1';
import { getLLMResponseForPromptViaInvocationViaLambda, prepareBaseTickerInputJson, prepareFactorAnalysisInputJson } from '@/utils/llm-callback-lambda-utils';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForAnalysis, extractFinancialDataForPastPerformance } from '@/utils/stock-analyzer-scraper-utils';
import { AnalysisCategoryFactor, TickerV1GenerationRequest } from '@prisma/client';

async function trigggerGenerationOfNextReport(symbol: string, generationRequest: TickerV1GenerationRequest): Promise<void> {
  // Get ticker from DB
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      symbol: symbol.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
    },
  });

  // Update the request status to InProgress
  await prisma.tickerV1GenerationRequest.update({
    where: {
      id: generationRequest.id,
    },
    data: {
      status: GenerationRequestStatus.InProgress,
      startedAt: new Date(),
    },
  });

  let competitionData: { competitionAnalysisArray: CompetitionAnalysisArray } | null = null;

  const spaceId = KoalaGainsSpaceId;
  try {
    // Generate competition analysis first if needed (other analyses depend on it)
    if (generationRequest.regenerateCompetition) {
      await generateCompetitionAnalysis(spaceId, tickerRecord);

      // Refresh competition data for other analyses
      competitionData = await prisma.tickerV1VsCompetition.findFirst({
        where: {
          spaceId,
          tickerId: tickerRecord.id,
        },
      });
    } else {
      // Get existing competition data
      competitionData = await prisma.tickerV1VsCompetition.findFirst({
        where: {
          spaceId,
          tickerId: tickerRecord.id,
        },
      });
    }

    // Generate other analyses as requested
    if (generationRequest.regenerateFinancialAnalysis) {
      await generateFinancialAnalysis(spaceId, tickerRecord);
    }

    if (generationRequest.regenerateBusinessAndMoat && competitionData) {
      await generateBusinessAndMoatAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray as CompetitionAnalysisArray);
    }

    if (generationRequest.regeneratePastPerformance && competitionData) {
      await generatePastPerformanceAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray as CompetitionAnalysisArray);
    }

    if (generationRequest.regenerateFutureGrowth && competitionData) {
      await generateFutureGrowthAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray as CompetitionAnalysisArray);
    }

    if (generationRequest.regenerateFairValue) {
      await generateFairValueAnalysis(spaceId, tickerRecord);
    }

    if (generationRequest.regenerateFutureRisk) {
      await generateFutureRiskAnalysis(spaceId, tickerRecord);
    }

    if (generationRequest.regenerateWarrenBuffett && competitionData) {
      await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.WARREN_BUFFETT, competitionData.competitionAnalysisArray as CompetitionAnalysisArray);
    }

    if (generationRequest.regenerateCharlieMunger && competitionData) {
      await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.CHARLIE_MUNGER, competitionData.competitionAnalysisArray as CompetitionAnalysisArray);
    }

    if (generationRequest.regenerateBillAckman && competitionData) {
      await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.BILL_ACKMAN, competitionData.competitionAnalysisArray as CompetitionAnalysisArray);
    }

    if (generationRequest.regenerateFinalSummary) {
      await generateFinalSummary(spaceId, tickerRecord);
    }

    // Update the request status to Completed
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GenerationRequestStatus.Completed,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    // Update the request status to Failed
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GenerationRequestStatus.Failed,
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

// Helper functions for generating different types of analyses

async function generateCompetitionAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry): Promise<void> {
  // Prepare input for the prompt
  const inputJson = prepareBaseTickerInputJson(tickerRecord);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/competition',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    ReportType.COMPETITION
  );
}

async function generateFinancialAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Get analysis factors for FinancialStatementAnalysis category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.FinancialStatementAnalysis,
    },
  });

  // Extract comprehensive financial data for analysis
  const financialData = extractFinancialDataForAnalysis(scraperInfo);

  // Prepare base input JSON
  const baseInputJson = prepareBaseTickerInputJson(tickerRecord);

  // Prepare input for the prompt
  const inputJson = {
    ...prepareFactorAnalysisInputJson(baseInputJson, TickerAnalysisCategory.FinancialStatementAnalysis, analysisFactors),
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
  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/financial-statements',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    ReportType.FINANCIAL_ANALYSIS
  );
}

async function generateBusinessAndMoatAnalysis(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  competitionAnalysisArray: CompetitionAnalysisArray
): Promise<void> {
  // Get analysis factors for BusinessAndMoat category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.BusinessAndMoat,
    },
  });

  // Prepare base input JSON
  const baseInputJson = prepareBaseTickerInputJson(tickerRecord);

  // Prepare input for the prompt
  const inputJson = prepareFactorAnalysisInputJson(baseInputJson, TickerAnalysisCategory.BusinessAndMoat, analysisFactors, competitionAnalysisArray);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/business-moat',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    ReportType.BUSINESS_AND_MOAT
  );
}

async function generatePastPerformanceAnalysis(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  competitionAnalysisArray: CompetitionAnalysisArray
): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Extract comprehensive financial data for past performance analysis (last 5 annuals only)
  const financialData = extractFinancialDataForPastPerformance(scraperInfo);

  // Get analysis factors for PastPerformance category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.PastPerformance,
    },
  });

  // Prepare base input JSON
  const baseInputJson = prepareBaseTickerInputJson(tickerRecord);

  // Prepare input for the prompt
  const inputJson = {
    ...prepareFactorAnalysisInputJson(baseInputJson, TickerAnalysisCategory.PastPerformance, analysisFactors, competitionAnalysisArray),
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
  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/past-performance',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    ReportType.PAST_PERFORMANCE
  );
}

async function generateFutureGrowthAnalysis(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  competitionAnalysisArray: CompetitionAnalysisArray
): Promise<void> {
  // Get analysis factors for FutureGrowth category
  const analysisFactors = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.FutureGrowth,
    },
  });

  // Prepare base input JSON
  const baseInputJson = prepareBaseTickerInputJson(tickerRecord);

  // Prepare input for the prompt
  const inputJson = prepareFactorAnalysisInputJson(baseInputJson, TickerAnalysisCategory.FutureGrowth, analysisFactors, competitionAnalysisArray);

  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/future-growth',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    ReportType.FUTURE_GROWTH
  );
}

async function generateFairValueAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Extract comprehensive financial data for analysis
  const financialData = extractFinancialDataForAnalysis(scraperInfo);

  // Get analysis factors for FairValue category
  const analysisFactors: AnalysisCategoryFactor[] = await prisma.analysisCategoryFactor.findMany({
    where: {
      spaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      categoryKey: TickerAnalysisCategory.FairValue,
    },
  });

  // Prepare base input JSON
  const baseInputJson = prepareBaseTickerInputJson(tickerRecord);

  // Prepare input for the prompt
  const inputJson = {
    ...prepareFactorAnalysisInputJson(baseInputJson, TickerAnalysisCategory.FairValue, analysisFactors),
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
  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/fair-value',
      llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    ReportType.FAIR_VALUE
  );
}

async function generateFutureRiskAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry): Promise<void> {
  // Prepare base input JSON
  const inputJson = prepareBaseTickerInputJson(tickerRecord);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/future-risk',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    ReportType.FUTURE_RISK
  );
}

async function generateInvestorAnalysis(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  investorKey: ReportType.BILL_ACKMAN | ReportType.CHARLIE_MUNGER | ReportType.WARREN_BUFFETT,
  competitionAnalysisArray: CompetitionAnalysisArray
): Promise<void> {
  // Prepare base input JSON
  const baseInputJson = prepareBaseTickerInputJson(tickerRecord);

  // Prepare input for the prompt
  const inputJson = {
    ...baseInputJson,
    investorKey,
    verdicts: Object.values(VERDICT_DEFINITIONS),
    competitionAnalysisArray,
  };

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/investor-analysis',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    investorKey
  );
}

async function generateFinalSummary(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry): Promise<void> {
  // Get ticker from DB with all related analysis data
  const tickerWithAnalysis = await prisma.tickerV1.findFirstOrThrow({
    where: {
      id: tickerRecord.id,
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
    },
  });

  // Prepare category summaries from existing analysis results
  const categorySummaries = tickerWithAnalysis.categoryAnalysisResults.map((categoryResult) => ({
    categoryKey: categoryResult.categoryKey,
    overallSummary: categoryResult.summary,
  }));

  // Prepare factor results from existing factor analysis
  const factorResults = tickerWithAnalysis.categoryAnalysisResults.flatMap((categoryResult) =>
    categoryResult.factorResults.map((factorResult) => ({
      categoryKey: categoryResult.categoryKey,
      factorAnalysisKey: factorResult.analysisCategoryFactor.factorAnalysisKey,
      oneLineExplanation: factorResult.oneLineExplanation,
      result: factorResult.result,
    }))
  );

  // Prepare input for the prompt
  const inputJson = {
    name: tickerWithAnalysis.name,
    symbol: tickerWithAnalysis.symbol,
    exchange: tickerWithAnalysis.exchange,
    industryKey: tickerWithAnalysis.industryKey,
    industryName: tickerWithAnalysis.industry.name,
    industryDescription: tickerWithAnalysis.industry.summary,
    subIndustryKey: tickerWithAnalysis.subIndustryKey,
    subIndustryName: tickerWithAnalysis.subIndustry.name,
    subIndustryDescription: tickerWithAnalysis.subIndustry.summary,
    categorySummaries,
    factorResults,
  };

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda(
    {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/final-summary',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    ReportType.FINAL_SUMMARY
  );
}
