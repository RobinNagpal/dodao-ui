import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { GenerationRequestStatus, ReportType, TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry, VERDICT_DEFINITIONS } from '@/types/ticker-typesv1';
import { getLLMResponseForPromptViaInvocationViaLambda, prepareBaseTickerInputJson, prepareFactorAnalysisInputJson } from '@/utils/llm-callback-lambda-utils';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForAnalysis, extractFinancialDataForPastPerformance } from '@/utils/stock-analyzer-scraper-utils';
import { AnalysisCategoryFactor, TickerV1GenerationRequest } from '@prisma/client';

/**
 * Type definition for a report in the generation order
 */
interface ReportOrderItem {
  reportType: ReportType;
  condition: boolean;
  needsCompetitionData: boolean;
  generateFn: () => Promise<void>;
}

/**
 * Fetches ticker data from the database
 */
async function fetchTickerData(symbol: string): Promise<TickerV1WithIndustryAndSubIndustry> {
  return await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      symbol: symbol.toUpperCase(),
    },
    include: {
      industry: true,
      subIndustry: true,
    },
  });
}

/**
 * Handles in-progress steps and timeouts
 * Returns true if the function should exit early
 */
async function handleInProgressStep(
  generationRequest: TickerV1GenerationRequest
): Promise<{ isInProgressOrIsCompleted: boolean; updatedRequest: TickerV1GenerationRequest }> {
  if (generationRequest.status === GenerationRequestStatus.Completed) {
    return { isInProgressOrIsCompleted: true, updatedRequest: generationRequest };
  }

  if (!generationRequest.inProgressStep) {
    return { isInProgressOrIsCompleted: false, updatedRequest: generationRequest };
  }

  // Check if it's been more than 5 minutes since the last invocation time
  const lastInvocationTime = generationRequest.lastInvocationTime;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  if (lastInvocationTime && lastInvocationTime < fiveMinutesAgo) {
    // Add the step to failedSteps if it's been more than 5 minutes
    const updatedFailedSteps = [...generationRequest.failedSteps, generationRequest.inProgressStep];

    // Update the generation request
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        failedSteps: updatedFailedSteps,
        inProgressStep: null,
      },
    });

    // Refresh the generation request
    const updatedRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
      where: {
        id: generationRequest.id,
      },
    });

    return { isInProgressOrIsCompleted: false, updatedRequest };
  } else {
    // If it's not been more than 5 minutes, return early
    return { isInProgressOrIsCompleted: true, updatedRequest: generationRequest };
  }
}

/**
 * Updates the generation request status for first-time runs
 */
async function updateInitialStatus(generationRequest: TickerV1GenerationRequest): Promise<void> {
  if (generationRequest.status === GenerationRequestStatus.NotStarted) {
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GenerationRequestStatus.InProgress,
        startedAt: new Date(),
      },
    });
  }
}

/**
 * Fetches competition data if needed for other analyses
 */
async function fetchCompetitionData(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  generationRequest: TickerV1GenerationRequest
): Promise<{ competitionAnalysisArray: CompetitionAnalysisArray } | null> {
  if (!generationRequest.regenerateCompetition || generationRequest.completedSteps.includes(ReportType.COMPETITION)) {
    return await prisma.tickerV1VsCompetition.findFirst({
      where: {
        spaceId,
        tickerId: tickerRecord.id,
      },
    });
  }
  return null;
}

/**
 * Defines the order of reports to generate
 */
function defineReportOrder(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  generationRequest: TickerV1GenerationRequest,
  competitionData: { competitionAnalysisArray: CompetitionAnalysisArray } | null
): ReportOrderItem[] {
  return [
    {
      reportType: ReportType.COMPETITION,
      condition: generationRequest.regenerateCompetition || !competitionData || !competitionData.competitionAnalysisArray.length,
      needsCompetitionData: false,
      generateFn: async () => {
        await generateCompetitionAnalysis(spaceId, tickerRecord);
        // Refresh competition data for other analyses - this is a side effect that modifies the outer competitionData variable
        competitionData = await prisma.tickerV1VsCompetition.findFirst({
          where: {
            spaceId,
            tickerId: tickerRecord.id,
          },
        });
      },
    },
    {
      reportType: ReportType.FINANCIAL_ANALYSIS,
      condition: generationRequest.regenerateFinancialAnalysis,
      needsCompetitionData: false,
      generateFn: async () => await generateFinancialAnalysis(spaceId, tickerRecord),
    },
    {
      reportType: ReportType.BUSINESS_AND_MOAT,
      condition: generationRequest.regenerateBusinessAndMoat,
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateBusinessAndMoatAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray);
        }
      },
    },
    {
      reportType: ReportType.PAST_PERFORMANCE,
      condition: generationRequest.regeneratePastPerformance,
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generatePastPerformanceAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray);
        }
      },
    },
    {
      reportType: ReportType.FUTURE_GROWTH,
      condition: generationRequest.regenerateFutureGrowth,
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateFutureGrowthAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray);
        }
      },
    },
    {
      reportType: ReportType.FAIR_VALUE,
      condition: generationRequest.regenerateFairValue,
      needsCompetitionData: false,
      generateFn: async () => await generateFairValueAnalysis(spaceId, tickerRecord),
    },
    {
      reportType: ReportType.FUTURE_RISK,
      condition: generationRequest.regenerateFutureRisk,
      needsCompetitionData: false,
      generateFn: async () => await generateFutureRiskAnalysis(spaceId, tickerRecord),
    },
    {
      reportType: ReportType.WARREN_BUFFETT,
      condition: generationRequest.regenerateWarrenBuffett,
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.WARREN_BUFFETT, competitionData.competitionAnalysisArray);
        }
      },
    },
    {
      reportType: ReportType.CHARLIE_MUNGER,
      condition: generationRequest.regenerateCharlieMunger,
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.CHARLIE_MUNGER, competitionData.competitionAnalysisArray);
        }
      },
    },
    {
      reportType: ReportType.BILL_ACKMAN,
      condition: generationRequest.regenerateBillAckman,
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.BILL_ACKMAN, competitionData.competitionAnalysisArray);
        }
      },
    },
    {
      reportType: ReportType.FINAL_SUMMARY,
      condition: generationRequest.regenerateFinalSummary,
      needsCompetitionData: false,
      generateFn: async () => await generateFinalSummary(spaceId, tickerRecord),
    },
  ];
}

/**
 * Finds the next report to generate
 */
function findNextReport(
  reportOrder: ReportOrderItem[],
  generationRequest: TickerV1GenerationRequest,
  competitionData: { competitionAnalysisArray: CompetitionAnalysisArray } | null
): ReportOrderItem | undefined {
  // If there are any failed steps and we're trying to generate the final report, skip it
  const hasFailed = generationRequest.failedSteps.length > 0;

  return reportOrder.find(
    (report) =>
      report.condition &&
      !generationRequest.completedSteps.includes(report.reportType) &&
      !generationRequest.failedSteps.includes(report.reportType) &&
      (!report.needsCompetitionData || competitionData) &&
      // Skip final report if any other reports have failed
      !(report.reportType === ReportType.FINAL_SUMMARY && hasFailed)
  );
}

/**
 * Updates the inProgressStep and lastInvocationTime
 */
async function updateInProgressStep(generationRequest: TickerV1GenerationRequest, reportType: ReportType): Promise<void> {
  await prisma.tickerV1GenerationRequest.update({
    where: {
      id: generationRequest.id,
    },
    data: {
      inProgressStep: reportType,
      lastInvocationTime: new Date(),
    },
  });
}

/**
 * Checks if all reports are completed and updates the status accordingly
 */
async function checkAllReportsCompleted(
  generationRequest: TickerV1GenerationRequest,
  reportOrder: ReportOrderItem[],
  updatedCompletedSteps: string[]
): Promise<void> {
  const allReportsCompleted = reportOrder.every(
    (report) => !report.condition || updatedCompletedSteps.includes(report.reportType) || generationRequest.failedSteps.includes(report.reportType)
  );

  if (allReportsCompleted) {
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GenerationRequestStatus.Completed,
        completedAt: new Date(),
      },
    });
  }
}

/**
 * Marks the generation request as completed when there are no reports to generate
 */
async function markAsCompleted(generationRequest: TickerV1GenerationRequest): Promise<void> {
  await prisma.tickerV1GenerationRequest.update({
    where: {
      id: generationRequest.id,
    },
    data: {
      status: GenerationRequestStatus.Completed,
      completedAt: new Date(),
    },
  });
}

/**
 * Handles errors during report generation
 */
async function handleGenerationError(error: unknown, generationRequest: TickerV1GenerationRequest): Promise<void> {
  // If there's an error, add the current step to failedSteps
  if (generationRequest.inProgressStep) {
    const updatedFailedSteps = [...generationRequest.failedSteps, generationRequest.inProgressStep];
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        failedSteps: updatedFailedSteps,
        inProgressStep: null,
      },
    });
  }

  // Check if all reports have been attempted
  const allReportsAttempted = Object.entries(generationRequest)
    .filter(([key, value]) => key.startsWith('regenerate') && value === true)
    .every(([key]) => {
      const reportType = key.replace('regenerate', '');
      const reportTypeKey = Object.values(ReportType).find((type) => type.toUpperCase() === reportType.toUpperCase());
      return reportTypeKey && (generationRequest.completedSteps.includes(reportTypeKey) || generationRequest.failedSteps.includes(reportTypeKey));
    });

  if (allReportsAttempted) {
    // Update the request status to Failed if all reports have been attempted
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GenerationRequestStatus.Failed,
        completedAt: new Date(),
      },
    });
  }

  throw error;
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
    overallSummary: categoryResult.overallAnalysisDetails,
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

/**
 * Main function to trigger generation of a report
 */
export async function trigggerGenerationOfAReport(symbol: string, generationRequest: TickerV1GenerationRequest): Promise<void> {
  // Get ticker from DB
  const tickerRecord: TickerV1WithIndustryAndSubIndustry = await fetchTickerData(symbol);
  const spaceId = KoalaGainsSpaceId;

  // Handle in-progress step
  const { isInProgressOrIsCompleted, updatedRequest } = await handleInProgressStep(generationRequest);
  if (isInProgressOrIsCompleted) {
    return;
  }
  generationRequest = updatedRequest;

  // Update initial status if needed
  await updateInitialStatus(generationRequest);

  // Fetch competition data if needed
  let competitionData = await fetchCompetitionData(spaceId, tickerRecord, generationRequest);

  try {
    // Define the order of reports to generate
    const reportOrder = defineReportOrder(spaceId, tickerRecord, generationRequest, competitionData);

    // If there are any failed steps, mark the final report as failed
    if (
      generationRequest.failedSteps.length > 0 &&
      !generationRequest.failedSteps.includes(ReportType.FINAL_SUMMARY) &&
      generationRequest.regenerateFinalSummary
    ) {
      const updatedFailedSteps = [...generationRequest.failedSteps, ReportType.FINAL_SUMMARY];
      await prisma.tickerV1GenerationRequest.update({
        where: {
          id: generationRequest.id,
        },
        data: {
          failedSteps: updatedFailedSteps,
        },
      });

      // Update the local copy of generationRequest
      generationRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
        where: {
          id: generationRequest.id,
        },
      });
    }

    // Find the next report to generate
    const nextReport = findNextReport(reportOrder, generationRequest, competitionData);

    if (nextReport) {
      // Update the inProgressStep and lastInvocationTime
      await updateInProgressStep(generationRequest, nextReport.reportType);

      // Generate the report
      await nextReport.generateFn();
    } else {
      // If no reports to generate, mark as completed
      await markAsCompleted(generationRequest);
    }
  } catch (error) {
    // Handle errors
    await handleGenerationError(error, generationRequest);
  }
}
