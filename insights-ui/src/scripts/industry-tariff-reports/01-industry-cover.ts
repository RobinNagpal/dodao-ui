import {
  formatChapterLabel,
  getChapterPromptContext,
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
      'Cover page of the tariff report for the given HTS chapter. It should contain two paragraphs of 5-6 lines each. It should be different' +
        'from executive summary. Dont include the title in the content' +
        'Be very specific. ' +
        'Include hyperlinks in the content where ever possible. ' +
        'Share the latest sate as of the date passed'
    ),
});

export async function getReportCoverAndSaveToFile(slug: string): Promise<void> {
  const ctx = await getChapterPromptContext(slug);
  const chapterLabel = formatChapterLabel(ctx);
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);
  const executiveSummary = await readExecutiveSummary(slug);
  if (!executiveSummary) throw new Error(`Executive summary not found for slug "${slug}"`);
  const tariffUpdates = await readTariffUpdates(slug);
  if (!tariffUpdates) throw new Error(`Tariff updates not found for slug "${slug}"`);

  const prompt = `Write a report cover page for the tariff analysis of ${chapterLabel}. The cover page should be 2 paragraphs long,
  each paragraph 5-6 lines. I am passing you the executive summary, the chapter areas, and the tariff updates so you can frame the cover
  in the context of this chapter.

  Create a cover page which is different from the executive summary and conclusions.

  Dont include the title in the reportCoverContent.

   ${outputInstructions}


   # Chapter Areas
   ${JSON.stringify(headings, null, 2)}

    # Executive Summary
    ${JSON.stringify(executiveSummary, null, 2)}

    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
  `;
  const reportCover = await getLlmResponse<ReportCover>(prompt, ReportCoverSchema);
  await writeReportCover(slug, reportCover);
}
