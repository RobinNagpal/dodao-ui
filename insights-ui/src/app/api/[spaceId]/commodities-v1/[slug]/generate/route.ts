import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { startCommodityReportGeneration } from '@/utils/commodity-analysis-reports/commodity-report-generation-utils';
import { NextRequest } from 'next/server';

export interface GenerateCommodityReportResponse {
  status: 'started';
  reportType: CommodityReportType;
}

/**
 * Kick off background generation of a single commodity report type for one slug,
 * then return immediately. The whole flow (LLM + save) runs in-process; the admin
 * refreshes the reports table to see when the section lands. No request queue —
 * matches the tariff per-section generation.
 */
async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; slug: string }> }
): Promise<GenerateCommodityReportResponse> {
  const { slug } = await params;
  const { reportType } = (await req.json()) as { reportType?: CommodityReportType };

  if (!reportType || !Object.values(CommodityReportType).includes(reportType)) {
    throw new Error(`Invalid or missing reportType. Expected one of: ${Object.values(CommodityReportType).join(', ')}`);
  }

  startCommodityReportGeneration(slug, reportType);
  return { status: 'started', reportType };
}

export const POST = withAdminOrToken<GenerateCommodityReportResponse>(postHandler);
