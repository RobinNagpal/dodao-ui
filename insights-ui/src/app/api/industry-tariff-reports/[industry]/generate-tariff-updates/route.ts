import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  getTariffUpdatesForIndustryAndSaveToFile,
  readTariffUpdatesFromFile,
  writeTariffUpdatesToMarkdownFile,
} from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';

interface GenerateTariffUpdatesRequest {
  date: string;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  const request = (await req.json()) as GenerateTariffUpdatesRequest;
  const { date } = request;

  if (!industry || !date) {
    throw new Error('Industry and date are required');
  }

  // Get the headings first
  const headings = await readIndustryHeadingsFromFile(industry);

  // Generate the tariff updates
  await getTariffUpdatesForIndustryAndSaveToFile(industry, date, headings);
  const tariffUpdatesForIndustry = readTariffUpdatesFromFile(industry);
  writeTariffUpdatesToMarkdownFile(industry, tariffUpdatesForIndustry);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
