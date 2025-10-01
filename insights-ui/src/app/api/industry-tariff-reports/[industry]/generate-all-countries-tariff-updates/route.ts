import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { readIndustryHeadingsFromFile, readAllCountriesTariffUpdatesFromFile } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getAllCountriesTariffUpdatesForIndustryAndSaveToFile } from '@/scripts/industry-tariff-reports/09-all-countries-tariffs';
import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';

interface GenerateAllCountriesTariffUpdatesRequest {
  date: string;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  const request = (await req.json()) as GenerateAllCountriesTariffUpdatesRequest;
  const { date } = request;

  if (!industry || !date) {
    throw new Error('Industry and date are required');
  }

  // Get the headings first
  const headings = await readIndustryHeadingsFromFile(industry);
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  // Generate the all-countries tariff updates (no country parameter)
  await getAllCountriesTariffUpdatesForIndustryAndSaveToFile(industry, date, headings);
  const allCountriesTariffUpdates = await readAllCountriesTariffUpdatesFromFile(industry);
  if (!allCountriesTariffUpdates) {
    throw new Error('All countries tariff updates not found');
  }

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
