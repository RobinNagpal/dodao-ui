import { getHeadingsAndSubHeadings, IndustryHeadings } from '@/scripts/industry-reports/industry-main-headings';
import { getAndWriteIntroductionsJson, readIntroductionJsonFromFile, writeIntroductionToMarkdownFile } from '@/scripts/industry-reports/introduction';
import { addDirectoryIfNotPresent, industryHeadingsFileName, reportsOutDir } from '@/scripts/reportFileUtils';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';

dotenv.config();

async function getAndWriteIndustryHeadings(industry: string) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase());
  const filePath = path.join(dirPath, industryHeadingsFileName);
  addDirectoryIfNotPresent(dirPath);

  const headings = await getHeadingsAndSubHeadings(industry);
  console.log(JSON.stringify(headings, null, 2));
  fs.writeFileSync(filePath, JSON.stringify(headings, null, 2), {
    encoding: 'utf-8',
  });
}

async function readIndustryHeadings(industry: string): Promise<IndustryHeadings> {
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

async function doIt() {
  const industry = 'Plastic';
  // await getAndWriteIndustryHeadings(industry);
  const headings = await readIndustryHeadings(industry);
  const date = 'April 20, 2025';
  await getAndWriteIntroductionsJson(industry, date, headings);
  const introductions = await readIntroductionJsonFromFile(industry);
  writeIntroductionToMarkdownFile(industry, introductions);
}

doIt().catch((err) => {
  console.error(err);
});
