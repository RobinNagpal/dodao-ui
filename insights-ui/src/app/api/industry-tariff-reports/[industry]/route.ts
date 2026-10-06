import { readIndustryTariffReportByOldUrl } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { validateTariffIndustryId } from '@/utils/tariff-reports/tariff-input-validation';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  // Malformed / unknown industry ids (scanner probes) → prefixed 404 before any DB work. A known
  // industry with no report row yet still answers `{}`.
  return readIndustryTariffReportByOldUrl(validateTariffIndustryId((await params).industry));
}

export const GET = withErrorHandlingV2<IndustryTariffReport>(getHandler);
