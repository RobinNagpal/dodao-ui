import { getGicsNames } from '@/lib/gicsHelper';
import { getCriteriaFileKey, getObjectFromS3, uploadToS3PublicEquities } from '@/lib/koalagainsS3Utils';
import { CriteriaLookupItem, CriteriaLookupList, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { slugify } from '@dodao/web-core/utils/auth/slugify';

export async function getIndustryGroupCriteria(criteriaLookup: CriteriaLookupItem): Promise<IndustryGroupCriteriaDefinition> {
  // In a real implementation you might call an AI service.
  // For now, we simulate by returning a dummy structure.
  return {
    tickers: [],
    selectedSector: { id: criteriaLookup.sectorId, name: criteriaLookup.sectorName },
    selectedIndustryGroup: { id: criteriaLookup.industryGroupId, name: criteriaLookup.industryGroupName },
    criteria: [],
  };
}

export async function getCriteriaLookupList(): Promise<CriteriaLookupList> {
  const key = 'public-equities/US/gics/custom-criterias.json';
  const jsonStr = await getObjectFromS3(key);
  return JSON.parse(jsonStr) as CriteriaLookupList;
}

export async function getAiCriteria(criteriaLookup: CriteriaLookupItem): Promise<IndustryGroupCriteriaDefinition> {
  const s3Key = `gics/${getS3BasePathForCriteriaLookup(criteriaLookup)}/ai-criteria.json`;
  const jsonStr = await getObjectFromS3(`public-equities/US/${s3Key}`);
  return JSON.parse(jsonStr) as IndustryGroupCriteriaDefinition;
}

export function getMatchingCriteriaLookupItem(customCriteriaList: CriteriaLookupList, sectorId: number, industryGroupId: number): CriteriaLookupItem {
  const matching = customCriteriaList.criteria.find((x) => x.sectorId === sectorId && x.industryGroupId === industryGroupId);
  if (!matching) throw new Error('Matching criteria lookup not found.');
  return matching;
}

export async function generateAiCriteria(criteriaLookup: CriteriaLookupItem): Promise<IndustryGroupCriteriaDefinition> {
  return await getIndustryGroupCriteria(criteriaLookup);
}

export async function uploadAiCriteriaToS3(criteriaLookup: CriteriaLookupItem, finalData: IndustryGroupCriteriaDefinition): Promise<string> {
  const s3Key = `gics/${getS3BasePathForCriteriaLookup(criteriaLookup)}/ai-criteria.json`;
  const url = await uploadToS3PublicEquities(JSON.stringify(finalData, null, 2), s3Key, 'application/json');
  return url;
}

export async function uploadCustomCriteriaToS3(criteriaLookup: CriteriaLookupItem, finalData: IndustryGroupCriteriaDefinition): Promise<string> {
  const s3Key = `gics/${getS3BasePathForCriteriaLookup(criteriaLookup)}/custom-criteria.json`;
  const url = await uploadToS3PublicEquities(JSON.stringify(finalData, null, 2), s3Key, 'application/json');
  return url;
}

export async function updateCriteriaLookupList(criteriaLookupItem: CriteriaLookupItem, aiCriteriaUrl: string): Promise<void> {
  const customCriteriaList = await getCriteriaLookupList();
  const matching = getMatchingCriteriaLookupItem(customCriteriaList, criteriaLookupItem.sectorId, criteriaLookupItem.industryGroupId);
  matching.aiCriteriaFileUrl = aiCriteriaUrl;
  await uploadToS3PublicEquities(JSON.stringify(customCriteriaList, null, 2), 'gics/custom-criterias.json', 'application/json');
}

export async function updateCriteriaLookupListForCustomCriteria(criteriaLookupItem: CriteriaLookupItem, customCriteriaUrl: string): Promise<void> {
  const customCriteriaList = await getCriteriaLookupList();
  const matching = getMatchingCriteriaLookupItem(customCriteriaList, criteriaLookupItem.sectorId, criteriaLookupItem.industryGroupId);
  matching.customCriteriaFileUrl = customCriteriaUrl;
  await uploadToS3PublicEquities(JSON.stringify(customCriteriaList, null, 2), 'gics/custom-criterias.json', 'application/json');
}

export function getS3BasePathForCriteriaLookup(criteriaLookup: CriteriaLookupItem): string {
  return `${slugify(criteriaLookup.sectorName)}/${slugify(criteriaLookup.industryGroupName)}`;
}

export async function getCriteriaReportDefinition(sectorId: number, industryGroupId: number, criteriaKey: string, reportKey: string) {
  const criteriaLookupList = await getCriteriaLookupList();
  const matching = getMatchingCriteriaLookupItem(criteriaLookupList, sectorId, industryGroupId);
  if (!matching.customCriteriaFileUrl) {
    throw new Error(`Custom criteria file not found for sector ${sectorId} and industry group ${industryGroupId}`);
  }
  const response = await fetch(matching.customCriteriaFileUrl);
  const jsonResponse = await response.json();
  const industryGroupCriteria = jsonResponse as IndustryGroupCriteriaDefinition;
  const criterion = industryGroupCriteria.criteria.find((c) => c.key === criteriaKey);
  if (!criterion) {
    throw new Error(`Criterion with key ${criteriaKey} not found.`);
  }
  const reportDefinition = criterion.reports.find((r) => r.key === reportKey);
  if (!reportDefinition) {
    throw new Error(`Report with key ${reportKey} not found for criteria ${criteriaKey}`);
  }
  return reportDefinition;
}

export async function getCriteria(sectorName: string, industryGroupName: string): Promise<IndustryGroupCriteriaDefinition> {
  const key = getCriteriaFileKey(sectorName, industryGroupName);
  const dataStr = await getObjectFromS3(key);
  return JSON.parse(dataStr) as IndustryGroupCriteriaDefinition;
}

export async function getCriteriaByIds(sectorId: number, industryGroupId: number): Promise<IndustryGroupCriteriaDefinition> {
  const { sectorName, industryGroupName } = getGicsNames(sectorId, industryGroupId);
  const key = getCriteriaFileKey(sectorName, industryGroupName);
  const response = await fetch(`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/${key}`);
  return (await response.json()) as IndustryGroupCriteriaDefinition;
}
