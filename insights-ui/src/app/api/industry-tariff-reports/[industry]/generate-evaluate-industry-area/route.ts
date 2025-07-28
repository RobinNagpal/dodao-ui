export const maxDuration = 800;

import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import {
  readEvaluateSubIndustryAreaJsonFromFile,
  readIndustryHeadingsFromFile,
  readTariffUpdatesFromFile,
  writeMarkdownFileForEvaluateSubIndustryArea,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { EvaluateIndustryContent, IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getAndWriteEvaluateIndustryAreaJson, regenerateEvaluateIndustryAreaJson } from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';

export interface GenerateEvaluateIndustryAreaRequest {
  companiesToIgnore?: string[];
  date: string;
  headingIndex: number;
  subHeadingIndex: number;
  sectionType?: EvaluateIndustryContent;
  challengerTicker?: string;
  establishedPlayerTicker?: string;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<IndustryTariffReport> {
  const { industry: industryId } = await params;
  const request = (await req.json()) as GenerateEvaluateIndustryAreaRequest;
  const { date, headingIndex, subHeadingIndex, sectionType = EvaluateIndustryContent.ALL, challengerTicker, establishedPlayerTicker } = request;

  if (!industryId || !date || headingIndex === undefined || subHeadingIndex === undefined) {
    throw new Error('Industry, date, headingIndex, and subHeadingIndex are required');
  }

  // Get dependencies
  const headings = await readIndustryHeadingsFromFile(industryId);
  if (!headings) throw new Error(`Headings not found for industry: ${industryId}`);

  const tariff = await readTariffUpdatesFromFile(industryId);
  const area = headings.areas[headingIndex].subAreas[subHeadingIndex];

  if (!tariff) {
    throw new Error('Tariff updates not found');
  }

  const tariffIndustry = getTariffIndustryDefinitionById(industryId);

  console.log(`Generating evaluation for ${industryId} - ${area} - ${sectionType} - ${headingIndex} - ${subHeadingIndex}`);
  // Generate the evaluation based on section type
  if (sectionType === EvaluateIndustryContent.ALL) {
    await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, area, headings, tariff, date);
  } else if (sectionType === EvaluateIndustryContent.NEW_CHALLENGER && challengerTicker) {
    await regenerateEvaluateIndustryAreaJson(tariffIndustry, area, headings, tariff, date, sectionType, challengerTicker);
  } else if (sectionType === EvaluateIndustryContent.ESTABLISHED_PLAYER && establishedPlayerTicker) {
    await regenerateEvaluateIndustryAreaJson(tariffIndustry, area, headings, tariff, date, sectionType, establishedPlayerTicker);
  } else {
    await regenerateEvaluateIndustryAreaJson(tariffIndustry, area, headings, tariff, date, sectionType);
  }

  const evaluated = await readEvaluateSubIndustryAreaJsonFromFile(industryId, area, headings);
  if (evaluated) {
    await writeMarkdownFileForEvaluateSubIndustryArea(industryId, area, headings, evaluated);
  }
  return getIndustryTariffReport(industryId);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
