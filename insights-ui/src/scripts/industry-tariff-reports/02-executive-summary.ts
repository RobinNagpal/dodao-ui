import {
  chapterSeoGuidance,
  formatChapterLabel,
  getChapterPromptContext,
  readIndustryHeadings,
  readTariffUpdates,
  writeExecutiveSummary,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { ExecutiveSummary } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

const ExecutiveSummarySchema = z.object({
  title: z.string().describe('Title of the section which discusses the specific HTS chapter.'),
  executiveSummary: z
    .string()
    .describe(
      'Executive summary of the report. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export async function getExecutiveSummaryAndSaveToFile(slug: string): Promise<void> {
  const ctx = await getChapterPromptContext(slug);
  const chapterLabel = formatChapterLabel(ctx);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);
  const tariffUpdates = await readTariffUpdates(slug);
  if (!tariffUpdates) throw new Error(`Tariff updates not found for slug "${slug}"`);

  const prompt = `Write an executive summary section for the tariff analysis of ${chapterLabel}.
  The summary should be 4-6 paragraphs long and should follow the following rules:
  1. The summary should be concise and to the point, avoiding unnecessary details or jargon.
  2. This is the introduction, so there should be no conclusion as this is the first section of the report.
  3. The summary section should be specific to ${chapterLabel} but mentions that
     - In this full report, we will discuss the latest tariff updates and their impact on ${chapterLabel}.
     - The report assumes that the reader is not familiar with the products and trade scope of ${chapterLabel}, so we first introduce the chapter.
     - We then try to understand the chapter in detail by dividing it into a few areas.
     - For each of these areas, we learn what exactly the area is, what the established companies are, what the new companies are,
       and what the latest tariff updates are, and how these updates impact the given area.
     - For each of these areas we also create a final summary.
  4. Dont use Katex or Latex or italics formatting in the response.
  5. Do NOT include markdown headings (\`#\`, \`##\`, \`###\`) inside the \`executiveSummary\` field. The "Executive Summary" header is rendered by the page UI; your content should be plain paragraphs, **bold**, and bullets only.
  6. Bold every rate / percentage / dollar amount. Do not invent figures or use placeholders like \`var\` or \`TBD\`.

   Executive summary should include the following fields:
    - title (search-friendly H1, 50-65 characters, includes the chapter title and a high-intent keyword such as
      "Tariff Impact", "Duty Rates", or "2026 Updates" — e.g. "${ctx.chapterTitle}: Tariff Impact Summary").
    - executiveSummary (a markdown string which is the summary of the report)

   ${chapterSeoGuidance(ctx)}

   ${outputInstructions}

   # Chapter Areas
   ${JSON.stringify(headings, null, 2)}

    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
  `;

  const executiveSummary = await getLlmResponse<ExecutiveSummary>(
    prompt,
    ExecutiveSummarySchema,
    LLMProvider.GEMINI_WITH_GROUNDING,
    GeminiModel.GEMINI_3_PRO_PREVIEW
  );
  await writeExecutiveSummary(slug, executiveSummary);
}
