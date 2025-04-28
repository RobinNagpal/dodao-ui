import { getLlmResponse } from '@/scripts/llm-utils';
import { IndustryAreaHeadings, IndustryHeading } from '@/scripts/industry-tariff-reports/tariff-types';
import { uploadFileToS3, getJsonFromS3, readFileFromS3 } from '@/scripts/report-file-utils';
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
  - The Downstream areas should come at the end, then the Midstream areas and then the Upstream areas first.
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

function getS3Key(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/${fileName}`;
}

export async function getAndWriteIndustryHeadings(industry: string) {
  const headings = await getHeadingsAndSubHeadings(industry);
  console.log(JSON.stringify(headings, null, 2));

  // Upload JSON to S3
  const jsonKey = getS3Key(industry, industryHeadingsFileName);
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(headings, null, 2)), jsonKey, 'application/json');

  // Generate and upload markdown
  const markdownContent = generateMarkdownContent(industry, headings);
  const markdownKey = getS3Key(industry, industryHeadingsFileName.replace('.json', '.md'));
  await uploadFileToS3(new TextEncoder().encode(markdownContent), markdownKey, 'text/markdown');
}

function generateMarkdownContent(industry: string, headings: IndustryAreaHeadings): string {
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

  return `# ${industry} Areas\n\n` + headings.headings.map((heading) => contentForHeadings(heading)).join('\n\n\n') + `\n\n\n`;
}

export async function readIndustryHeadingsFromFile(industry: string): Promise<IndustryAreaHeadings> {
  const key = getS3Key(industry, industryHeadingsFileName);
  return await getJsonFromS3<IndustryAreaHeadings>(key);
}

export async function writeIndustryHeadingsToMarkdownFile(industry: string, headings: IndustryAreaHeadings) {
  const markdownContent = generateMarkdownContent(industry, headings);
  const key = getS3Key(industry, industryHeadingsFileName.replace('.json', '.md'));
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}
