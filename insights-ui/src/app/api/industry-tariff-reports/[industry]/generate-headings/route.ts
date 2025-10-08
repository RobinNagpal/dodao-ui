import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { readIndustryHeadingsFromFile, writeMarkdownFileForIndustryAreas } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { revalidateTariffReport } from '@/utils/tariff-report-cache-utils';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getAndWriteIndustryHeadings } from '@/scripts/industry-tariff-reports/00-industry-main-headings';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Generate the headings
  await getAndWriteIndustryHeadings(industry);
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  // Revalidate cache tags
  revalidateTariffReport(industry);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
