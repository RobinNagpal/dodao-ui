import { generateEtfPromptForReportType } from '@/utils/etf-analysis-reports/etf-prompt-generator-utils';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface RouteParams {
  params: Promise<{
    spaceId: string;
    exchange: string;
    etf: string;
  }>;
}

export interface EtfGeneratePromptRequest {
  reportType: EtfReportType;
}

export interface EtfGeneratePromptResponse {
  prompt: string;
  reportType: EtfReportType;
  promptKey: string;
}

async function handler(request: NextRequest, { params }: RouteParams): Promise<EtfGeneratePromptResponse> {
  const { exchange, etf } = await params;
  const body: EtfGeneratePromptRequest = await request.json();
  const { reportType } = body;

  if (!reportType) {
    throw new Error('reportType is required');
  }
  if (!Object.values(EtfReportType).includes(reportType)) {
    throw new Error(`Unsupported ETF reportType "${reportType}". Valid values: ${Object.values(EtfReportType).join(', ')}`);
  }

  const result = await generateEtfPromptForReportType(etf, exchange, reportType);

  return {
    prompt: result.prompt,
    reportType: result.reportType,
    promptKey: result.promptKey,
  };
}

export const POST = withErrorHandlingV2<EtfGeneratePromptResponse>(handler);
