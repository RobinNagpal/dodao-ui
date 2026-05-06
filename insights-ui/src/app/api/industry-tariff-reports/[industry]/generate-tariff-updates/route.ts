import { getTariffUpdatesForIndustryAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { findReportSlugByOldUrl, readIndustryTariffReportByOldUrl } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface GenerateTariffUpdatesRequest {
  date: string;
  countryName?: string;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  const { date, countryName } = (await req.json()) as GenerateTariffUpdatesRequest;

  if (!industry || !date) throw new Error('Industry and date are required');

  const slug = await findReportSlugByOldUrl(industry);
  await getTariffUpdatesForIndustryAndSaveToFile(slug, date, countryName);
  return readIndustryTariffReportByOldUrl(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
