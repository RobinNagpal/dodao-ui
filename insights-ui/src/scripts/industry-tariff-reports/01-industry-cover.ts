import {
  getIndustryPromptContext,
  readExecutiveSummary,
  readIndustryHeadings,
  readTariffUpdates,
  writeReportCover,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { ReportCover } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';

const ReportCoverSchema = z.object({
  title: z.string().describe('Title of the cover page.'),
  reportCoverContent: z
    .string()
    .describe(
      'Cover page of the tariff report for the given industry. It should contain two paragraphs of 5-6 lines each. It should be different' +
        'from executive summary. Dont include the title in the content' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export async function getReportCoverAndSaveToFile(slug: string): Promise<void> {
  const ctx = await getIndustryPromptContext(slug);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);
  const executiveSummary = await readExecutiveSummary(slug);
  if (!executiveSummary) throw new Error(`Executive summary not found for slug "${slug}"`);
  const tariffUpdates = await readTariffUpdates(slug);
  if (!tariffUpdates) throw new Error(`Tariff updates not found for slug "${slug}"`);

  const prompt = `Write a report cover page for the ${ctx.industryName} industry. The cover page should be 2 paragraphs paragraphs long
  each paragraph should be 5-6 lines long. I am passing you the executive summary, the industry areas, the tariff updates,
  the summaries of the tariff updates on the industry areas.

  Create a cover page which is different from the executive summary and conclusions.

  Dont include the title in the reportCoverContent.

   ${outputInstructions}


   # Industry Areas
   ${JSON.stringify(headings, null, 2)}

    # Executive Summary
    ${JSON.stringify(executiveSummary, null, 2)}

    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
  `;
  const reportCover = await getLlmResponse<ReportCover>(prompt, ReportCoverSchema);
  await writeReportCover(slug, reportCover);
}
