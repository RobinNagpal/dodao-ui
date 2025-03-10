// lib/publicEquity.ts
import { getCriteriaLookupList, getCriteriaReportDefinition, getMatchingCriteriaLookupItem } from '@/lib/industryGroupCriteria';
import { getCriterionPerformanceChecklistKey, getCriterionReportKey, getObjectFromS3, getTickerFileKey, uploadToS3 } from '@/lib/koalagainsS3Utils';
import { PerformanceChecklistItem, TickerReport } from '@/types/public-equity/ticker-report-types';
import fetch from 'node-fetch'; // or use the native fetch if available in your Node version

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
