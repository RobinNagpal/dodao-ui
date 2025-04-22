import { IndustryAreaHeadings } from '@/scripts/industry-tariff-reports/industry-main-headings';
import { TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/industry-tarrifs';
import { getLlmResponse } from '@/scripts/industry-tariff-reports/llm-utils';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';

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

export interface ExecutiveSummary {
  title: string;
  executiveSummary: string;
}

function getExecutiveSummaryPrompt(
  industry: string,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[]
): string {
  return `Write an executive summary section for the ${industry} industry. The summary should be 4-6 paragraphs long and should follow the following rules: 
  1. The summary should be concise and to the point, avoiding unnecessary details or jargon. 
  2. This is the introduction, so there should be no conclusion as this is the first sections of the report.
  3. The summary section should be specific to the ${industry} industry but mentions that
     - In this full report, we will discuss the latest tariff updates and their impact on the ${industry} industry.
     - The report assumes that the reader is not familiar with the ${industry} industry hence we first start with the 
        introduction of the industry.
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

   # Industry Areas
   ${JSON.stringify(headings, null, 2)}
   
    # Tariff Updates
    ${JSON.stringify(tariffUpdates, null, 2)}
    
    # Final Summaries
    ${JSON.stringify(tariffSummaries, null, 2)}
  `;
}

async function getExecutiveSummary(
  industry: string,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[]
): Promise<ExecutiveSummary> {
  const prompt = getExecutiveSummaryPrompt(industry, headings, tariffUpdates, tariffSummaries);
  const response = await getLlmResponse<ExecutiveSummary>(prompt, ExecutiveSummarySchema);

  return response;
}

function getExecutiveSummaryJsonFileName(industry: string) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), '01-executive-summary');
  const fileName = path.join(dirPath, 'executive-summary.json');
  addDirectoryIfNotPresent(dirPath);
  return fileName;
}

export async function getExecutiveSummaryAndSaveToFile(
  industry: string,
  headings: IndustryAreaHeadings,
  tariffUpdates: TariffUpdatesForIndustry,
  tariffSummaries: string[]
) {
  const executiveSummary = await getExecutiveSummary(industry, headings, tariffUpdates, tariffSummaries);
  const fileName = getExecutiveSummaryJsonFileName(industry);
  fs.writeFileSync(fileName, JSON.stringify(executiveSummary, null, 2));
}

export async function readExecutiveSummaryFromFile(industry: string) {
  const fileName = getExecutiveSummaryJsonFileName(industry);
  const data = fs.readFileSync(fileName, 'utf-8');
  return JSON.parse(data) as ExecutiveSummary;
}

export function writeExecutiveSummaryToMarkdownFile(industry: string, executiveSummary: ExecutiveSummary) {
  const filePath = getExecutiveSummaryJsonFileName(industry).replace('.json', '.md');

  const markdownContent = `# Executive Summary\n\n` + `${executiveSummary.executiveSummary}\n`;

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
