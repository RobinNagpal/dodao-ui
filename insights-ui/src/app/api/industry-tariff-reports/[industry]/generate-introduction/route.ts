import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import {
  readIndustryHeadingsFromFile,
  readIntroductionJsonFromFile,
  writeMarkdownFileForIntroduction,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getAndWriteIntroductionsJson } from '@/scripts/industry-tariff-reports/02-introduction';

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
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  // Generate the introduction
  await getAndWriteIntroductionsJson(industry, date, headings);
  const introductions = await readIntroductionJsonFromFile(industry);

  if (!introductions) {
    throw new Error('Introduction not found');
  }

  await writeMarkdownFileForIntroduction(industry, introductions);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
