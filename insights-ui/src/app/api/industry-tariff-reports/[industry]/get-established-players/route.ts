import { TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { readEvaluateSubIndustryAreaJsonFromFile, readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { EstablishedPlayerRef } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const maxDuration = 300;

export interface GetEstablishedPlayersRequest {
  headingIndex: number;
  subHeadingIndex: number;
}

export interface GetEstablishedPlayersResponse {
  establishedPlayers: EstablishedPlayerRef[];
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<GetEstablishedPlayersResponse> {
  const { industry: industryId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const headingIndex = parseInt(searchParams.get('headingIndex') || '0', 10);
  const subHeadingIndex = parseInt(searchParams.get('subHeadingIndex') || '0', 10);

  if (!industryId || isNaN(headingIndex) || isNaN(subHeadingIndex)) {
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

  return {
    establishedPlayers: evaluatedArea.establishedPlayersRefs,
  };
}

export const GET = withErrorHandlingV2<GetEstablishedPlayersResponse>(getHandler);
