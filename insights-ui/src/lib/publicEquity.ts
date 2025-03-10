// lib/publicEquity.ts
import { CriteriaLookupItem, CriteriaLookupList, IndustryGroupCriteriaDefinition, OutputType } from '@/types/public-equity/criteria-types';
import { PerformanceChecklistItem, TickerReport } from '@/types/public-equity/ticker-report-types';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import fetch from 'node-fetch'; // or use the native fetch if available in your Node version
import { Readable } from 'stream';

//#region === TYPES ===

//#endregion

//#region === AWS S3 UTILS ===

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const REGION = process.env.AWS_DEFAULT_REGION || 'us-east-1';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export async function uploadToS3(content: string, fullKey: string, contentType: string = 'text/plain'): Promise<string> {
  console.log(`Uploading to S3 at https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey} with content type ${contentType}`);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullKey,
      Body: content,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey}`;
}

export async function uploadToS3PublicEquities(content: string, s3Key: string, contentType: string = 'text/plain'): Promise<string> {
  const fullKey = `public-equities/US/${s3Key}`;
  console.log(`Uploading to S3 at https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey} with content type ${contentType}`);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullKey,
      Body: content,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey}`;
}

export async function getObjectFromS3(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });
  const response = await s3Client.send(command);
  return await streamToString(response.Body as Readable);
}

export async function getObjectFromS3Optional(s3Key: string): Promise<string | null> {
  try {
    return await getObjectFromS3(s3Key);
  } catch (err: any) {
    if (err.name === 'NoSuchKey') return null;
    throw err;
  }
}

export function getCriteriaFileKey(sectorName: string, industryGroupName: string): string {
  return `public-equities/US/gics/${slugify(sectorName)}/${slugify(industryGroupName)}/custom-criteria.json`;
}

export function getTickerFileKey(ticker: string): string {
  return `public-equities/US/tickers/${ticker}/latest-10q-report.json`;
}

export function getCriterionReportKey(ticker: string, criterionKey: string, reportKey: string, reportType: OutputType): string {
  if (reportType === 'Text') {
    return `public-equities/US/tickers/${ticker}/criterion-reports/${criterionKey}/${reportKey}.md`;
  } else {
    return `public-equities/US/tickers/${ticker}/criterion-reports/${criterionKey}/${reportKey}.json`;
  }
}

export function getCriterionPerformanceChecklistKey(ticker: string, criterionKey: string): string {
  return `public-equities/US/tickers/${ticker}/criterion-reports/${criterionKey}/performance_checklist.json`;
}

// --- AI & Criteria Lookup functions ---

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

// --- Ticker Report Functions ---

export async function initializeNewTickerReport(ticker: string, sectorId: number, industryGroupId: number): Promise<string> {
  const customCriteriaList = await getCriteriaLookupList();
  const matching = getMatchingCriteriaLookupItem(customCriteriaList, sectorId, industryGroupId);
  const report: TickerReport = {
    ticker,
    selectedSector: { id: matching.sectorId, name: matching.sectorName },
    selectedIndustryGroup: { id: matching.industryGroupId, name: matching.industryGroupName },
    evaluationsOfLatest10Q: undefined,
    criteriaMatchesOfLatest10Q: undefined,
  };
  const tickerFileKey = getTickerFileKey(ticker);
  return await uploadToS3(JSON.stringify(report, null, 2), tickerFileKey, 'application/json');
}

export async function getTickerReport(ticker: string): Promise<TickerReport> {
  const tickerFileKey = getTickerFileKey(ticker);
  const tickerJson = await getObjectFromS3(tickerFileKey);
  return JSON.parse(tickerJson) as TickerReport;
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

export async function saveCriteriaEvaluation(ticker: string, criterionKey: string, reportKey: string, data: any): Promise<string> {
  const report = await getTickerReport(ticker);
  const reportDefinition = await getCriteriaReportDefinition(report.selectedSector.id, report.selectedIndustryGroup.id, criterionKey, reportKey);
  const criterionReportKey = getCriterionReportKey(ticker, criterionKey, reportKey, reportDefinition.outputType);
  let dataToUpload: string;
  if (reportDefinition.outputType !== 'Text' && typeof data !== 'string') {
    dataToUpload = JSON.stringify(data);
  } else {
    dataToUpload = data;
  }
  return await uploadToS3(dataToUpload, criterionReportKey, reportDefinition.outputType === 'Text' ? 'text/plain' : 'application/json');
}

export async function savePerformanceChecklist(ticker: string, criterionKey: string, checklist: PerformanceChecklistItem[]): Promise<string> {
  const fileKey = getCriterionPerformanceChecklistKey(ticker, criterionKey);
  const checklistJson = JSON.stringify(
    checklist.map((item) => ({ ...item })),
    null,
    2
  );
  return await uploadToS3(checklistJson, fileKey, 'application/json');
}

export async function getCriteria(sectorName: string, industryGroupName: string): Promise<IndustryGroupCriteriaDefinition> {
  const key = getCriteriaFileKey(sectorName, industryGroupName);
  const dataStr = await getObjectFromS3(key);
  return JSON.parse(dataStr) as IndustryGroupCriteriaDefinition;
}

export async function triggerCriteriaMatching(ticker: string, force: boolean): Promise<string> {
  const report = await getTickerReport(ticker);
  if (!force && report.criteriaMatchesOfLatest10Q && report.criteriaMatchesOfLatest10Q.status === 'Completed') {
    return `Criteria matching already done for ${ticker}`;
  }
  report.criteriaMatchesOfLatest10Q = undefined;
  const tickerFileKey = getTickerFileKey(ticker);
  await uploadToS3(JSON.stringify(report, null, 2), tickerFileKey, 'application/json');
  const url = 'https://4mbhgkl77s4gubn7i2rdcllbru0wzyxl.lambda-url.us-east-1.on.aws/populate-criteria-matches';
  const payload = { ticker };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await response.text();
}

export const saveTickerReport = async (ticker: string, report: TickerReport): Promise<void> => {
  const tickerFileKey = getTickerFileKey(ticker);
  await uploadToS3(JSON.stringify(report, null, 2), tickerFileKey, 'application/json');
};
