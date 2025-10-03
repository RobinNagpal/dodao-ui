import {
  readAllCountriesTariffUpdatesFromFile,
  readEvaluateSubIndustryAreaJsonFromFile,
  readExecutiveSummaryFromFile,
  readFinalConclusionFromFile,
  readIndustryAreaSectionFromFile,
  readIndustryHeadingsFromFile,
  readReportCoverFromFile,
  readSeoDetailsFromFile,
  readTariffUpdatesFromFile,
  readUnderstandIndustryJsonFromFile,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import {
  AllCountriesTariffUpdatesForIndustry,
  EvaluateIndustryArea,
  IndustryAreasWrapper,
  IndustryTariffReport,
  NegativeTariffImpactOnCompanyType,
  PositiveTariffImpactOnCompanyType,
} from '@/scripts/industry-tariff-reports/tariff-types';

export async function getIndustryTariffReport(industry: string): Promise<IndustryTariffReport> {
  const reportCover = await readReportCoverFromFile(industry);
  const executiveSummary = await readExecutiveSummaryFromFile(industry);
  const understandIndustry = await readUnderstandIndustryJsonFromFile(industry);
  const finalConclusion = await readFinalConclusionFromFile(industry);
  const industryAreaHeadings = await readIndustryHeadingsFromFile(industry);
  const industryAreas = await readIndustryAreaSectionFromFile(industry);
  const tariffUpdates = await readTariffUpdatesFromFile(industry);
  const allCountriesTariffUpdates = await readAllCountriesTariffUpdatesFromFile(industry);
  const reportSeoDetails = await readSeoDetailsFromFile(industry);

  const evaluateIndustryAreas: EvaluateIndustryArea[] = [];
  const headings = industryAreaHeadings?.areas;
  if (!headings) throw new Error(`Headings not found for industry: ${industry}`);

  for (const evaluateIndustryArea of headings) {
    for (const subHeading of evaluateIndustryArea.subAreas) {
      const evaluateIndustryAreaData = await readEvaluateSubIndustryAreaJsonFromFile(industry, subHeading, industryAreaHeadings);
      if (evaluateIndustryAreaData) {
        evaluateIndustryAreas.push(evaluateIndustryAreaData);
      }
    }
  }

  return {
    reportCover: reportCover,
    evaluateIndustryAreas: evaluateIndustryAreas,
    executiveSummary,
    finalConclusion,
    industryAreas: industryAreaHeadings,
    industryAreasSections: industryAreas,
    tariffUpdates,
    allCountriesTariffUpdates,
    understandIndustry,
    reportSeoDetails,
  };
}

export async function getSummariesOfEvaluatedAreas(industry: string, headings: IndustryAreasWrapper) {
  const summaries: string[] = [];

  for (const heading of headings.areas) {
    for (const subHeading of heading.subAreas) {
      const evalArea = await readEvaluateSubIndustryAreaJsonFromFile(industry, subHeading, headings);
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
      const evalArea = await readEvaluateSubIndustryAreaJsonFromFile(industry, subHeading, headings);
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
      const evalArea = await readEvaluateSubIndustryAreaJsonFromFile(industry, subHeading, headings);
      if (evalArea?.negativeTariffImpactOnCompanyType?.length) {
        negativeImpacts.push(...evalArea.negativeTariffImpactOnCompanyType);
      }
    }
  }
  return negativeImpacts;
}
