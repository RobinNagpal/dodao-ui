import { getIndustryTariffReport } from '@/scripts/industry-tariff-reports/industry-tariff-report-utils';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { readIndustryHeadingsFromFile, readTariffUpdatesFromFile } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { EvaluateIndustryContent, IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { revalidateTariffReport } from '@/utils/tariff-report-cache-utils';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { getAndWriteEvaluateIndustryAreaJson, regenerateEvaluateIndustryAreaJson } from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';

export const maxDuration = 300;

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
  const { date, headingIndex, subHeadingIndex, sectionType: content = EvaluateIndustryContent.ALL, challengerTicker, establishedPlayerTicker } = request;

  if (!industryId || !date || headingIndex === undefined || subHeadingIndex === undefined) {
    throw new Error('Industry, date, headingIndex, and subHeadingIndex are required');
  }

  // Get dependencies
  const industryAreasWrapper = await readIndustryHeadingsFromFile(industryId);
  if (!industryAreasWrapper) throw new Error(`Headings not found for industry: ${industryId}`);

  const tariffUpdates = await readTariffUpdatesFromFile(industryId);
  const industryArea = industryAreasWrapper.areas[headingIndex].subAreas[subHeadingIndex];

  if (!tariffUpdates) {
    throw new Error('Tariff updates not found');
  }

  const tariffIndustry = getTariffIndustryDefinitionById(industryId);

  console.log(`Generating evaluation for ${industryId} - ${industryArea} - ${content} - ${headingIndex} - ${subHeadingIndex}`);
  // Generate the evaluation based on section type
  if (content === EvaluateIndustryContent.ALL) {
    await getAndWriteEvaluateIndustryAreaJson(tariffIndustry, industryArea, industryAreasWrapper, tariffUpdates, date);
  } else if (content === EvaluateIndustryContent.NEW_CHALLENGER && challengerTicker) {
    await regenerateEvaluateIndustryAreaJson({
      tariffIndustry,
      industryArea,
      industryAreasWrapper,
      tariffUpdates,
      date,
      content,
      challengerTicker,
    });
  } else if (content === EvaluateIndustryContent.ESTABLISHED_PLAYER && establishedPlayerTicker) {
    await regenerateEvaluateIndustryAreaJson({
      tariffIndustry,
      industryArea,
      industryAreasWrapper,
      tariffUpdates,
      date,
      content,
      establishedPlayerTicker,
    });
  } else {
    await regenerateEvaluateIndustryAreaJson({
      tariffIndustry,
      industryArea,
      industryAreasWrapper,
      tariffUpdates,
      date,
      content,
    });
  }

  // Revalidate cache tags
  revalidateTariffReport(industryId);

  return getIndustryTariffReport(industryId);
}

export const POST = withErrorHandlingV2<IndustryTariffReport>(postHandler);
