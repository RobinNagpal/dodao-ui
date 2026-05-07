import { readIndustryTariffReportByOldUrl } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  return readIndustryTariffReportByOldUrl(industry);
}

export const GET = withErrorHandlingV2<IndustryTariffReport>(getHandler);
