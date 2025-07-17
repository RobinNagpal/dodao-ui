import { writeJsonAndMarkdownFilesForReportCover } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { ExecutiveSummary, IndustryAreasWrapper, ReportCover, TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
// import { getLlmResponse, outputInstructions } from '@/scripts/llm-utils';
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

async function getReportCover(
  industry: string,
  headings: IndustryAreasWrapper,
  executiveSummary: ExecutiveSummary,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[]
): Promise<ReportCover> {
  const prompt = `Write a report cover page for the ${industry} industry. The cover page should be 2 paragraphs paragraphs long 
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
    
    # Summaries of tariff updates
    ${JSON.stringify(tariffSummaries, null, 2)}
  `;
  const response = await getLlmResponse<ReportCover>(prompt, ReportCoverSchema);

  return response;
}

export async function getReportCoverAndSaveToFile(
  industryId: string,
  headings: IndustryAreasWrapper,
  executiveSummary: ExecutiveSummary,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[]
) {
  const reportCover = await getReportCover(industryId, headings, executiveSummary, tariffUpdates, tariffSummaries);
  await writeJsonAndMarkdownFilesForReportCover(industryId, reportCover);
}
