import {
  getIndustryPromptContext,
  readIndustryHeadings,
  readTariffUpdates,
  writeFinalConclusion,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { FinalConclusion } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';

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

export async function getFinalConclusionAndSaveToFile(slug: string): Promise<void> {
  const ctx = await getIndustryPromptContext(slug);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);
  const tariffUpdates = await readTariffUpdates(slug);
  if (!tariffUpdates) throw new Error(`Tariff updates not found for slug "${slug}"`);

  const prompt = `Write a final conclusion section for the ${
    ctx.industryName
  } industry. The conclusion should be 4-6 paragraphs long and should follow the following rules:
  1. The conclusion should be concise and to the point, avoiding unnecessary details or jargon.
  2. This is the conclusion, so there should be no introduction as this is the last sections of the report.
  3. Make sure to include the concrete company names and the company types and the reasoning.
  4. The conclusion section should be specific to the ${ctx.industryName} industry but mentions that
     - In this full report, we will discuss the latest tariff updates and their impact on the ${ctx.industryName} industry.
     - The report assumes that the reader is not familiar with the ${ctx.industryName} industry hence we first start with the
        introduction of the industry.
     - We then try to understand the industry in detail by dividing the industry into few areas.
     - For each of these areas, we learn what exactly is the area, what the established companies, what are the new companies
     and what are the latest tariff updates, and how these updates impact the given area.
     - For each of these areas we also create a final summary.


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
   `;

  const finalConclusion = await getLlmResponse<FinalConclusion>(prompt, FinalConclusionSchema);
  await writeFinalConclusion(slug, finalConclusion);
}
