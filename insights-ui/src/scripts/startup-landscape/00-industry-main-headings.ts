import { getLlmResponse } from '@/scripts/llm‑utils‑gemini';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { z, ZodObject } from 'zod';
import { addDirectoryIfNotPresent, reportsOutDir } from '@/scripts/report-file-utils';
import fs from 'fs';
import path from 'path';

export const industryHeadingsFileName = 'industry-headings.json';

export const StartupSchema = z.object({
  name: z.string().describe('Name of the startup.'),
  summary: z.string().describe('2-3 line summary of the startup.'),
});

export const IndustrySubHeadingSchema = z.object({
  title: z.string().describe('Subheading title'),
  summary: z.string().describe('3-4 line summary of the subheading.'),
  startups: z.array(StartupSchema).describe('3 startups under the subheading.'),
});

export const IndustryHeadingSchema = z.object({
  title: z.string().describe('Title of the one of the main headings.'),
  summary: z.string().describe('5-6 line summary of the heading.'),
  subHeadings: z.array(IndustrySubHeadingSchema).describe('Array of subheadings under the main heading.'),
});

export const IndustryHeadingsSchema: ZodObject<any> = z.object({
  headings: z.array(IndustryHeadingSchema).describe('Array of main headings.'),
});

interface Startup {
  name: string;
  summary: string;
}

export interface IndustrySubHeading {
  title: string;
  summary: string;
  startups: Startup[];
}

export interface IndustryHeading {
  title: string;
  summary: string;
  subHeadings: IndustrySubHeading[];
}

export interface IndustryAreaHeadings {
  headings: IndustryHeading[];
}

function getMainIndustryPrompt(startupIndustry: GenerateIndustryHeadingsRequest) {
  const prompt: string = `
  As an startup builder I want to learn everything about ${startupIndustry.industryName}
  The Startup Industry Areas should Match
  # What to Match
  ${startupIndustry.whatToMatch}
  
  # What Not to Match
  ${startupIndustry.whatNotToMatch}
  
  Give me the information based on the following rules:
  - I want to divide the industry into four main  areas, with three sub areas under each of them.
  - The Downstream areas should come first, then the Midstream areas and then the Upstream areas.
  - I want to make sure the whole industry is covered and there is no overlap between the areas.
  - Tell me the top 4 areas and 3 subareas under each that I should know.
  - There should be almost no overlap between the headings and subheadings, or subheadings of different headings.
  
  Tell me the the top 4 topics and 3 subtopics under each that I should know. 
  
  Also under each subheading give me the name and summary of three startups that belongs under it.
  `;

  return prompt;
}

export async function getHeadingsAndSubHeadings(startupIndustry: GenerateIndustryHeadingsRequest) {
  return await getLlmResponse<IndustryAreaHeadings>(getMainIndustryPrompt(startupIndustry), IndustryHeadingsSchema);
}

export function getJsonFilePath(industry: string): string {
  const dirPath = path.join(reportsOutDir, slugify(industry));
  const filePath = path.join(dirPath, industryHeadingsFileName);
  addDirectoryIfNotPresent(dirPath);
  return filePath;
}
export interface GenerateIndustryHeadingsRequest {
  industryName: string;
  whatToMatch: string;
  whatNotToMatch: string;
}

export async function getAndWriteIndustryHeadings(startupIndustry: GenerateIndustryHeadingsRequest) {
  const filePath = getJsonFilePath(startupIndustry.industryName);
  const headings = await getHeadingsAndSubHeadings(startupIndustry);
  console.log(JSON.stringify(headings, null, 2));
  fs.writeFileSync(filePath, JSON.stringify(headings, null, 2), {
    encoding: 'utf-8',
  });
}

export async function readIndustryHeadingsFromFile(industry: string): Promise<IndustryAreaHeadings> {
  const filePath = getJsonFilePath(industry);
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
  const filePath = getJsonFilePath(industry).replace('.json', '.md');

  const contentForHeadings = (heading: IndustryHeading) => {
    return (
      `## ${heading.title}\n${heading.summary}\n\n` +
      `${heading.subHeadings
        .map(
          (subHeading) =>
            `### ${subHeading.title}\n${subHeading.summary}\n\n${subHeading.startups.map((company) => `${company.name} (${company.summary})`).join(', ')}`
        )
        .join('\n\n')}`
    );
  };

  const markdownContent = `# ${industry} Areas\n\n` + headings.headings.map((heading) => contentForHeadings(heading)).join('\n\n\n') + `\n\n\n`;

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
