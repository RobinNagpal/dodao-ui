import { getAndWriteIndustryAreaSectionToJsonFile } from '@/scripts/industry-tariff-reports/05-industry-areas';
import { findReportSlugByOldUrl, readIndustryTariffReportByOldUrl } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  if (!industry) throw new Error('Industry is required');

  const slug = await findReportSlugByOldUrl(industry);
  await getAndWriteIndustryAreaSectionToJsonFile(slug);
  return readIndustryTariffReportByOldUrl(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
