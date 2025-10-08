import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { readIndustryHeadingsFromFile, readUnderstandIndustryJsonFromFile } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getAndWriteUnderstandIndustryJson } from '@/scripts/industry-tariff-reports/04-understand-industry';
import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get the headings first
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  // Generate the understand industry section
  await getAndWriteUnderstandIndustryJson(industry, headings);

  const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
  if (!understandIndustry) {
    throw new Error('Understand industry section not found');
  }

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
