import {
  formatChapterLabel,
  getChapterPromptContext,
  writeIndustryHeadings,
  type ChapterPromptContext,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { IndustryAreasWrapper } from '@/scripts/industry-tariff-reports/tariff-types';
import { z, ZodObject } from 'zod';
import { getLlmResponse } from '../llm‑utils‑gemini';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

// Headings drive the structure of every downstream section (cover, executive
// summary, understand-industry, industry-areas, tariff-updates, conclusion).
// Keep this lean: title + one-line summary is enough to scope the prompts
// for an HTS chapter. We previously also asked for US public companies per
// subarea for the (now-removed) "evaluate industry area" section; that data
// is no longer consumed anywhere, so dropping it shrinks the JSON the LLM
// has to produce and reduces hallucinations.
export const IndustrySubAreaSchema = z.object({
  title: z.string().describe('Subarea title'),
  oneLineSummary: z.string().describe('One line summary of the subarea.'),
});

export const IndustryAreaSchema = z.object({
  title: z.string().describe('Title of the one of the main areas.'),
  oneLineSummary: z.string().describe('One line summary of the area.'),
  subAreas: z.array(IndustrySubAreaSchema).describe('Array of subareas under the main area.'),
});

export const IndustryAreasSchema: ZodObject<any> = z.object({
  areas: z.array(IndustryAreaSchema).describe('Array of main areas.'),
});

function getMainIndustryPrompt(ctx: ChapterPromptContext) {
  const chapterLabel = formatChapterLabel(ctx);
  const prompt: string = `
  Divide ${chapterLabel} into clean, non-overlapping product/trade areas suitable for an HTS-chapter
  tariff report. The output drives the structure of every other section, so the areas must be
  specific to the goods covered by this HTS chapter — not generic industry segments.

  Rules:
  - Produce exactly ${ctx.headingsCount} top-level areas, each with exactly ${ctx.subHeadingsCount} sub-areas.
  - Order: Upstream first, then Midstream, then Downstream.
  - Together the areas must cover the full product scope of ${chapterLabel} with effectively no overlap.
  - Each area/sub-area title should reference concrete goods or trade categories from this HTS chapter
    (not generic terms like "Market Dynamics" or "Industry Overview").
  - The "oneLineSummary" should be one sentence that names the goods covered and their role in the chapter.

  Do NOT include common-chapter introductions, generic metrics, regulatory overviews, or company lists —
  those belong to other sections of the report.
  `;

  return prompt;
}

export async function getAndWriteIndustryHeadings(slug: string) {
  const ctx = await getChapterPromptContext(slug);
  const areas = await getLlmResponse<IndustryAreasWrapper>(
    getMainIndustryPrompt(ctx),
    IndustryAreasSchema,
    LLMProvider.GEMINI_WITH_GROUNDING,
    GeminiModel.GEMINI_3_PRO_PREVIEW
  );
  console.log(JSON.stringify(areas, null, 2));

  await writeIndustryHeadings(slug, areas);
}
