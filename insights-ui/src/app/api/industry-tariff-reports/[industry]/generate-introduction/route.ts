import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getAndWriteIntroductionsJson, readIntroductionJsonFromFile, writeIntroductionToMarkdownFile } from '@/scripts/industry-tariff-reports/02-introduction';
import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';

interface GenerateIntroductionRequest {
  date: string;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  const request = (await req.json()) as GenerateIntroductionRequest;
  const { date } = request;

  if (!industry || !date) {
    throw new Error('Industry and date are required');
  }

  // Get the headings first
  const headings = await readIndustryHeadingsFromFile(industry);

  // Generate the introduction
  await getAndWriteIntroductionsJson(industry, date, headings);
  const introductions = await readIntroductionJsonFromFile(industry);

  if (!introductions) {
    throw new Error('Introduction not found');
  }

  await writeIntroductionToMarkdownFile(industry, introductions);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
