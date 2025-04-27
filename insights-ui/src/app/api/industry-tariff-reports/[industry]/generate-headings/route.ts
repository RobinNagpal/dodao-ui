import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  getAndWriteIndustryHeadings,
  readIndustryHeadingsFromFile,
  writeIndustryHeadingsToMarkdownFile,
} from '@/scripts/industry-tariff-reports/00-industry-main-headings';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;

  if (!industry) {
    throw new Error('Industry is required');
  }

  // Generate the headings
  await getAndWriteIndustryHeadings(industry);
  const headings = await readIndustryHeadingsFromFile(industry);
  writeIndustryHeadingsToMarkdownFile(industry, headings);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
