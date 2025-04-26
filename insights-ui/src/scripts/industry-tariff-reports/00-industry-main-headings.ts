import { getLlmResponse } from '@/scripts/industry-tariff-reports/llm-utils';
import { IndustryAreaHeadings, IndustryHeading } from '@/scripts/industry-tariff-reports/tariff-types';
import { addDirectoryIfNotPresent, reportsOutDir } from '@/scripts/reportFileUtils';
import fs from 'fs';
import path from 'path';
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
  subHeadings: z.array(IndustrySubHeadingSchema).describe('Array of subheadings under the main heading.'),
});

export const IndustryHeadingsSchema: ZodObject<any> = z.object({
  headings: z.array(IndustryHeadingSchema).describe('Array of main headings.'),
});

function getMainIndustryPrompt(industry: string) {
  const prompt: string = `
  As an investor I want to learn everything about ${industry} sub-industry(GICS). 
  
  Give me the information based on the following rules:
  - I want to divide the industry into four main  areas, with three sub areas under each of them.
  - The Downstream areas should come first, then the Midstream areas and then the Upstream areas.
  - I want to make sure the whole industry is covered and there is no overlap between the areas.
  - Tell me the top 4 areas and 3 subareas under each that I should know.
  - There should be almost no overlap between the headings and subheadings, or subheadings of different headings.

  
  Also under each subheading give me the name and tickers of each 
  of the us public company that belongs under it.

  I dont want any thing like common industry introduction or metrics or other things to be in the headings or subheadings
  `;

  return prompt;
}

export async function getHeadingsAndSubHeadings(industry: string) {
  return await getLlmResponse<IndustryAreaHeadings>(getMainIndustryPrompt(industry), IndustryHeadingsSchema);
}

export async function getAndWriteIndustryHeadings(industry: string) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase());
  const filePath = path.join(dirPath, industryHeadingsFileName);
  addDirectoryIfNotPresent(dirPath);

  const headings = await getHeadingsAndSubHeadings(industry);
  console.log(JSON.stringify(headings, null, 2));
  fs.writeFileSync(filePath, JSON.stringify(headings, null, 2), {
    encoding: 'utf-8',
  });
}

export async function readIndustryHeadingsFromFile(industry: string): Promise<IndustryAreaHeadings> {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase());
  const filePath = path.join(dirPath, industryHeadingsFileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  // Read the file contents and convert to string
  const contents: string = fs.readFileSync(filePath, 'utf-8').toString();
  // Parse the JSON data
  const headings: IndustryAreaHeadings = JSON.parse(contents);
  return headings;
}

export function writeIndustryHeadingsToMarkdownFile(industry: string, headings: IndustryAreaHeadings) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase());
  const filePath = path.join(dirPath, industryHeadingsFileName.replace('.json', '.md'));
  addDirectoryIfNotPresent(dirPath);

  const contentForHeadings = (heading: IndustryHeading) => {
    return (
      `## ${heading.title}\n${heading.oneLineSummary}\n\n` +
      `${heading.subHeadings
        .map(
          (subHeading) =>
            `### ${subHeading.title}\n${subHeading.oneLineSummary}\n\n${subHeading.companies
              .map((company) => `${company.name} (${company.ticker})`)
              .join(', ')}`
        )
        .join('\n\n')}`
    );
  };

  const markdownContent = `# ${industry} Areas\n\n` + headings.headings.map((heading) => contentForHeadings(heading)).join('\n\n\n') + `\n\n\n`;

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
