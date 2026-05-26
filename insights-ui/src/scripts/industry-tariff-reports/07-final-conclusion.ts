import {
  chapterSeoGuidance,
  formatChapterLabel,
  getChapterPromptContext,
  readIndustryHeadings,
  readTariffUpdates,
  writeFinalConclusion,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { FinalConclusion } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

const PositiveImpactsSchema = z.object({
  title: z.string().describe('Title of the section which discusses the specific HTS chapter.'),
  positiveImpacts: z
    .string()
    .describe(
      'Positive impacts of the new tariffs on the HTS chapter. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

const NegativeImpactsSchema = z.object({
  title: z.string().describe('Title of the section which discusses the specific HTS chapter.'),
  negativeImpacts: z
    .string()
    .describe(
      'Negative impacts of the new tariffs on the HTS chapter. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

const FinalConclusionSchema = z.object({
  title: z.string().describe('Title of the section which discusses the specific HTS chapter.'),
  conclusionBrief: z.string().describe('Brief conclusion of the report.'),
  positiveImpacts: PositiveImpactsSchema.describe(
    'Summary of all the area specific summaries which tell the positive impacts of the new tariffs on the HTS chapter. ' +
      'The most positive should be first. Make sure to include the specific company names and the company types and the reasoning. ' +
      'It should not have any generic information. Should have concrete points. '
  ),
  negativeImpacts: NegativeImpactsSchema.describe(
    'Summary of all the area specific summaries which tell the negative impacts of the new tariffs on the HTS chapter. ' +
      'The most negative should be first. Make sure to include the specific company names and the company types and the reasoning. ' +
      'It should not have any generic information. Should have concrete points. '
  ),
  finalStatements: z.string().describe('Final statements of the report.'),
});

export async function getFinalConclusionAndSaveToFile(slug: string): Promise<void> {
  const ctx = await getChapterPromptContext(slug);
  const chapterLabel = formatChapterLabel(ctx);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);
  const tariffUpdates = await readTariffUpdates(slug);
  if (!tariffUpdates) throw new Error(`Tariff updates not found for slug "${slug}"`);

  const prompt = `Write a final conclusion section for the tariff analysis of ${chapterLabel}.
  The conclusion should be 4-6 paragraphs long and should follow the following rules:
  1. The conclusion should be concise and to the point, avoiding unnecessary details or jargon.
  2. This is the conclusion, so there should be no introduction as this is the last sections of the report.
  3. Make sure to include the concrete company names and the company types and the reasoning.
  4. The conclusion section should be specific to ${chapterLabel} but mentions that
     - In this full report, we discussed the latest tariff updates and their impact on ${chapterLabel}.
     - The report assumes that the reader is not familiar with the products and trade scope of ${chapterLabel}, so we first introduced the chapter.
     - We then tried to understand the chapter in detail by dividing it into a few areas.
     - For each of these areas, we learned what exactly the area is, what the established companies are, what the new companies are,
       and what the latest tariff updates are, and how these updates impact the given area.
     - For each of these areas we also created a final summary.
  5. Do NOT use markdown headings (\`#\`, \`##\`, \`###\`, etc.) inside any of the body fields (\`conclusionBrief\`, \`positiveImpacts.positiveImpacts\`, \`negativeImpacts.negativeImpacts\`, \`finalStatements\`). The page UI already renders the section title above each field — use plain paragraphs, **bold**, or bullets for emphasis.
  6. Bold every rate / percentage / dollar amount. Do not invent figures or use placeholders like \`var\` or \`TBD\`.


   Conclusion should include the following fields:
    - title (the page H1 — a search-friendly, 50-65 character title for the conclusion page)
    - conclusionBrief (string — opens with a one-paragraph synthesis; no heading prefix)
    - positiveImpacts (object with keys: title, positiveImpacts)
    - negativeImpacts (object with keys: title, negativeImpacts)
    - finalStatements (string — no heading prefix; the UI labels this "Final Statements")

    ${outputInstructions}

    ${chapterSeoGuidance(ctx)}

   # Chapter Areas
   ${JSON.stringify(headings, null, 2)}

    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
   `;

  const finalConclusion = await getLlmResponse<FinalConclusion>(
    prompt,
    FinalConclusionSchema,
    LLMProvider.GEMINI_WITH_GROUNDING,
    GeminiModel.GEMINI_3_1_PRO_PREVIEW
  );
  await writeFinalConclusion(slug, finalConclusion);
}
