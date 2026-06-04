import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { generateEtfPromptForReportType } from '@/utils/etf-analysis-reports/etf-prompt-generator-utils';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';

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

async function handler(request: NextRequest, _userContext: KoalaGainsJwtTokenPayload | null, { params }: RouteParams): Promise<EtfGeneratePromptResponse> {
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

export const POST = withAdminOrToken<EtfGeneratePromptResponse>(handler);
