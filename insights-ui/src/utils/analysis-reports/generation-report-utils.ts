import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { GenerationRequestStatus, ReportType, TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry } from '@/types/ticker-typesv1';
import {
  fetchAnalysisFactors,
  fetchBusinessMoatAnalysisData,
  fetchTickerRecordBySymbolAndExchangeWithAnalysisData,
  fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry,
  fetchTickerRecordWithAnalysisData,
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
import { markAsCompleted, markAsInProgress } from '@/utils/analysis-reports/report-status-utils';
import { calculatePendingSteps } from '@/utils/analysis-reports/report-steps-statuses';
import {
  ensureStockAnalyzerDataIsFresh,
  extractFinancialDataForAnalysis,
  extractFinancialDataForPastPerformance,
  extractKpisDataForAnalysis,
} from '@/utils/stock-analyzer-scraper-utils';
import { AnalysisCategoryFactor } from '@prisma/client';

/**
 * Map of report dependencies where keys are all report types and values are the report types
 * that a particular report depends on. This is determined from the input JSON requirements.
 */
export const reportDependencyMap: Record<ReportType, ReportType[]> = {
  [ReportType.COMPETITION]: [],
  [ReportType.BUSINESS_AND_MOAT]: [],
  [ReportType.FINANCIAL_ANALYSIS]: [],
  [ReportType.PAST_PERFORMANCE]: [],
  [ReportType.FUTURE_GROWTH]: [ReportType.BUSINESS_AND_MOAT],
  [ReportType.FAIR_VALUE]: [ReportType.BUSINESS_AND_MOAT, ReportType.FINANCIAL_ANALYSIS, ReportType.PAST_PERFORMANCE, ReportType.FUTURE_GROWTH],
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
  ReportType.BUSINESS_AND_MOAT,
  ReportType.FINANCIAL_ANALYSIS,
  ReportType.PAST_PERFORMANCE,
  ReportType.FUTURE_RISK,

  // Dependent reports (with dependencies)
  ReportType.FUTURE_GROWTH,
  ReportType.FAIR_VALUE,
  ReportType.WARREN_BUFFETT,
  ReportType.CHARLIE_MUNGER,
  ReportType.BILL_ACKMAN,
  ReportType.FINAL_SUMMARY,
];

async function generateCompetitionAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Prepare input for the prompt
  const inputJson = prepareBaseTickerInputJson(tickerRecord);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/competition',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
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
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/financial-statements',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
      requestFrom: 'ui',
    },
    reportType: ReportType.FINANCIAL_ANALYSIS,
  });
}

async function generateBusinessAndMoatAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Get analysis factors for BusinessAndMoat category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.BusinessAndMoat);

  // Extract KPIs data for analysis
  const kpisData = extractKpisDataForAnalysis(scraperInfo);

  // Prepare input for the prompt
  const inputJson = prepareBusinessAndMoatInputJson(tickerRecord, analysisFactors, kpisData);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/business-moat',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
      requestFrom: 'ui',
    },
    reportType: ReportType.BUSINESS_AND_MOAT,
  });
}

async function generatePastPerformanceAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Extract comprehensive financial data for past performance analysis (last 5 annuals only)
  const financialData = extractFinancialDataForPastPerformance(scraperInfo);

  // Get analysis factors for PastPerformance category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.PastPerformance);

  // Prepare input for the prompt
  const inputJson = preparePastPerformanceInputJson(tickerRecord, analysisFactors, financialData);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/past-performance',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
      requestFrom: 'ui',
    },
    reportType: ReportType.PAST_PERFORMANCE,
  });
}

async function generateFutureGrowthAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Ensure stock analyzer data is fresh
  const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

  // Get analysis factors for FutureGrowth category
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FutureGrowth);

  // Fetch business moat analysis data
  const businessMoatData = await fetchBusinessMoatAnalysisData(spaceId, tickerRecord.id);

  // Extract KPIs data for analysis
  const kpisData = extractKpisDataForAnalysis(scraperInfo);

  // Prepare input for the prompt
  const inputJson = prepareFutureGrowthInputJson(tickerRecord, analysisFactors, businessMoatData, kpisData);

  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/future-growth',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
      requestFrom: 'ui',
    },
    reportType: ReportType.FUTURE_GROWTH,
  });
}

async function generateFairValueAnalysis(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Fetch existing category analyses to feed into Fair Value
  const tickerWithAnalysisData = await fetchTickerRecordBySymbolAndExchangeWithAnalysisData(tickerRecord.symbol, tickerRecord.exchange);

  // Get analysis factors for FairValue category
  const analysisFactors: AnalysisCategoryFactor[] = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FairValue);

  // Prepare input for the prompt
  const inputJson = prepareFairValueInputJson(tickerWithAnalysisData, analysisFactors);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/fair-value',
      llmProvider: LLMProvider.GEMINI_WITH_GROUNDING,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
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
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/future-risk',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
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
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/investor-analysis',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
      requestFrom: 'ui',
    },
    reportType: investorKey,
  });
}

async function generateFinalSummary(spaceId: string, tickerRecord: TickerV1WithIndustryAndSubIndustry, generationRequestId: string): Promise<void> {
  // Get ticker from DB with all related analysis data
  const tickerWithAnalysis = await fetchTickerRecordBySymbolAndExchangeWithAnalysisData(tickerRecord.symbol, tickerRecord.exchange);

  // Prepare input for the prompt
  const inputJson = prepareFinalSummaryInputJson(tickerWithAnalysis);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/final-summary',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_3_PRO_PREVIEW,
      requestFrom: 'ui',
    },
    reportType: ReportType.FINAL_SUMMARY,
  });
}

export async function triggerGenerationOfAReportSimplified(symbol: string, exchange: string, generationRequestId: string): Promise<void> {
  let generationRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
    where: { id: generationRequestId },
    include: { ticker: true },
  });
  // Get ticker from DB
  const tickerRecord: TickerV1WithIndustryAndSubIndustry = await fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry(symbol, exchange);
  const spaceId = KoalaGainsSpaceId;

  if (generationRequest.status === GenerationRequestStatus.Completed) {
    console.log('Generation request is already completed - skipping ', symbol, ' on exchange ', exchange);
    return;
  }

  const pendingSteps = calculatePendingSteps(generationRequest);
  if (pendingSteps.length === 0) {
    console.log(`No pending steps for ${symbol} on exchange ${exchange}. Marking as completed for ticker: `, symbol);
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
  await markAsInProgress(generationRequest, nextStep);

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
      case ReportType.BUSINESS_AND_MOAT:
        await generateBusinessAndMoatAnalysis(spaceId, tickerRecord, generationRequest.id);
        break;
      case ReportType.FINANCIAL_ANALYSIS:
        await generateFinancialAnalysis(spaceId, tickerRecord, generationRequest.id);
        break;
        case ReportType.PAST_PERFORMANCE:
        await generatePastPerformanceAnalysis(spaceId, tickerRecord, generationRequest.id);
        break;
        case ReportType.FUTURE_GROWTH:
        await generateFutureGrowthAnalysis(spaceId, tickerRecord, generationRequest.id);
        break;
        case ReportType.FAIR_VALUE:
        await generateFairValueAnalysis(spaceId, tickerRecord, generationRequest.id);
        break;
      case ReportType.FUTURE_RISK:
        await generateFutureRiskAnalysis(spaceId, tickerRecord, generationRequest.id);
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
