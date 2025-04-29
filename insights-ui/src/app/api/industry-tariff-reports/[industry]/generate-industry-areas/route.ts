import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  getAndWriteIndustryAreaSectionToJsonFile,
  readIndustryAreaSectionFromFile,
  writeIndustryAreaSectionToMarkdownFile,
} from '@/scripts/industry-tariff-reports/05-industry-areas';
import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get the headings first
  const headings = await readIndustryHeadingsFromFile(industry);

  // Generate the industry areas section
  await getAndWriteIndustryAreaSectionToJsonFile(industry, headings);
  const industryAreaSection = await readIndustryAreaSectionFromFile(industry);
  await writeIndustryAreaSectionToMarkdownFile(industry, industryAreaSection);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
