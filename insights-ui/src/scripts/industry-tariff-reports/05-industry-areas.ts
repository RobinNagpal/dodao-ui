import { getLlmResponse } from '@/scripts/llm-utils';
import { IndustryAreaHeadings, IndustryAreaSection } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { uploadFileToS3, getJsonFromS3 } from '@/scripts/report-file-utils';

const IndustryAreaSectionSchema = z.object({
  title: z.string().describe('Title of the section which discusses various industry areas.'),
  industryAreas: z
    .string()
    .describe(
      '5-6 paragraphs that explain how the given areas divide in the industry into various sub-areas which cover ' +
        'the most important aspects of the industry'
    ),
});

function getIndustryAreaPrompt(industry: string, headings: IndustryAreaHeadings) {
  const prompt = `
  I want to explain to the investors how following headings and subheadings divide the ${industry} industry into nice 
  areas so that they cover the whole of the industry. In some of the next sections I will be discussing each of these
  sub-headings in detail, but in this section I want to explain how these sub-headings are related to each other and 
  how they divide the industry into various areas.
  
  # Follow the below instructions:
  - Add 5-6 paragraphs that explain how the given areas divide in the industry into various sub-areas which cover
  
  # For output content:
  - Cite the latest figures and embed hyperlinks to sources.
  - Include hyperlinks/citations in the content where ever possible in the markdown format.
  - Dont forget to include hyperlinks/citations in the content where ever possible.
  - Avoid LaTeX, italics, or KaTeX formatting, or   character for space
  - Use only headings and subheadings, bold, bullets, points, tables for formatting the content.
  - Use markdown format for output.
  - All amounts, dollar values, or figures should be wrapped in backticks.

  # Headings and Subheadings
  ${JSON.stringify(headings, null, 2)}
`;

  return prompt;
}

async function getIndustryAreaSection(industry: string, headings: IndustryAreaHeadings): Promise<IndustryAreaSection> {
  const prompt = getIndustryAreaPrompt(industry, headings);
  const response = await getLlmResponse<IndustryAreaSection>(prompt, IndustryAreaSectionSchema);
  return response;
}

function getS3Key(industry: string, fileName: string): string {
  return `koalagains-reports/tariff-reports/${industry.toLowerCase()}/05-industry-areas/${fileName}`;
}

export async function getAndWriteIndustryAreaSectionToJsonFile(industry: string, headings: IndustryAreaHeadings): Promise<void> {
  const industryAreaSection = await getIndustryAreaSection(industry, headings);

  // Upload JSON to S3
  const jsonKey = getS3Key(industry, 'industry-area.json');
  await uploadFileToS3(new TextEncoder().encode(JSON.stringify(industryAreaSection, null, 2)), jsonKey, 'application/json');

  // Generate and upload markdown
  const markdownContent = getMarkdownContentForIndustryAreas(industryAreaSection);
  const markdownKey = getS3Key(industry, 'industry-area.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), markdownKey, 'text/markdown');
}

export async function readIndustryAreaSectionFromFile(industry: string): Promise<IndustryAreaSection | undefined> {
  const key = getS3Key(industry, 'industry-area.json');
  return await getJsonFromS3<IndustryAreaSection>(key);
}

export function getMarkdownContentForIndustryAreas(industryAreaSection: IndustryAreaSection) {
  const markdownContent = `# ${industryAreaSection.title}\n\n${industryAreaSection.industryAreas}`;
  return markdownContent;
}

export async function writeIndustryAreaSectionToMarkdownFile(industry: string, industryAreaSection: IndustryAreaSection): Promise<void> {
  const markdownContent = getMarkdownContentForIndustryAreas(industryAreaSection);
  const key = getS3Key(industry, 'industry-area.md');
  await uploadFileToS3(new TextEncoder().encode(markdownContent), key, 'text/markdown');
}
