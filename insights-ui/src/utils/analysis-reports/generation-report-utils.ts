import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { GenerationRequestStatus, ReportType, TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry } from '@/types/ticker-typesv1';
import {
  fetchAnalysisFactors,
  fetchTickerRecordWithAnalysisData,
  fetchTickerRecordWithIndustryAndSubIndustry,
} from '@/utils/analysis-reports/get-report-data-utils';
import { getLLMResponseForPromptViaInvocationViaLambda } from '@/utils/analysis-reports/llm-callback-lambda-utils';
import {
  prepareBaseTickerInputJson,
  prepareBusinessAndMoatInputJson,
  prepareFairValueInputJson,
  prepareFinancialAnalysisInputJson,
  prepareFinalSummaryInputJson,
  prepareFutureGrowthInputJson,
  prepareInvestorAnalysisInputJson,
  preparePastPerformanceInputJson,
} from '@/utils/analysis-reports/report-input-json-utils';
import { areAllReportsAttempted, markAsCompleted, shouldRegenerateReport, updateInitialStatus } from '@/utils/analysis-reports/report-status-utils';
import { saveCachedScoreAndAboutReport } from '@/utils/analysis-reports/save-report-utils';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForAnalysis, extractFinancialDataForPastPerformance } from '@/utils/stock-analyzer-scraper-utils';
import { AnalysisCategoryFactor, TickerV1, TickerV1GenerationRequest } from '@prisma/client';

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
 * Fetches competition data if needed for other analyses
 */
async function fetchCompetitionData(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  generationRequest: TickerV1GenerationRequest
): Promise<{ competitionAnalysisArray: CompetitionAnalysisArray } | null> {
  if (!shouldRegenerateReport(generationRequest, ReportType.COMPETITION) || generationRequest.completedSteps.includes(ReportType.COMPETITION)) {
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
      condition: shouldRegenerateReport(generationRequest, ReportType.COMPETITION) || !competitionData || !competitionData.competitionAnalysisArray.length,
      needsCompetitionData: false,
      generateFn: async () => {
        await generateCompetitionAnalysis(spaceId, tickerRecord, generationRequest.id);
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
      condition: shouldRegenerateReport(generationRequest, ReportType.FINANCIAL_ANALYSIS),
      needsCompetitionData: false,
      generateFn: async () => await generateFinancialAnalysis(spaceId, tickerRecord, generationRequest.id),
    },
    {
      reportType: ReportType.BUSINESS_AND_MOAT,
      condition: shouldRegenerateReport(generationRequest, ReportType.BUSINESS_AND_MOAT),
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateBusinessAndMoatAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray, generationRequest.id);
        }
      },
    },
    {
      reportType: ReportType.PAST_PERFORMANCE,
      condition: shouldRegenerateReport(generationRequest, ReportType.PAST_PERFORMANCE),
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generatePastPerformanceAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray, generationRequest.id);
        }
      },
    },
    {
      reportType: ReportType.FUTURE_GROWTH,
      condition: shouldRegenerateReport(generationRequest, ReportType.FUTURE_GROWTH),
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateFutureGrowthAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray, generationRequest.id);
        }
      },
    },
    {
      reportType: ReportType.FAIR_VALUE,
      condition: shouldRegenerateReport(generationRequest, ReportType.FAIR_VALUE),
      needsCompetitionData: false,
      generateFn: async () => await generateFairValueAnalysis(spaceId, tickerRecord, generationRequest.id),
    },
    {
      reportType: ReportType.FUTURE_RISK,
      condition: shouldRegenerateReport(generationRequest, ReportType.FUTURE_RISK),
      needsCompetitionData: false,
      generateFn: async () => await generateFutureRiskAnalysis(spaceId, tickerRecord, generationRequest.id),
    },
    {
      reportType: ReportType.WARREN_BUFFETT,
      condition: shouldRegenerateReport(generationRequest, ReportType.WARREN_BUFFETT),
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.WARREN_BUFFETT, competitionData.competitionAnalysisArray, generationRequest.id);
        }
      },
    },
    {
      reportType: ReportType.CHARLIE_MUNGER,
      condition: shouldRegenerateReport(generationRequest, ReportType.CHARLIE_MUNGER),
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.CHARLIE_MUNGER, competitionData.competitionAnalysisArray, generationRequest.id);
        }
      },
    },
    {
      reportType: ReportType.BILL_ACKMAN,
      condition: shouldRegenerateReport(generationRequest, ReportType.BILL_ACKMAN),
      needsCompetitionData: true,
      generateFn: async () => {
        if (competitionData) {
          await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.BILL_ACKMAN, competitionData.competitionAnalysisArray, generationRequest.id);
        }
      },
    },
    {
      reportType: ReportType.FINAL_SUMMARY,
      condition: shouldRegenerateReport(generationRequest, ReportType.FINAL_SUMMARY),
      needsCompetitionData: false,
      generateFn: async () => await generateFinalSummary(spaceId, tickerRecord, generationRequest.id),
    },
    {
      reportType: ReportType.CACHED_SCORE,
      condition: shouldRegenerateReport(generationRequest, ReportType.CACHED_SCORE),
      needsCompetitionData: false,
      generateFn: async () => await generateCachedScoreAnalysis(tickerRecord, generationRequest.id),
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
  const allReportsAttempted = areAllReportsAttempted(generationRequest);

  if (allReportsAttempted) {
    // Mark the request as completed or failed
    await markAsCompleted(generationRequest);
  }

  throw error;
}

// Helper functions for generating different types of analyses

async function generateCompetitionAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Prepare input for the prompt
  const inputJson = prepareBaseTickerInputJson(tickerRecord);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/competition',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: ReportType.COMPETITION,
  });
}

async function generateFinancialAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Get analysis factors for FinancialStatementAnalysis category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FinancialStatementAnalysis);

  // Extract comprehensive financial data for analysis
  const financialData = extractFinancialDataForAnalysis(scraperInfo);

  // Prepare input for the prompt
  const inputJson = prepareFinancialAnalysisInputJson(tickerRecord, analysisFactors, financialData);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/financial-statements',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: ReportType.FINANCIAL_ANALYSIS,
  });
}

async function generateBusinessAndMoatAnalysis(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  competitionAnalysisArray: CompetitionAnalysisArray,
  generationRequestId: string
): Promise<void> {
  // Get analysis factors for BusinessAndMoat category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.BusinessAndMoat);

  // Prepare input for the prompt
  const inputJson = prepareBusinessAndMoatInputJson(tickerRecord, analysisFactors, competitionAnalysisArray);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/business-moat',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: ReportType.BUSINESS_AND_MOAT,
  });
}

async function generatePastPerformanceAnalysis(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  competitionAnalysisArray: CompetitionAnalysisArray,
  generationRequestId: string
): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Extract comprehensive financial data for past performance analysis (last 5 annuals only)
  const financialData = extractFinancialDataForPastPerformance(scraperInfo);

  // Get analysis factors for PastPerformance category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.PastPerformance);

  // Prepare input for the prompt
  const inputJson = preparePastPerformanceInputJson(tickerRecord, analysisFactors, competitionAnalysisArray, financialData);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/past-performance',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: ReportType.PAST_PERFORMANCE,
  });
}

async function generateFutureGrowthAnalysis(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  competitionAnalysisArray: CompetitionAnalysisArray,
  generationRequestId: string
): Promise<void> {
  // Get analysis factors for FutureGrowth category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FutureGrowth);

  // Prepare input for the prompt
  const inputJson = prepareFutureGrowthInputJson(tickerRecord, analysisFactors, competitionAnalysisArray);

  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/future-growth',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: ReportType.FUTURE_GROWTH,
  });
}

async function generateFairValueAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Extract comprehensive financial data for analysis
  const financialData = extractFinancialDataForAnalysis(scraperInfo);

  // Get analysis factors for FairValue category
  const analysisFactors: AnalysisCategoryFactor[] = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FairValue);

  // Prepare input for the prompt
  const inputJson = prepareFairValueInputJson(tickerRecord, analysisFactors, financialData);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/fair-value',
      llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: ReportType.FAIR_VALUE,
  });
}

async function generateFutureRiskAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Prepare base input JSON
  const inputJson = prepareBaseTickerInputJson(tickerRecord);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/future-risk',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: ReportType.FUTURE_RISK,
  });
}

async function generateInvestorAnalysis(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  investorKey: ReportType.BILL_ACKMAN | ReportType.CHARLIE_MUNGER | ReportType.WARREN_BUFFETT,
  competitionAnalysisArray: CompetitionAnalysisArray,
  generationRequestId: string
): Promise<void> {
  // Prepare input for the prompt
  const inputJson = prepareInvestorAnalysisInputJson(tickerRecord, investorKey, competitionAnalysisArray);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/investor-analysis',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: investorKey,
  });
}

async function generateFinalSummary(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Get ticker from DB with all related analysis data
  const tickerWithAnalysis = await fetchTickerRecordWithAnalysisData(tickerRecord.symbol);

  // Prepare input for the prompt
  const inputJson = prepareFinalSummaryInputJson(tickerWithAnalysis);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/final-summary',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    reportType: ReportType.FINAL_SUMMARY,
  });
}

/**
 * Generates cached score and about report
 * This is a synchronous operation that doesn't require LLM
 */
async function generateCachedScoreAnalysis(tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Call the utility function to save cached score and about report
  await saveCachedScoreAndAboutReport(tickerRecord.symbol);

  // Update the generation request to mark this report as completed
  await prisma.tickerV1GenerationRequest.update({
    where: { id: generationRequestId },
    data: {
      completedSteps: [
        ...((await prisma.tickerV1GenerationRequest.findUnique({ where: { id: generationRequestId } }))?.completedSteps || []),
        ReportType.CACHED_SCORE,
      ],
      inProgressStep: null,
      lastInvocationTime: null,
    },
  });
}

/**
 * Handles in-progress steps and timeouts
 * Returns true if the function should exit early
 */
export async function handleInProgressStep(
  generationRequest: TickerV1GenerationRequest & { ticker: TickerV1 }
): Promise<{ isInProgressOrIsCompleted: boolean; updatedRequest: TickerV1GenerationRequest & { ticker: TickerV1 } }> {
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
        updatedAt: new Date(),
      },
    });

    // Refresh the generation request
    const updatedRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
      where: {
        id: generationRequest.id,
      },
      include: {
        ticker: true,
      },
    });

    return { isInProgressOrIsCompleted: false, updatedRequest };
  } else {
    console.log(`Waiting for ${generationRequest.inProgressStep}  of ${generationRequest.ticker.symbol} to finish.... It was started at ${lastInvocationTime}`);
    // If it's not been more than 5 minutes, return early
    return { isInProgressOrIsCompleted: true, updatedRequest: generationRequest };
  }
}

/**
 * Main function to trigger generation of a report
 */
export async function triggerGenerationOfAReport(symbol: string, generationRequestId: string): Promise<void> {
  let generationRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
    where: { id: generationRequestId },
    include: { ticker: true },
  });
  // Get ticker from DB
  const tickerRecord: TickerV1WithIndustryAndSubIndustry = await fetchTickerRecordWithIndustryAndSubIndustry(symbol);
  const spaceId = KoalaGainsSpaceId;

  // Handle in-progress step
  const { isInProgressOrIsCompleted, updatedRequest } = await handleInProgressStep(generationRequest);
  if (isInProgressOrIsCompleted) {
    console.log('Generation request is already in progress or completed - skipping ', symbol);
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

    // If competition report has failed, mark all dependent reports as failed
    if (generationRequest.failedSteps.includes(ReportType.COMPETITION)) {
      // Reports that depend on competition data
      const dependentReports = [
        ReportType.BUSINESS_AND_MOAT,
        ReportType.PAST_PERFORMANCE,
        ReportType.FUTURE_GROWTH,
        ReportType.WARREN_BUFFETT,
        ReportType.CHARLIE_MUNGER,
        ReportType.BILL_ACKMAN,
      ];

      // Filter out reports that are already in failedSteps
      const reportsToMarkAsFailed = dependentReports.filter(
        (report) => !generationRequest.failedSteps.includes(report) && shouldRegenerateReport(generationRequest, report)
      );

      if (reportsToMarkAsFailed.length > 0) {
        const updatedFailedSteps = [...generationRequest.failedSteps, ...reportsToMarkAsFailed];
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
          include: { ticker: true },
        });
      }
    }

    // If there are any failed steps, mark the final report as failed
    if (
      generationRequest.failedSteps.length > 0 &&
      !generationRequest.failedSteps.includes(ReportType.FINAL_SUMMARY) &&
      shouldRegenerateReport(generationRequest, ReportType.FINAL_SUMMARY)
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
        include: { ticker: true },
      });
    }

    // Check if all reports that should be regenerated have been attempted
    const allReportsAttempted = areAllReportsAttempted(generationRequest);

    // Find the next report to generate
    const nextReport = findNextReport(reportOrder, generationRequest, competitionData);

    if (nextReport) {
      // Generate the report (inProgressStep and lastInvocationTime will be set right before lambda invocation)
      await nextReport.generateFn();
    } else {
      console.log('No reports to generate. Marking as completed for ticker: ', symbol, '');
      // If no reports to generate, mark as completed
      if (allReportsAttempted) {
        await markAsCompleted(generationRequest);
      }
    }
  } catch (error) {
    // Handle errors
    await handleGenerationError(error, generationRequest);
  }
}
