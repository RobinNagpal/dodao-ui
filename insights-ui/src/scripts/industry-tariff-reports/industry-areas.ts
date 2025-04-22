import { IndustryAreaHeadings } from '@/scripts/industry-tariff-reports/industry-main-headings';
import { getLlmResponse } from '@/scripts/industry-tariff-reports/llm-utils';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';

const IndustryAreaSectionSchema = z.object({
  title: z.string().describe('Title of the section which discusses various industry areas.'),
  industryAreas: z
    .string()
    .describe(
      '5-6 paragraphs that explain how the given areas divide in the industry into various sub-areas which cover ' +
        'the most important aspects of the industry'
    ),
});

interface IndustryAreaSection {
  title: string;
  industryAreas: string;
}

function getIndustryAreaPrompt(industry: string, headings: IndustryAreaHeadings) {
  const prompt = `
  I want to explain to the investors how following headings and subheadings divide the ${industry} industry into nice 
  areas so that they cover the whole of the industry. In some of the next sections I will be discussing each of these
  sub-headings in detail, but in this section I want to explain how these sub-headings are related to each other and 
  how they divide the industry into various areas.
  
  Follow the below instructions:
  - Add 5-6 paragraphs that explain how the given areas divide in the industry into various sub-areas which cover

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

function getIndustryAreaJsonFilePath(industry: string): string {
  const fileName = `industry-area.json`;
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), '05-industry-areas');
  addDirectoryIfNotPresent(dirPath);
  const jsonFilePath = path.join(dirPath, fileName);
  return jsonFilePath;
}

export async function getAndWriteIndustryAreaSectionToJsonFile(industry: string, headings: IndustryAreaHeadings): Promise<void> {
  const industryAreaSection = await getIndustryAreaSection(industry, headings);
  const filePath = getIndustryAreaJsonFilePath(industry);
  fs.writeFileSync(filePath, JSON.stringify(industryAreaSection, null, 2));
}

export async function readIndustryAreaSectionFromFile(industry: string): Promise<IndustryAreaSection> {
  const filePath = getIndustryAreaJsonFilePath(industry);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as IndustryAreaSection;
}

export async function writeIndustryAreaSectionToMarkdownFile(industry: string, industryAreaSection: IndustryAreaSection): Promise<void> {
  const filePath = getIndustryAreaJsonFilePath(industry).replace('.json', '.md');
  const markdownContent = `# ${industryAreaSection.title}\n\n${industryAreaSection.industryAreas}`;
  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
