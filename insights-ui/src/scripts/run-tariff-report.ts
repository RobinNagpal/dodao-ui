import { getAndWriteIndustryHeadings } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { getReportCoverAndSaveToFile } from '@/scripts/industry-tariff-reports/01-industry-cover';
import { getExecutiveSummaryAndSaveToFile } from '@/scripts/industry-tariff-reports/02-executive-summary';
import { getTariffUpdatesForIndustryAndSaveToFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { getAndWriteUnderstandIndustryJson } from '@/scripts/industry-tariff-reports/04-understand-industry';
import { getAndWriteIndustryAreaSectionToJsonFile } from '@/scripts/industry-tariff-reports/05-industry-areas';
import { getFinalConclusionAndSaveToFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';
import { generateAndSaveAllSeoDetails } from '@/scripts/industry-tariff-reports/08-report-seo-info';
import { readIndustryHeadings } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
import { getTodayDateAsMonthDDYYYYFormat } from '@/util/get-date';
import * as dotenv from 'dotenv';

dotenv.config();

export async function doIt(reportType: ReportType, slug: string) {
  const date = getTodayDateAsMonthDDYYYYFormat();

  // Ensure headings exist before proceeding
  let headings = await readIndustryHeadings(slug);
  if (headings) {
    console.log(`Headings for ${slug} already exist, skipping generation.`);
  } else {
    await getAndWriteIndustryHeadings(slug);
    headings = await readIndustryHeadings(slug);
    if (!headings) {
      throw new Error(`Failed to generate or read industry headings for slug "${slug}"`);
    }
  }

  switch (reportType) {
    case ReportType.HEADINGS:
      break;

    case ReportType.UNDERSTAND_INDUSTRY:
      await getAndWriteUnderstandIndustryJson(slug);
      break;

    case ReportType.TARIFF_UPDATES:
      await getTariffUpdatesForIndustryAndSaveToFile(slug, date);
      break;

    case ReportType.INDUSTRY_AREA_SECTION:
      await getAndWriteIndustryAreaSectionToJsonFile(slug);
      break;

    case ReportType.EXECUTIVE_SUMMARY:
      await getExecutiveSummaryAndSaveToFile(slug);
      break;

    case ReportType.REPORT_COVER:
      await getReportCoverAndSaveToFile(slug);
      break;

    case ReportType.FINAL_CONCLUSION:
      await getFinalConclusionAndSaveToFile(slug);
      break;

    case ReportType.ALL:
    default:
      for (const type of Object.values(ReportType)) {
        if (type === ReportType.ALL) continue;
        await doIt(type as ReportType, slug);
      }
      // SEO details are generated last so they can summarize every section that
      // was just written. The browser-driven `generate-all` flow does the same
      // step at the end via the `generate-seo-info` API.
      await generateAndSaveAllSeoDetails(slug);
      break;
  }
}

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: ts-node src/scripts/run-tariff-report.ts <chapter-slug>');
  process.exit(1);
}

doIt(ReportType.ALL, slug)
  .then(() => {
    console.log('Tariff updates generated successfully.');
  })
  .catch(console.error);
