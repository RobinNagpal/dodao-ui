import {
  getIndustryPromptContext,
  readIndustryHeadings,
  readTariffUpdates,
  writeExecutiveSummary,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { ExecutiveSummary } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';

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

export async function getExecutiveSummaryAndSaveToFile(slug: string): Promise<void> {
  const ctx = await getIndustryPromptContext(slug);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);
  const tariffUpdates = await readTariffUpdates(slug);
  if (!tariffUpdates) throw new Error(`Tariff updates not found for slug "${slug}"`);

  const prompt = `Write an executive summary section for the ${
    ctx.industryName
  } industry. The summary should be 4-6 paragraphs long and should follow the following rules:
  1. The summary should be concise and to the point, avoiding unnecessary details or jargon.
  2. This is the introduction, so there should be no conclusion as this is the first sections of the report.
  3. The summary section should be specific to the ${ctx.industryName} industry but mentions that
     - In this full report, we will discuss the latest tariff updates and their impact on the ${ctx.industryName} industry.
     - The report assumes that the reader is not familiar with the ${ctx.industryName} industry hence we first start with the introduction of the industry.
     - We then try to understand the industry in detail by dividing the industry into few areas.
     - For each of these areas, we learn what exactly is the area, what the established companies, what are the new companies
     and what are the latest tariff updates, and how these updates impact the given area.
     - For each of these areas we also create a final summary.
  4. Dont use Katex or Latex or italics formatting in the response.

   Executive summary should include the following fields:
    - Title
    - Executive summary a string which is the summary of the report.

   ${outputInstructions}

   # Industry Areas
   ${JSON.stringify(headings, null, 2)}

    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
  `;

  const executiveSummary = await getLlmResponse<ExecutiveSummary>(prompt, ExecutiveSummarySchema);
  await writeExecutiveSummary(slug, executiveSummary);
}
