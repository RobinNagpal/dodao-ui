import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { IndustryTariffReport, TariffReportIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  getAndWriteEvaluateIndustryAreaJson,
  readEvaluateIndustryAreaJsonFromFile,
  writeEvaluateIndustryAreaToMarkdownFile,
} from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';
import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { readTariffUpdatesFromFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';

interface GenerateEvaluateIndustryAreaRequest {
  companiesToIgnore?: string[];
  date: string;
  headingIndex: number;
  subHeadingIndex: number;
}

async function postHandler(req: NextRequest, { params }: { params: { industry: string } }): Promise<IndustryTariffReport> {
  const { industry } = params;
  const request = (await req.json()) as GenerateEvaluateIndustryAreaRequest;
  const { companiesToIgnore = [], date, headingIndex, subHeadingIndex } = request;

  if (!industry || !date || headingIndex === undefined || subHeadingIndex === undefined) {
    throw new Error('Industry, date, headingIndex, and subHeadingIndex are required');
  }

  // Create tariff report industry object
  const tariffIndustry: TariffReportIndustry = {
    name: industry,
    companiesToIgnore: companiesToIgnore,
    asOfDate: date,
  };

  // Get dependencies
  const headings = readIndustryHeadingsFromFile(industry);
  const tariff = readTariffUpdatesFromFile(industry);
  const area = headings.headings[headingIndex].subHeadings[subHeadingIndex];

  // Generate the evaluation
  await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, area, headings, tariff, date);
  const evaluated = readEvaluateIndustryAreaJsonFromFile(industry, area, headings);
  writeEvaluateIndustryAreaToMarkdownFile(industry, area, headings, evaluated);

  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
