import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  getAndWriteUnderstandIndustryJson,
  readUnderstandIndustryJsonFromFile,
  writeUnderstandIndustryToMarkdownFile,
} from '@/scripts/industry-tariff-reports/04-understand-industry';
import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Get the headings first
  const headings = await readIndustryHeadingsFromFile(industry);

  // Generate the understand industry section
  await getAndWriteUnderstandIndustryJson(industry, headings);
  const understandIndustry = readUnderstandIndustryJsonFromFile(industry);
  writeUnderstandIndustryToMarkdownFile(industry, understandIndustry);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
