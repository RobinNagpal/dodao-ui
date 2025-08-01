import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { readEvaluateSubIndustryAreaJsonFromFile, readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { NewChallengerRef } from '@/scripts/industry-tariff-reports/tariff-types';
import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export const maxDuration = 300;

export interface GetNewChallengersRequest {
  headingIndex: number;
  subHeadingIndex: number;
}

export interface GetNewChallengersResponse {
  newChallengers: NewChallengerRef[];
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<GetNewChallengersResponse> {
  const { industry: industryId } = await params;
  const request = (await req.json()) as GetNewChallengersRequest;
  const { headingIndex, subHeadingIndex } = request;

  console.log('fetching new challengers for');

  if (!industryId || headingIndex === undefined || subHeadingIndex === undefined) {
    throw new Error('Industry, headingIndex, and subHeadingIndex are required');
  }

  // Get dependencies
  const headings = await readIndustryHeadingsFromFile(industryId);
  if (!headings) throw new Error(`Headings not found for industry: ${industryId}`);

  const area = headings.areas[headingIndex].subAreas[subHeadingIndex];

  // Read the existing evaluation data to get new challengers
  const evaluatedArea = await readEvaluateSubIndustryAreaJsonFromFile(industryId, area, headings);

  if (!evaluatedArea || !evaluatedArea.newChallengersRefs || evaluatedArea.newChallengersRefs.length === 0) {
    throw new Error('No new challengers found. Please generate the new challengers list first.');
  }

  console.log(evaluatedArea.newChallengersRefs);

  return {
    newChallengers: evaluatedArea.newChallengersRefs,
  };
}

export const POST = withErrorHandlingV2<GetNewChallengersResponse>(postHandler);
