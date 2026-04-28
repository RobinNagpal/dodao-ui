import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ETF_PROMPT_KEYS, EtfReportType } from '@/types/etf/etf-analysis-types';
import { fetchEtfWithAllData, EtfWithAllData } from '@/utils/etf-analysis-reports/get-etf-report-data-utils';
import {
  prepareCostEfficiencyAndTeamInputJson,
  prepareEtfCompetitionInputJson,
  prepareEtfFinalSummaryInputJson,
  prepareFuturePerformanceOutlookInputJson,
  prepareIndexStrategyInputJson,
  preparePerformanceAndReturnsInputJson,
  prepareRiskAnalysisInputJson,
} from '@/utils/etf-analysis-reports/etf-report-input-json-utils';
import { compileTemplate, loadSchema, validateData } from '@/util/get-llm-response';
import path from 'path';

export interface GeneratedEtfPromptResult {
  prompt: string;
  inputJson: Record<string, unknown>;
  reportType: EtfReportType;
  promptKey: string;
}

function prepareEtfInputJsonForReportType(etf: EtfWithAllData, reportType: EtfReportType): Record<string, unknown> {
  switch (reportType) {
    case EtfReportType.PERFORMANCE_AND_RETURNS:
      return preparePerformanceAndReturnsInputJson(etf);
    case EtfReportType.COST_EFFICIENCY_AND_TEAM:
      return prepareCostEfficiencyAndTeamInputJson(etf);
    case EtfReportType.RISK_ANALYSIS:
      return prepareRiskAnalysisInputJson(etf);
    case EtfReportType.FUTURE_PERFORMANCE_OUTLOOK:
      return prepareFuturePerformanceOutlookInputJson(etf);
    case EtfReportType.INDEX_STRATEGY:
      return prepareIndexStrategyInputJson(etf);
    case EtfReportType.COMPETITION:
      return prepareEtfCompetitionInputJson(etf);
    case EtfReportType.FINAL_SUMMARY:
      return prepareEtfFinalSummaryInputJson(etf);
  }
}

/**
 * Build the final LLM-ready prompt string for a given ETF and report type, without
 * invoking any LLM or lambda. Mirrors `generatePromptForReportType` on the stock side.
 * The caller is responsible for ensuring MOR data is populated beforehand — this
 * function only reads whatever is in the DB.
 */
export async function generateEtfPromptForReportType(symbol: string, exchange: string, reportType: EtfReportType): Promise<GeneratedEtfPromptResult> {
  const spaceId = KoalaGainsSpaceId;
  const etf = await fetchEtfWithAllData(symbol, exchange);
  const promptKey = ETF_PROMPT_KEYS[reportType];
  if (!promptKey) {
    throw new Error(`No prompt key mapped for ETF report type ${reportType}`);
  }

  const inputJson = prepareEtfInputJsonForReportType(etf, reportType);

  const prompt = await prisma.prompt.findFirstOrThrow({
    where: { spaceId, key: promptKey },
    include: { activePromptVersion: true },
  });

  if (!prompt.activePromptVersion) {
    throw new Error(`Active prompt version not found for template ${promptKey}`);
  }

  if (prompt.inputSchema && prompt.inputSchema.trim() !== '') {
    const inputSchemaPath = path.join(process.cwd(), 'schemas', prompt.inputSchema);
    const inputSchemaObject = await loadSchema(inputSchemaPath, prompt.inputSchema);
    const { valid, errors } = validateData(inputSchemaObject, inputJson);
    if (!valid) {
      throw new Error(`Input validation failed for ${promptKey}: ${JSON.stringify(errors)}`);
    }
  }

  const finalPrompt = compileTemplate(prompt.activePromptVersion.promptTemplate, inputJson);

  return { prompt: finalPrompt, inputJson, reportType, promptKey };
}
