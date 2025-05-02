import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { writeJsonAndMarkdownFilesForIndustryAreas } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryAreasWrapper } from '@/scripts/industry-tariff-reports/tariff-types';
import { getLlmResponse } from '@/scripts/llm-utils';
import { z, ZodObject } from 'zod';

export const industryHeadingsFileName = 'industry-headings.json';

export const PublicCompanySchema = z.object({
  name: z.string().describe('Name of the public company.'),
  ticker: z.string().describe('Ticker symbol of the public company.'),
});

export const IndustrySubHeadingSchema = z.object({
  title: z.string().describe('Subheading title'),
  oneLineSummary: z.string().describe('One line summary of the subheading.'),
  companies: z.array(PublicCompanySchema).describe('This is the id of the html element to which the hyperlink points'),
});

export const IndustryHeadingSchema = z.object({
  title: z.string().describe('Title of the one of the main headings.'),
  oneLineSummary: z.string().describe('One line summary of the heading.'),
  subAreas: z.array(IndustrySubHeadingSchema).describe('Array of subheadings under the main heading.'),
});

export const IndustryHeadingsSchema: ZodObject<any> = z.object({
  areas: z.array(IndustryHeadingSchema).describe('Array of main headings.'),
});

function getMainIndustryPrompt(industryId: TariffIndustryId) {
  const definition = getTariffIndustryDefinitionById(industryId);
  const prompt: string = `
  As an investor I want to learn everything about ${industryId} sub-industry(GICS). 
  
  Give me the information based on the following rules:
  - I want to divide the industry into four main  areas, with three sub areas under each of them.
  - The Downstream areas should come at the end, then the Midstream areas and then the Upstream areas first.
  - I want to make sure the whole industry is covered and there is no overlap between the areas.
  - Tell me the top ${definition.headingsCount} areas and ${definition.subHeadingsCount} subareas under each that I should know.
  - There should be almost no overlap between the headings and subheadings, or subheadings of different headings.
  
  Also under each subheading give me the name and tickers of each 
  of the us public company that belongs under it.

  I dont want any thing like common industry introduction or metrics or other things to be in the headings or subheadings
  `;

  return prompt;
}

export async function getAndWriteIndustryHeadings(industryId: TariffIndustryId) {
  const headings = await getLlmResponse<IndustryAreasWrapper>(getMainIndustryPrompt(industryId), IndustryHeadingsSchema);
  console.log(JSON.stringify(headings, null, 2));

  // Upload JSON to S3
  await writeJsonAndMarkdownFilesForIndustryAreas(industryId, headings);
}
