import { getIndustryPromptContext, readIndustryHeadings, writeIndustryAreaSection } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { IndustryAreaSection } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';

const IndustryAreaSectionSchema = z.object({
  title: z.string().describe('Title of the section which discusses various industry areas.'),
  industryAreas: z
    .string()
    .describe(
      '5-6 paragraphs that explain how the given areas divide in the industry into various sub-areas which cover ' +
        'the most important aspects of the industry'
    ),
});

export async function getAndWriteIndustryAreaSectionToJsonFile(slug: string): Promise<void> {
  const ctx = await getIndustryPromptContext(slug);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);

  const prompt = `
  I want to explain to the investors how following headings and subheadings divide the ${ctx.industryName} industry into nice
  areas so that they cover the whole of the industry. In some of the next sections I will be discussing each of these
  sub-headings in detail, but in this section I want to explain how these sub-headings are related to each other and
  how they divide the industry into various areas.

  # Follow the below instructions:
  - Add 5-6 paragraphs that explain how the given areas divide in the industry into various sub-areas which cover
  - Explain how the ${ctx.industryName} sub-areas are connected to each other and how they are related to the main headings.
  - Give a detailed insightful explanation of the sub-areas and how they are related to the main headings in around 1500 words

  ${outputInstructions}

  # Headings and Subheadings
  ${JSON.stringify(headings, null, 2)}
`;

  const industryAreaSection = await getLlmResponse<IndustryAreaSection>(prompt, IndustryAreaSectionSchema);
  await writeIndustryAreaSection(slug, industryAreaSection);
}
