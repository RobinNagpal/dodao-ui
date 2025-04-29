import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { EvaluateIndustryContent, IndustryTariffReport, TariffReportIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  getAndWriteEvaluateIndustryAreaJson,
  readEvaluateIndustryAreaJsonFromFile,
  regenerateEvaluateIndustryAreaJson,
  writeEvaluateIndustryAreaToMarkdownFile,
} from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';
import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { readTariffUpdatesFromFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';

export interface GenerateEvaluateIndustryAreaRequest {
  companiesToIgnore?: string[];
  date: string;
  headingIndex: number;
  subHeadingIndex: number;
  sectionType?: EvaluateIndustryContent;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: string }> }): Promise<IndustryTariffReport> {
  const { industry } = await params;
  const request = (await req.json()) as GenerateEvaluateIndustryAreaRequest;
  const { companiesToIgnore = [], date, headingIndex, subHeadingIndex, sectionType = EvaluateIndustryContent.ALL } = request;

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
  const headings = await readIndustryHeadingsFromFile(industry);
  const tariff = await readTariffUpdatesFromFile(industry);
  const area = headings.headings[headingIndex].subHeadings[subHeadingIndex];

  if (!tariff) {
    throw new Error('Tariff updates not found');
  }

  // Generate the evaluation based on section type
  if (sectionType === EvaluateIndustryContent.ALL) {
    await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, area, headings, tariff, date);
  } else {
    await regenerateEvaluateIndustryAreaJson(tariffIndustry, area, headings, tariff, date, sectionType);
  }

  const evaluated = await readEvaluateIndustryAreaJsonFromFile(industry, area, headings);
  if (evaluated) {
    await writeEvaluateIndustryAreaToMarkdownFile(industry, area, headings, evaluated);
  }
  return getIndustryTariffReport(industry);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
