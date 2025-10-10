import { writeJsonFileForExecutiveSummary } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { ExecutiveSummary, IndustryAreasWrapper, TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { GeminiModelType } from '@/types/llmConstants';

const ExecutiveSummarySchema = z.object({
  title: z.string().describe('Title of the section which discusses specific industry.'),
  executiveSummary: z
    .string()
    .describe(
      'Executive summary of the report. Make sure there are no redundant information. ' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

function getExecutiveSummaryPrompt(
  industry: TariffIndustryId,
  headings: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[]
): string {
  const definition = getTariffIndustryDefinitionById(industry);
  return `Write an executive summary section for the ${
    definition.name
  } industry. The summary should be 4-6 paragraphs long and should follow the following rules: 
  1. The summary should be concise and to the point, avoiding unnecessary details or jargon. 
  2. This is the introduction, so there should be no conclusion as this is the first sections of the report.
  3. The summary section should be specific to the ${definition.name} industry but mentions that
     - In this full report, we will discuss the latest tariff updates and their impact on the ${definition.name} industry.
     - The report assumes that the reader is not familiar with the ${definition.name} industry hence we first start with the introduction of the industry.
     - We then try to understand the industry in detail by dividing the industry into few areas.
     - For each of these areas, we learn what exactly is the area, what the established companies, what are the new companies
     and what are the latest tariff updates, and how these updates impact the given area.
     - For each of these areas we also create a final summary.
     - I will provide you the final summaries so that you know what will be discussed, but don't take any insights from them
     in this sections, as this is the executive summary(introduction) section.
  4. Dont use Katex or Latex or italics formatting in the response.

   Executive summary should include the following fields:
    - Title
    - Executive summary a string which is the summary of the report.

   ${outputInstructions}
   
   # Industry Areas
   ${JSON.stringify(headings, null, 2)}
   
    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
    
    # Final Summaries
    ${JSON.stringify(tariffSummaries, null, 2)}
  `;
}

async function getExecutiveSummary(
  industry: TariffIndustryId,
  headings: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[]
): Promise<ExecutiveSummary> {
  const prompt = getExecutiveSummaryPrompt(industry, headings, tariffUpdates, tariffSummaries);
  const response = await getLlmResponse<ExecutiveSummary>(prompt, ExecutiveSummarySchema, GeminiModelType.GEMINI_2_5_PRO);

  return response;
}

export async function getExecutiveSummaryAndSaveToFile(
  industryId: TariffIndustryId,
  headings: IndustryAreasWrapper,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[]
) {
  const executiveSummary = await getExecutiveSummary(industryId, headings, tariffUpdates, tariffSummaries);
  await writeJsonFileForExecutiveSummary(industryId, executiveSummary);
}
