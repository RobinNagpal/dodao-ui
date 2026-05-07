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

export const PublicCompanySchema = z.object({
  name: z.string().describe('Name of the public company.'),
  ticker: z.string().describe('Ticker symbol of the public company.'),
});

export const IndustrySubAreaSchema = z.object({
  title: z.string().describe('Subarea title'),
  oneLineSummary: z.string().describe('One line summary of the subarea.'),
  companies: z.array(PublicCompanySchema).describe('This is the id of the html element to which the hyperlink points'),
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
  As an investor I want to learn everything about the products and trade scope of ${chapterLabel}.

  Give me the information based on the following rules:
  - I want to divide this chapter into four main areas, with three sub areas under each of them.
  - The Downstream areas should come at the end, then the Midstream areas and then the Upstream areas first.
  - I want to make sure the whole scope of ${chapterLabel} is covered and there is no overlap between the areas.
  - Tell me the top ${ctx.headingsCount} areas and ${ctx.subHeadingsCount} subareas under each that I should know.
  - Number of areas should be ${ctx.headingsCount}
  - Number of subareas under each area should be ${ctx.subHeadingsCount}.
  - There should be almost no overlap between the areas and subareas.

  Also under each subAreas give me the name and tickers of each
  of the US public company that belongs under it.

  I dont want anything like common chapter introduction or metrics or other things to be in the areas or subareas.
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
