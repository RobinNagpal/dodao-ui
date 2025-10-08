import {
  readIndustryHeadingsFromFile,
  readEvaluateSubIndustryAreaJsonFromFile,
  writeJsonFileForEvaluateSubIndustryArea,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { TariffIndustryId, getNumberOfSubHeadings } from '@/scripts/industry-tariff-reports/tariff-industries';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface SaveJsonRequest {
  section: string;
  headingAndSubheadingIndex: string;
  sectionType: string;
  data: any;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ industry: TariffIndustryId }> }): Promise<{ success: boolean; message: string }> {
  const { industry } = await params;
  const body: SaveJsonRequest = await req.json();
  const { section, headingAndSubheadingIndex, sectionType, data } = body;

  if (!industry) {
    throw new Error('Industry is required');
  }

  if (!section || !headingAndSubheadingIndex || !sectionType || !data) {
    throw new Error('Section, headingAndSubheadingIndex, sectionType, and data are required');
  }

  // Only handle evaluate-industry-areas section for now
  if (section !== 'evaluate-industry-areas') {
    throw new Error('Only evaluate-industry-areas section is supported');
  }

  // Only handle established-players and new-challengers
  if (!['established-players', 'new-challengers'].includes(sectionType)) {
    throw new Error('Only established-players and new-challengers are supported for JSON updates');
  }

  // Parse heading and subheading index
  const [headingString, subHeadingString] = headingAndSubheadingIndex.split('-');
  const headingIndex = Number.parseInt(headingString, 10);
  const subHeadingIndex = Number.parseInt(subHeadingString, 10);

  // Get industry headings to build the correct structure
  const industryHeadings = await readIndustryHeadingsFromFile(industry);
  if (!industryHeadings) {
    throw new Error('Industry headings not found');
  }

  // Find the corresponding sub-area
  const indexInArray = headingIndex * getNumberOfSubHeadings(industry) + subHeadingIndex;
  const allSubAreas = industryHeadings.areas.flatMap((area) => area.subAreas);
  const targetSubArea = allSubAreas[indexInArray];

  if (!targetSubArea) {
    throw new Error('Sub-area not found');
  }

  // Read the existing evaluate industry area data
  const existingData = await readEvaluateSubIndustryAreaJsonFromFile(industry, targetSubArea, industryHeadings);
  if (!existingData) {
    throw new Error('Evaluate industry area data not found');
  }

  // Update the specific section with new data
  if (sectionType === 'established-players') {
    existingData.establishedPlayerDetails = data;
  } else if (sectionType === 'new-challengers') {
    existingData.newChallengersDetails = data;
  }

  // Save the updated JSON data
  await writeJsonFileForEvaluateSubIndustryArea(industry, targetSubArea, industryHeadings, existingData);

  return {
    success: true,
    message: `${sectionType} data updated successfully`,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean; message: string }>(postHandler);
