import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { readEvaluateSubIndustryAreaJsonFromFile, readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { EstablishedPlayerRef } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { revalidateEvaluateIndustryAreas, revalidateTariffReport } from '@/utils/tariff-report-cache-utils';

export const maxDuration = 300;

export interface GetEstablishedPlayersRequest {
  headingIndex: number;
  subHeadingIndex: number;
}

export interface GetEstablishedPlayersResponse {
  establishedPlayers: EstablishedPlayerRef[];
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<GetEstablishedPlayersResponse> {
  const { industry: industryId } = await params;
  const request = (await req.json()) as GetEstablishedPlayersRequest;
  const { headingIndex, subHeadingIndex } = request;

  if (!industryId || headingIndex === undefined || subHeadingIndex === undefined) {
    throw new Error('Industry, headingIndex, and subHeadingIndex are required');
  }

  // Get dependencies
  const headings = await readIndustryHeadingsFromFile(industryId);
  if (!headings) throw new Error(`Headings not found for industry: ${industryId}`);

  const area = headings.areas[headingIndex].subAreas[subHeadingIndex];

  // Read the existing evaluation data to get established players
  const evaluatedArea = await readEvaluateSubIndustryAreaJsonFromFile(industryId, area, headings);

  if (!evaluatedArea || !evaluatedArea.establishedPlayersRefs || evaluatedArea.establishedPlayersRefs.length === 0) {
    throw new Error('No established players found. Please generate the established players list first.');
  }

  // Revalidate cache tags
  revalidateEvaluateIndustryAreas(industryId);
  revalidateTariffReport(industryId);

  return {
    establishedPlayers: evaluatedArea.establishedPlayersRefs,
  };
}

export const POST = withErrorHandlingV2<GetEstablishedPlayersResponse>(postHandler);
