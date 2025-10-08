import { writeJsonFileForFinalConclusion } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import {
  FinalConclusion,
  IndustryAreasWrapper,
  NegativeTariffImpactOnCompanyType,
  PositiveTariffImpactOnCompanyType,
  TariffUpdatesForIndustry,
} from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { getTariffIndustryDefinitionById, TariffIndustryId } from './tariff-industries';

const PositiveImpactsSchema = z.object({
  title: z.string().describe('Title of the section which discusses specific industry.'),
  positiveImpacts: z
    .string()
    .describe(
      'Positive impacts of the new tariffs on the industry. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

const NegativeImpactsSchema = z.object({
  title: z.string().describe('Title of the section which discusses specific industry.'),
  negativeImpacts: z
    .string()
    .describe(
      'Negative impacts of the new tariffs on the industry. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

const FinalConclusionSchema = z.object({
  title: z.string().describe('Title of the section which discusses specific industry.'),
  conclusionBrief: z.string().describe('Brief conclusion of the report.'),
  positiveImpacts: PositiveImpactsSchema.describe(
    'Summary of all the area specific summaries which tell the positive impacts of the new tariffs on the industry. ' +
      'The most positive should be first. Make sure to include the specific company names and the company types and the reasoning. ' +
      'It should not have any generic information. Should have concrete points. '
  ),
  negativeImpacts: NegativeImpactsSchema.describe(
    'Summary of all the area specific summaries which tell the negative impacts of the new tariffs on the industry. ' +
      'The most negative should be first. Make sure to include the specific company names and the company types and the reasoning. ' +
      'It should not have any generic information. Should have concrete points. '
  ),
  finalStatements: z.string().describe('Final statements of the report.'),
});

function getFinalConclusionPrompt(
  industry: TariffIndustryId,
  headings: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[],
  positiveImpacts: PositiveTariffImpactOnCompanyType[],
  negativeImpacts: NegativeTariffImpactOnCompanyType[]
): string {
  const definition = getTariffIndustryDefinitionById(industry);
  return `Write a final conclusion section for the ${
    definition.name
  } industry. The conclusion should be 4-6 paragraphs long and should follow the following rules: 
  1. The conclusion should be concise and to the point, avoiding unnecessary details or jargon. 
  2. This is the conclusion, so there should be no introduction as this is the last sections of the report.
  3. Make sure to include the concrete company names and the company types and the reasoning.
  4. The conclusion section should be specific to the ${definition.name} industry but mentions that
     - In this full report, we will discuss the latest tariff updates and their impact on the ${definition.name} industry.
     - The report assumes that the reader is not familiar with the ${definition.name} industry hence we first start with the 
        introduction of the industry.
     - We then try to understand the industry in detail by dividing the industry into few areas.
     - For each of these areas, we learn what exactly is the area, what the established companies, what are the new companies
     and what are the latest tariff updates, and how these updates impact the given area.
     - For each of these areas we also create a final summary.
     - I will provide you the final summaries so that you know what will be discussed, but don't take any insights from them
     in this sections, as this is the executive summary(introduction) section.
  

   Conclusion should include the following fields:
    - Title
    - Conclusion brief a string which is a brief conclusion of the report.
    - Positive impacts a string which is a summary of all the area specific summaries which tell about positive impacts of new tariffs on the industry. 
    - Negative impacts a string which is a summary of all the area specific summaries which tell about negative impacts of new tariffs on the industry. 
    - Final statements a string which is a final statement of the report.

    ${outputInstructions}
    
   # Industry Areas
   ${JSON.stringify(headings, null, 2)}
   
    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
    
    # Positive Impacts
    ${JSON.stringify(positiveImpacts, null, 2)}
    
    # Negative Impacts
    ${JSON.stringify(negativeImpacts, null, 2)}
    
    # Final Summaries
    ${JSON.stringify(tariffSummaries, null, 2)}
   `;
}

async function getFinalConclusion(
  industry: TariffIndustryId,
  headings: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[],
  positiveImpacts: PositiveTariffImpactOnCompanyType[],
  negativeImpacts: NegativeTariffImpactOnCompanyType[]
): Promise<FinalConclusion> {
  const prompt = getFinalConclusionPrompt(industry, headings, tariffUpdates, tariffSummaries, positiveImpacts, negativeImpacts);
  const response = await getLlmResponse<FinalConclusion>(prompt, FinalConclusionSchema, 'gemini-2.5-pro');
  return response;
}

export async function getFinalConclusionAndSaveToFile(
  industry: TariffIndustryId,
  headings: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[],
  positiveImpacts: PositiveTariffImpactOnCompanyType[],
  negativeImpacts: NegativeTariffImpactOnCompanyType[]
) {
  const finalConclusion = await getFinalConclusion(industry, headings, tariffUpdates, tariffSummaries, positiveImpacts, negativeImpacts);

  // Upload JSON to S3
  await writeJsonFileForFinalConclusion(industry, finalConclusion);
}
