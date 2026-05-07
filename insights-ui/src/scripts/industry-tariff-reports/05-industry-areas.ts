import {
  formatChapterLabel,
  getChapterPromptContext,
  readIndustryHeadings,
  writeIndustryAreaSection,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { IndustryAreaSection } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

const IndustryAreaSectionSchema = z.object({
  title: z.string().describe('Title of the section which discusses various chapter areas.'),
  industryAreas: z
    .string()
    .describe(
      '5-6 paragraphs that explain how the given areas divide the HTS chapter into various sub-areas which cover ' + 'the most important aspects of the chapter'
    ),
});

export async function getAndWriteIndustryAreaSectionToJsonFile(slug: string): Promise<void> {
  const ctx = await getChapterPromptContext(slug);
  const chapterLabel = formatChapterLabel(ctx);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);

  const prompt = `
  I want to explain to the investors how the following headings and subheadings divide ${chapterLabel} into clean
  areas so that they cover the whole scope of the chapter. In some of the next sections I will be discussing each of
  these sub-headings in detail, but in this section I want to explain how these sub-headings are related to each other
  and how they divide the chapter into various areas.

  # Follow the below instructions:
  - Add 5-6 paragraphs that explain how the given areas divide ${chapterLabel} into various sub-areas
  - Explain how the sub-areas of ${chapterLabel} are connected to each other and how they relate to the main headings.
  - Give a detailed insightful explanation of the sub-areas and how they relate to the main headings in around 1500 words

  ${outputInstructions}

  # Headings and Subheadings
  ${JSON.stringify(headings, null, 2)}
`;

  const industryAreaSection = await getLlmResponse<IndustryAreaSection>(
    prompt,
    IndustryAreaSectionSchema,
    LLMProvider.GEMINI_WITH_GROUNDING,
    GeminiModel.GEMINI_3_PRO_PREVIEW
  );
  await writeIndustryAreaSection(slug, industryAreaSection);
}
