import {
  GenerateIndustryHeadingsRequest,
  getAndWriteIndustryHeadings,
  IndustryAreaHeadings,
  readIndustryHeadingsFromFile,
  writeIndustryHeadingsToMarkdownFile,
} from '@/scripts/startup-landscape/00-industry-main-headings';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Types of report sections supported by this script.
 */
export enum ReportType {
  HEADINGS = 'HEADINGS',
  INTRODUCTION = 'INTRODUCTION',
  UNDERSTAND_INDUSTRY = 'UNDERSTAND_INDUSTRY',
  INDUSTRY_AREA_SECTION = 'INDUSTRY_AREA_SECTION',
  EVALUATE_INDUSTRY_AREA = 'EVALUATE_INDUSTRY_AREA',
  STARTUP_DETAILS = 'STARTUP_DETAILS',
}

export async function doIt(reportType: ReportType, startupIndustry: GenerateIndustryHeadingsRequest, date: string) {
  // Pre-read common dependencies

  switch (reportType) {
    case ReportType.HEADINGS:
      await getAndWriteIndustryHeadings(startupIndustry);
      const headings = await readIndustryHeadingsFromFile(startupIndustry.industryName);
      writeIndustryHeadingsToMarkdownFile(startupIndustry.industryName, headings);
      break;
  }
}

// Example usage:

const startupIndustry: GenerateIndustryHeadingsRequest = {
  industryName: 'Financial Reporting and Insights',
  whatToMatch:
    'A startup that provides financial insights, or investment insights to investors or investment companies. ' +
    'Should be purely towards financial/investment insights.' +
    'or Shares insights about bonds. ' +
    'or Shares insights about REITs. ' +
    'or Shares insights about Alternative Investments. ',
  whatNotToMatch:
    'It should not be any accounting or generic reporting or reporting or engineering solutions. ' +
    'It should also not have any real time data api of stocks or cryptos. ' +
    'It should not include any Financial Planning & Budgeting, Tax, Data Integration & Infrastructure, ETL & Data Warehousing,  Data Feeds type tools or startups . ' +
    'It should not be a Portfolio Reporting Tool. ' +
    'It should not be related to hosting managing quantitative data or data warehousing. ',
};

doIt(ReportType.HEADINGS, startupIndustry, 'April 28, 2025').catch(console.error);
// doIt(ReportType.ALL, 'Plastic', 'April 21, 2025').catch(console.error);
