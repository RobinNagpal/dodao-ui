import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { readExecutiveSummaryFromFile } from '@/scripts/industry-tariff-reports/01-executive-summary';
import { readIntroductionJsonFromFile } from '@/scripts/industry-tariff-reports/02-introduction';
import { readTariffUpdatesFromFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { readUnderstandIndustryJsonFromFile } from '@/scripts/industry-tariff-reports/04-understand-industry';
import { readIndustryAreaSectionFromFile } from '@/scripts/industry-tariff-reports/05-industry-areas';
import { readFinalConclusionFromFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';

export function getIndustryTariffReport(industry: string): IndustryTariffReport {
  const introduction = readIntroductionJsonFromFile(industry);
  const executiveSummary = readExecutiveSummaryFromFile(industry);
  const understandIndustry = readUnderstandIndustryJsonFromFile(industry);
  const finalConclusion = readFinalConclusionFromFile(industry);
  const industryAreaHeadings = readIndustryHeadingsFromFile(industry);
  const industryAreas = readIndustryAreaSectionFromFile(industry);
  const tariffUpdates = readTariffUpdatesFromFile(industry);

  return {
    evaluateIndustryAreas: [],
    executiveSummary,
    finalConclusion,
    industryAreaHeadings,
    industryAreas,
    tariffUpdates,
    understandIndustry,
    introduction,
  };
}
