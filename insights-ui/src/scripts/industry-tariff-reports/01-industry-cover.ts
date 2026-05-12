import {
  chapterSeoGuidance,
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
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

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

  Title rules:
  - The "title" field should be a search-friendly H1 (50-65 characters) that includes the chapter title and a high-intent keyword
    (e.g. "${ctx.chapterTitle}: Tariff Rates, Duties & 2026 Updates"). Avoid generic phrases like "Tariff Report Cover".

  Body rules for \`reportCoverContent\`:
  - Do NOT use any markdown headings (\`#\`, \`##\`, \`###\`) — the page UI renders the title above your content.
  - Use plain paragraphs, **bold**, and bullets only. Wrap every percentage / rate / dollar amount in backticks.
  - Do not invent figures or use placeholder values like \`var\` or \`TBD\`.

   ${chapterSeoGuidance(ctx)}

   ${outputInstructions}


   # Chapter Areas
   ${JSON.stringify(headings, null, 2)}

    # Executive Summary
    ${JSON.stringify(executiveSummary, null, 2)}

    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
  `;
  const reportCover = await getLlmResponse<ReportCover>(prompt, ReportCoverSchema, LLMProvider.GEMINI_WITH_GROUNDING, GeminiModel.GEMINI_3_PRO_PREVIEW);
  await writeReportCover(slug, reportCover);
}
