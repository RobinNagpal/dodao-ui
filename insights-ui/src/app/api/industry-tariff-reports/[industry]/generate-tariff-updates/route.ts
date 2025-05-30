import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import {
  readIndustryHeadingsFromFile,
  readTariffUpdatesFromFile,
  writeMarkdownFileForIndustryTariffs,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getTariffUpdatesForIndustryAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';

interface GenerateTariffUpdatesRequest {
  date: string;
  countryName?: string;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  const request = (await req.json()) as GenerateTariffUpdatesRequest;
  const { date, countryName } = request;

  if (!industry || !date) {
    throw new Error('Industry and date are required');
  }

  // Get the headings first
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  // Generate the tariff updates
  await getTariffUpdatesForIndustryAndSaveToFile(industry, date, headings, countryName);
  const tariffUpdatesForIndustry = await readTariffUpdatesFromFile(industry);
  if (!tariffUpdatesForIndustry) {
    throw new Error('Tariff updates not found');
  }
  await writeMarkdownFileForIndustryTariffs(industry, tariffUpdatesForIndustry);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
