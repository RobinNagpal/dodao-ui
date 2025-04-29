import { getLlmResponse, outputInstructions } from '@/scripts/llm-utils';
import {
  FinalConclusion,
  IndustryAreaHeadings,
  NegativeTariffImpactOnCompanyType,
  PositiveTariffImpactOnCompanyType,
  TariffUpdatesForIndustry,
} from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { uploadFileToS3, getJsonFromS3 } from '@/scripts/report-file-utils';

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

const FinalConclusion = z.object({
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
  industry: string,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[],
  positiveImpacts: PositiveTariffImpactOnCompanyType[],
  negativeImpacts: NegativeTariffImpactOnCompanyType[]
): string {
  return `Write a final conclusion section for the ${industry} industry. The conclusion should be 4-6 paragraphs long and should follow the following rules: 
  1. The conclusion should be concise and to the point, avoiding unnecessary details or jargon. 
  2. This is the conclusion, so there should be no introduction as this is the last sections of the report.
  3. Make sure to include the concrete company names and the company types and the reasoning.
  4. The conclusion section should be specific to the ${industry} industry but mentions that
     - In this full report, we will discuss the latest tariff updates and their impact on the ${industry} industry.
     - The report assumes that the reader is not familiar with the ${industry} industry hence we first start with the 
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
  industry: string,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[],
  positiveImpacts: PositiveTariffImpactOnCompanyType[],
  negativeImpacts: NegativeTariffImpactOnCompanyType[]
): Promise<FinalConclusion> {
  const prompt = getFinalConclusionPrompt(industry, headings, tariffUpdates, tariffSummaries, positiveImpacts, negativeImpacts);
  const response = await getLlmResponse<FinalConclusion>(prompt, FinalConclusion);
  return response;
}

function getS3Key(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/07-final-conclusion/${fileName}`;
}

export async function getFinalConclusionAndSaveToFile(
  industry: string,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[],
  positiveImpacts: PositiveTariffImpactOnCompanyType[],
  negativeImpacts: NegativeTariffImpactOnCompanyType[]
) {
  const finalConclusion = await getFinalConclusion(industry, headings, tariffUpdates, tariffSummaries, positiveImpacts, negativeImpacts);

  // Upload JSON to S3
  const jsonKey = getS3Key(industry, 'final-conclusion.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(finalConclusion, null, 2)), jsonKey, 'application/json');

  // Generate and upload markdown
  const markdownContent = getMarkdownContentForFinalConclusion(finalConclusion);
  const markdownKey = getS3Key(industry, 'final-conclusion.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), markdownKey, 'text/markdown');
}

export async function readFinalConclusionFromFile(industry: string): Promise<FinalConclusion | undefined> {
  const key = getS3Key(industry, 'final-conclusion.json');
  return await getJsonFromS3<FinalConclusion>(key);
}

export function getMarkdownContentForFinalConclusion(finalConclusion: FinalConclusion) {
  const markdownContent =
    `# Final Conclusion\n\n` +
    `## ${finalConclusion.title}\n` +
    `${finalConclusion.conclusionBrief}\n\n` +
    `## ${finalConclusion.positiveImpacts.title}\n` +
    `${finalConclusion.positiveImpacts.positiveImpacts}\n\n` +
    `## ${finalConclusion.negativeImpacts.title}\n` +
    `${finalConclusion.negativeImpacts.negativeImpacts}\n\n` +
    `## Final Statements\n` +
    `${finalConclusion.finalStatements}\n`;
  return markdownContent;
}

export async function writeFinalConclusionToMarkdownFile(industry: string, finalConclusion: FinalConclusion) {
  const markdownContent = getMarkdownContentForFinalConclusion(finalConclusion);
  const key = getS3Key(industry, 'final-conclusion.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}
