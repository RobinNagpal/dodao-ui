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
  prepareFinalSummaryInputJson,
  prepareFinancialAnalysisInputJson,
  prepareFutureGrowthInputJson,
  prepareInvestorAnalysisInputJson,
  preparePastPerformanceInputJson,
} from '@/utils/analysis-reports/report-input-json-utils';
import {
  areAllReportsAttempted,
  markAsCompleted,
  markAskInProgress,
  shouldRegenerateReport,
  updateInitialStatus,
} from '@/utils/analysis-reports/report-status-utils';
import { calculatePendingSteps } from '@/utils/analysis-reports/report-steps-statuses';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForAnalysis, extractFinancialDataForPastPerformance } from '@/utils/stock-analyzer-scraper-utils';
import { AnalysisCategoryFactor, TickerV1, TickerV1GenerationRequest } from '@prisma/client';

/**
 * Map of report dependencies where keys are all report types and values are the report types
 * that a particular report depends on. This is determined from the input JSON requirements.
 */
export const reportDependencyMap: Record<ReportType, ReportType[]> = {
  [ReportType.COMPETITION]: [],
  [ReportType.FINANCIAL_ANALYSIS]: [],
  [ReportType.BUSINESS_AND_MOAT]: [ReportType.COMPETITION],
  [ReportType.PAST_PERFORMANCE]: [ReportType.COMPETITION],
  [ReportType.FUTURE_GROWTH]: [ReportType.COMPETITION],
  [ReportType.FAIR_VALUE]: [],
  [ReportType.FUTURE_RISK]: [],
  [ReportType.WARREN_BUFFETT]: [ReportType.COMPETITION],
  [ReportType.CHARLIE_MUNGER]: [ReportType.COMPETITION],
  [ReportType.BILL_ACKMAN]: [ReportType.COMPETITION],
  [ReportType.FINAL_SUMMARY]: [
    ReportType.FINANCIAL_ANALYSIS,
    ReportType.COMPETITION,
    ReportType.BUSINESS_AND_MOAT,
    ReportType.PAST_PERFORMANCE,
    ReportType.FUTURE_GROWTH,
    ReportType.FAIR_VALUE,
    ReportType.FUTURE_RISK,
    ReportType.WARREN_BUFFETT,
    ReportType.CHARLIE_MUNGER,
    ReportType.BILL_ACKMAN,
  ],
};

/**
 * The dependency-based report order array where independent reports are first
 * and dependent reports follow.
 */
export const dependencyBasedReportOrder: ReportType[] = [
  // Independent reports (no dependencies)
  ReportType.COMPETITION,
  ReportType.FINANCIAL_ANALYSIS,
  ReportType.FAIR_VALUE,
  ReportType.FUTURE_RISK,

  // Dependent reports (with dependencies)
  ReportType.BUSINESS_AND_MOAT,
  ReportType.PAST_PERFORMANCE,
  ReportType.FUTURE_GROWTH,
  ReportType.WARREN_BUFFETT,
  ReportType.CHARLIE_MUNGER,
  ReportType.BILL_ACKMAN,
  ReportType.FINAL_SUMMARY,
];

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
 * Defines the order of reports to generate using the dependency-based order
 * where independent reports are first and dependent reports follow
 */
function defineDependencyBasedReportOrder(
  spaceId: string,
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  generationRequest: TickerV1GenerationRequest,
  competitionData: { competitionAnalysisArray: CompetitionAnalysisArray } | null
): ReportOrderItem[] {
  // Create a map of report types to their generate functions
  const reportGenerateFunctions: Record<ReportType, () => Promise<void>> = {
    [ReportType.COMPETITION]: async () => {
      await generateCompetitionAnalysis(spaceId, tickerRecord, generationRequest.id);
      // Refresh competition data for other analyses
      competitionData = await prisma.tickerV1VsCompetition.findFirst({
        where: {
          spaceId,
          tickerId: tickerRecord.id,
        },
      });
    },
    [ReportType.FINANCIAL_ANALYSIS]: async () => await generateFinancialAnalysis(spaceId, tickerRecord, generationRequest.id),
    [ReportType.BUSINESS_AND_MOAT]: async () => {
      if (competitionData) {
        await generateBusinessAndMoatAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray, generationRequest.id);
      }
    },
    [ReportType.PAST_PERFORMANCE]: async () => {
      if (competitionData) {
        await generatePastPerformanceAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray, generationRequest.id);
      }
    },
    [ReportType.FUTURE_GROWTH]: async () => {
      if (competitionData) {
        await generateFutureGrowthAnalysis(spaceId, tickerRecord, competitionData.competitionAnalysisArray, generationRequest.id);
      }
    },
    [ReportType.FAIR_VALUE]: async () => await generateFairValueAnalysis(spaceId, tickerRecord, generationRequest.id),
    [ReportType.FUTURE_RISK]: async () => await generateFutureRiskAnalysis(spaceId, tickerRecord, generationRequest.id),
    [ReportType.WARREN_BUFFETT]: async () => {
      if (competitionData) {
        await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.WARREN_BUFFETT, competitionData.competitionAnalysisArray, generationRequest.id);
      }
    },
    [ReportType.CHARLIE_MUNGER]: async () => {
      if (competitionData) {
        await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.CHARLIE_MUNGER, competitionData.competitionAnalysisArray, generationRequest.id);
      }
    },
    [ReportType.BILL_ACKMAN]: async () => {
      if (competitionData) {
        await generateInvestorAnalysis(spaceId, tickerRecord, ReportType.BILL_ACKMAN, competitionData.competitionAnalysisArray, generationRequest.id);
      }
    },
    [ReportType.FINAL_SUMMARY]: async () => await generateFinalSummary(spaceId, tickerRecord, generationRequest.id),
  };

  // Map the dependency-based report order to ReportOrderItem objects
  return dependencyBasedReportOrder.map((reportType) => ({
    reportType,
    condition:
      reportType === ReportType.COMPETITION
        ? shouldRegenerateReport(generationRequest, reportType) || !competitionData || !competitionData.competitionAnalysisArray.length
        : shouldRegenerateReport(generationRequest, reportType),
    needsCompetitionData: reportDependencyMap[reportType].includes(ReportType.COMPETITION),
    generateFn: reportGenerateFunctions[reportType],
  }));
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
        updatedAt: new Date(),
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
    // Define the order of reports to generate using the dependency-based order
    // where independent reports are first and dependent reports follow
    const reportOrder = defineDependencyBasedReportOrder(spaceId, tickerRecord, generationRequest, competitionData);

    // If competition report has failed, mark all dependent reports as failed
    if (generationRequest.failedSteps.includes(ReportType.COMPETITION)) {
      // Get reports that depend on competition data from the dependency map
      const dependentReports = Object.entries(reportDependencyMap)
        .filter(([_, dependencies]) => dependencies.includes(ReportType.COMPETITION))
        .map(([reportType]) => reportType as ReportType);

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

export async function triggerGenerationOfAReportSimplified(symbol: string, generationRequestId: string): Promise<void> {
  let generationRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
    where: { id: generationRequestId },
    include: { ticker: true },
  });
  // Get ticker from DB
  const tickerRecord: TickerV1WithIndustryAndSubIndustry = await fetchTickerRecordWithIndustryAndSubIndustry(symbol);
  const spaceId = KoalaGainsSpaceId;

  if (generationRequest.status === GenerationRequestStatus.Completed) {
    console.log('Generation request is already completed - skipping ', symbol);
    return;
  }

  const pendingSteps = calculatePendingSteps(generationRequest);
  if (pendingSteps.length === 0) {
    console.log(`No pending steps for ${symbol}. Marking as completed for ticker: `, symbol);
    await markAsCompleted(generationRequest);
    return;
  }

  if (generationRequest.status === GenerationRequestStatus.InProgress) {
    const inProgressStep = generationRequest.inProgressStep;
    const lastInvocationTime = generationRequest.lastInvocationTime;
    if (!inProgressStep || !lastInvocationTime) {
      console.log(`Generation request is in progress but has no inProgressStep or lastInvocationTime. Marking as failed for ticker: `, symbol);
      await prisma.tickerV1GenerationRequest.update({
        where: {
          id: generationRequest.id,
        },
        data: {
          status: GenerationRequestStatus.Failed,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Check if it's been more than 5 minutes since the last invocation time
      const fiveMinutes = 5 * 60 * 1000;

      if (Date.now() - lastInvocationTime.getTime() < fiveMinutes) {
        console.log(`Waiting for ${inProgressStep}  of ${symbol} to finish.... It was started at ${lastInvocationTime}`);
        return;
      } else {
        // Add the step to failedSteps if it's been more than 5 minutes
        const failedSteps = generationRequest.failedSteps;
        const failedStep = inProgressStep;

        // Skip if already marked as failed
        if (!failedSteps.includes(failedStep)) {
          failedSteps.push(failedStep);
        }

        // Find all steps that directly depend on this failed step
        Object.entries(reportDependencyMap).forEach(([reportType, dependencies]) => {
          if (dependencies.includes(failedStep as ReportType) && !failedSteps.includes(reportType as ReportType)) {
            // Add this dependent step to failed steps
            failedSteps.push(reportType as ReportType);
          }
        });

        // Update the generation request
        generationRequest = await prisma.tickerV1GenerationRequest.update({
          where: {
            id: generationRequest.id,
          },
          data: {
            failedSteps: Array.from(new Set(failedStep)), // Remove duplicates
            inProgressStep: null,
            updatedAt: new Date(),
          },
          include: { ticker: true },
        });
      }
    }
  }

  console.log('Generating report for ', symbol);

  //
  const latestPendingSteps = calculatePendingSteps(generationRequest);

  // get the first step that overlaps in dependencyBasedReportOrder and pendingSteps
  const nextStep = dependencyBasedReportOrder.find((step) => latestPendingSteps.includes(step));

  if (!nextStep) {
    console.log('No pending steps for ', symbol);
    await markAsCompleted(generationRequest);
    return;
  }

  // Update initial status if needed
  await markAskInProgress(generationRequest, nextStep);

  if (nextStep === ReportType.COMPETITION) {
    await generateCompetitionAnalysis(spaceId, tickerRecord, generationRequest.id);
    return;
  }

  const competitionData = await prisma.tickerV1VsCompetition.findFirst({
    where: {
      spaceId,
      tickerId: tickerRecord.id,
    },
  });

  const competitionAnalysisArray = competitionData?.competitionAnalysisArray || [];

  try {
    switch (nextStep) {
      case ReportType.FINANCIAL_ANALYSIS:
        await generateFinancialAnalysis(spaceId, tickerRecord, generationRequest.id);
        break;
      case ReportType.FUTURE_RISK:
        await generateFutureRiskAnalysis(spaceId, tickerRecord, generationRequest.id);
        break;
      case ReportType.FAIR_VALUE:
        await generateFairValueAnalysis(spaceId, tickerRecord, generationRequest.id);
        break;
      case ReportType.BUSINESS_AND_MOAT:
        await generateBusinessAndMoatAnalysis(spaceId, tickerRecord, competitionAnalysisArray, generationRequest.id);
        break;
      case ReportType.PAST_PERFORMANCE:
        await generatePastPerformanceAnalysis(spaceId, tickerRecord, competitionAnalysisArray, generationRequest.id);
        break;
      case ReportType.FUTURE_GROWTH:
        await generateFutureGrowthAnalysis(spaceId, tickerRecord, competitionAnalysisArray, generationRequest.id);
        break;
      case ReportType.BILL_ACKMAN:
      case ReportType.CHARLIE_MUNGER:
      case ReportType.WARREN_BUFFETT:
        await generateInvestorAnalysis(spaceId, tickerRecord, nextStep as any, competitionAnalysisArray, generationRequest.id);
        break;
      case ReportType.FINAL_SUMMARY:
        await generateFinalSummary(spaceId, tickerRecord, generationRequestId);
        break;
    }
  } catch (error) {
    // Handle errors
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        failedSteps: [...generationRequest.failedSteps, nextStep],
        inProgressStep: null,
        updatedAt: new Date(),
      },
    });
  }
}
