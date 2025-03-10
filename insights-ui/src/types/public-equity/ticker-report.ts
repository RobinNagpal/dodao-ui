export enum ProcessingStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  InProgress = 'InProgress',
}

export interface IndustryGroup {
  id: number;
  name: string;
}

export interface Sector {
  id: number;
  name: string;
}

export interface PerformanceChecklistItem {
  checklistItem: string;
  oneLinerExplanation: string;
  informationUsed: string;
  detailedExplanation: string;
  evaluationLogic: string;
  score: number;
}

export interface SecFilingAttachment {
  attachmentSequenceNumber: string;
  attachmentDocumentName: string;
  attachmentPurpose?: string;
  attachmentUrl: string;
  matchedPercentage: number;
}

export interface CriterionMatch {
  criterionKey: string;
  matchedAttachments: SecFilingAttachment[];
  matchedContent: string;
}

export interface CriterionMatchesOfLatest10Q {
  criterionMatches?: CriterionMatch[];
  status: ProcessingStatus;
  failureReason?: string;
}

export interface CreateSingleReportsRequest {
  ticker: string;
  criterionKey: string;
  industryGroupId: number;
  sectorId: number;
}

export interface SpiderScore {
  comment: string;
  score: number;
}

export interface SpiderGraphPie {
  key: string;
  name: string;
  summary: string;
  scores: SpiderScore[];
}

export type SpiderGraphForTicker = Record<string, SpiderGraphPie>;

export interface RegenerateSingleCriterionReportsRequest {
  ticker: string;
  criterionKey: string;
}

export interface MetricValueItem {
  metricKey: string;
  value: string;
  calculationExplanation: string;
}

export interface ImportantMetricsValue {
  status: ProcessingStatus;
  metrics?: MetricValueItem[];
}

export interface CriterionReportValueItem {
  reportKey: string;
  status: ProcessingStatus;
  outputFileUrl?: string;
}

export interface PerformanceChecklistItem {
  checklistItem: string;
  oneLinerExplanation: string;
  informationUsed: string;
  detailedExplanation: string;
  evaluationLogic: string;
  score: number;
}

export interface CriteriaEvaluation {
  criterionKey: string;
  importantMetrics?: ImportantMetricsValue;
  reports?: CriterionReportValueItem[];
  performanceChecklist?: PerformanceChecklistItem[];
}

export interface SecFilingAttachment {
  attachmentSequenceNumber: string;
  attachmentDocumentName: string;
  attachmentPurpose?: string;
  attachmentUrl: string;
  matchedPercentage: number;
  latest10QContent: string;
}

export interface CriterionMatch {
  criterionKey: string;
  matchedAttachments: SecFilingAttachment[];
  matchedContent: string;
}

export interface TickerReport {
  ticker: string;
  selectedIndustryGroup: IndustryGroup;
  selectedSector: Sector;
  evaluationsOfLatest10Q?: CriteriaEvaluation[];
  criteriaMatchesOfLatest10Q?: CriterionMatchesOfLatest10Q;
}

export interface MetricDefinitionItem {
  key: string;
  name: string;
  description: string;
  formula: string;
}

export type OutputType = 'Text' | 'BarGraph' | 'PieChart' | 'WaterfallChart';

export interface CriterionReportDefinitionItem {
  key: string;
  name: string;
  description: string;
  outputType: OutputType;
}

export interface IndustryGroupCriterion {
  key: string;
  name: string;
  shortDescription: string;
  importantMetrics: MetricDefinitionItem[];
  reports: CriterionReportDefinitionItem[];
}

export interface IndustryGroupCriteria {
  tickers: string[];
  selectedSector: Sector;
  selectedIndustryGroup: IndustryGroup;
  criteria: IndustryGroupCriterion[];
}

export interface CriteriaLookupItem {
  sectorId: number;
  sectorName: string;
  industryGroupId: number;
  industryGroupName: string;
  aiCriteriaFileUrl?: string;
  customCriteriaFileUrl?: string;
}

export interface CriteriaLookupList {
  criteria: CriteriaLookupItem[];
}
