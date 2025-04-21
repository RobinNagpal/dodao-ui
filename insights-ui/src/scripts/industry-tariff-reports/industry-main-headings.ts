import { getLlmResponse } from '@/scripts/industry-tariff-reports/llm-utils';
import { z, ZodObject } from 'zod';
import { addDirectoryIfNotPresent, industryHeadingsFileName, reportsOutDir } from '@/scripts/reportFileUtils';
import fs from 'fs';
import path from 'path';

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

interface PublicCompany {
  name: string;
  ticker: string;
}

export interface IndustrySubHeading {
  title: string;
  oneLineSummary: string;
  companies: PublicCompany[];
}

export interface IndustryHeading {
  title: string;
  oneLineSummary: string;
  subHeadings: IndustrySubHeading[];
}

export interface IndustryHeadings {
  headings: IndustryHeading[];
}

function getMainIndustryPrompt(industry: string) {
  const prompt: string = `
  As an investor I want to learn everything about ${industry} sub-industry(GICS). 
  Tell me the the top 4 topics and 3 subtopics under each that I should know. 
  Tell me just the headings of the topics and subtopics and one line each. 
  
  Follow the below instructions:
  - Each of the topics or subtopics should be related to the industry, and not investments. 
  - The headings and subheadings should be related to either product development processes, product development stages, 
  product types,  type of work, type of industry.  
  - We want to make sure the headings and subheadings tell everything about the industry and there can be a few public 
  companies that fall under each of the sub headings.
  - There should be almost no overlap between the headings and subheadings, or subheadings of different headings.
  
  
  Also under each subheading give me the name and tickers of each 
  of the us public company that belongs under it.

  I dont want any thing like common industry introduction or metrics or other things to be in the headings or subheadings
  `;

  return prompt;
}

export async function getHeadingsAndSubHeadings(industry: string) {
  return await getLlmResponse<IndustryHeadings>(getMainIndustryPrompt(industry), IndustryHeadingsSchema);
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

export async function readIndustryHeadingsFromFile(industry: string): Promise<IndustryHeadings> {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase());
  const filePath = path.join(dirPath, industryHeadingsFileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  // Read the file contents and convert to string
  const contents: string = fs.readFileSync(filePath, 'utf-8').toString();
  // Parse the JSON data
  const headings: IndustryHeadings = JSON.parse(contents);
  return headings;
}

export async function writeIndustryHeadingsToMarkdownFile(industry: string, headings: IndustryHeadings) {
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
