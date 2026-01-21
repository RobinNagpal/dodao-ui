import { writeJsonFileForIndustryAreaSections } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryAreaSection, IndustryAreasWrapper } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { getTariffIndustryDefinitionById, TariffIndustryId } from './tariff-industries';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

const IndustryAreaSectionSchema = z.object({
  title: z.string().describe('Title of the section which discusses various industry areas.'),
  industryAreas: z
    .string()
    .describe(
      '5-6 paragraphs that explain how the given areas divide in the industry into various sub-areas which cover ' +
        'the most important aspects of the industry'
    ),
});

function getIndustryAreaPrompt(industry: TariffIndustryId, headings: IndustryAreasWrapper) {
  const definition = getTariffIndustryDefinitionById(industry);
  const prompt = `
  I want to explain to the investors how following headings and subheadings divide the ${definition.name} industry into nice 
  areas so that they cover the whole of the industry. In some of the next sections I will be discussing each of these
  sub-headings in detail, but in this section I want to explain how these sub-headings are related to each other and 
  how they divide the industry into various areas.
  
  # Follow the below instructions:
  - Add 5-6 paragraphs that explain how the given areas divide in the industry into various sub-areas which cover
  - Explain how the ${definition.name} sub-areas are connected to each other and how they are related to the main headings.
  - Give a detailed insightful explanation of the sub-areas and how they are related to the main headings in around 1500 words
  
  ${outputInstructions}

  # Headings and Subheadings
  ${JSON.stringify(headings, null, 2)}
`;

  return prompt;
}

async function getIndustryAreaSection(industry: TariffIndustryId, headings: IndustryAreasWrapper): Promise<IndustryAreaSection> {
  const prompt = getIndustryAreaPrompt(industry, headings);
  const response = await getLlmResponse<IndustryAreaSection>(prompt, IndustryAreaSectionSchema, LLMProvider.GEMINI, GeminiModel.GEMINI_2_5_PRO);
  return response;
}

export async function getAndWriteIndustryAreaSectionToJsonFile(industry: TariffIndustryId, headings: IndustryAreasWrapper): Promise<void> {
  const industryAreaSection = await getIndustryAreaSection(industry, headings);

  await writeJsonFileForIndustryAreaSections(industry, industryAreaSection);
}
