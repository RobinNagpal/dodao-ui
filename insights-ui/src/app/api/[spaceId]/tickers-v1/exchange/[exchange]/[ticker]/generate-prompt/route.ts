import { generatePromptForReportType } from '@/utils/analysis-reports/prompt-generator-utils';
import { ReportType } from '@/types/ticker-typesv1';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface RouteParams {
  params: Promise<{
    spaceId: string;
    exchange: string;
    ticker: string;
  }>;
}

export interface GeneratePromptRequest {
  reportType: ReportType;
}

export interface GeneratePromptResponse {
  prompt: string;
  reportType: ReportType;
}

async function handler(request: NextRequest, { params }: RouteParams): Promise<GeneratePromptResponse> {
  const { exchange, ticker } = await params;
  const body: GeneratePromptRequest = await request.json();
  const { reportType } = body;

  if (!reportType) {
    throw new Error('Report type is required');
  }

  const result = await generatePromptForReportType(ticker, exchange, reportType);

  return {
    prompt: result.prompt,
    reportType: result.reportType,
  };
}

export const POST = withErrorHandlingV2<GeneratePromptResponse>(handler);
