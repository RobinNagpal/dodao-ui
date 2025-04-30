import { readIndustryHeadingsFromFile } from '@/scripts/industry-tariff-reports/00-industry-main-headings';
import { readExecutiveSummaryFromFile } from '@/scripts/industry-tariff-reports/01-executive-summary';
import { readIntroductionJsonFromFile } from '@/scripts/industry-tariff-reports/02-introduction';
import { readTariffUpdatesFromFile } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { readUnderstandIndustryJsonFromFile } from '@/scripts/industry-tariff-reports/04-understand-industry';
import { readIndustryAreaSectionFromFile } from '@/scripts/industry-tariff-reports/05-industry-areas';
import { readEvaluateIndustryAreaJsonFromFile } from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';
import { readFinalConclusionFromFile } from '@/scripts/industry-tariff-reports/07-final-conclusion';
import {
  EvaluateIndustryArea,
  IndustryAreasWrapper,
  IndustryTariffReport,
  NegativeTariffImpactOnCompanyType,
  PositiveTariffImpactOnCompanyType,
} from '@/scripts/industry-tariff-reports/tariff-types';

export async function getIndustryTariffReport(industry: string): Promise<IndustryTariffReport> {
  const introduction = await readIntroductionJsonFromFile(industry);
  const executiveSummary = await readExecutiveSummaryFromFile(industry);
  const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
  const finalConclusion = await readFinalConclusionFromFile(industry);
  const industryAreaHeadings = await readIndustryHeadingsFromFile(industry);
  const industryAreas = await readIndustryAreaSectionFromFile(industry);
  const tariffUpdates = await readTariffUpdatesFromFile(industry);

  const evaluateIndustryAreas: EvaluateIndustryArea[] = [];
  const headings = industryAreaHeadings?.areas;
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  for (const evaluateIndustryArea of headings) {
    for (const subHeading of evaluateIndustryArea.subAreas) {
      const evaluateIndustryAreaData = await readEvaluateIndustryAreaJsonFromFile(industry, subHeading, industryAreaHeadings);
      if (evaluateIndustryAreaData) {
        evaluateIndustryAreas.push(evaluateIndustryAreaData);
      }
    }
  }

  return {
    evaluateIndustryAreas: evaluateIndustryAreas,
    executiveSummary,
    finalConclusion,
    industryAreas: industryAreaHeadings,
    industryAreasSections: industryAreas,
    tariffUpdates,
    understandIndustry,
    introduction,
  };
}

export async function getSummariesOfEvaluatedAreas(industry: string, headings: IndustryAreasWrapper) {
  const summaries: string[] = [];

  for (const heading of headings.areas) {
    for (const subHeading of heading.subAreas) {
      const evalArea = await readEvaluateIndustryAreaJsonFromFile(industry, subHeading, headings);
      if (evalArea?.tariffImpactSummary) {
        summaries.push(evalArea.tariffImpactSummary);
      }
    }
  }
  return summaries;
}

export async function getPositiveImpactsOfEvaluatedAreas(industry: string, headings: IndustryAreasWrapper) {
  const positiveImpacts: PositiveTariffImpactOnCompanyType[] = [];

  for (const heading of headings.areas) {
    for (const subHeading of heading.subAreas) {
      const evalArea = await readEvaluateIndustryAreaJsonFromFile(industry, subHeading, headings);
      if (evalArea?.positiveTariffImpactOnCompanyType?.length) {
        positiveImpacts.push(...evalArea.positiveTariffImpactOnCompanyType);
      }
    }
  }
  return positiveImpacts;
}
export async function getNegativeImpactsOfEvaluatedAreas(industry: string, headings: IndustryAreasWrapper) {
  const negativeImpacts: NegativeTariffImpactOnCompanyType[] = [];

  for (const heading of headings.areas) {
    for (const subHeading of heading.subAreas) {
      const evalArea = await readEvaluateIndustryAreaJsonFromFile(industry, subHeading, headings);
      if (evalArea?.negativeTariffImpactOnCompanyType?.length) {
        negativeImpacts.push(...evalArea.negativeTariffImpactOnCompanyType);
      }
    }
  }
  return negativeImpacts;
}
