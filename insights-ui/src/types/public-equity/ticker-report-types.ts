import { IndustryGroup, Sector } from '@/types/public-equity/criteria-types';

export enum ProcessingStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  InProgress = 'InProgress',
  NotStarted = 'NotStarted',
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
  relevance: number;
  attachmentContent: string;
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

export interface ImportantMetrics {
  status: ProcessingStatus;
  metrics?: MetricValueItem[];
}

export interface CriterionReportItem {
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

export interface PerformanceChecklistEvaluation {
  status: ProcessingStatus;
  performanceChecklist?: PerformanceChecklistItem[];
}

export interface CriterionEvaluation {
  criterionKey: string;
  importantMetrics?: ImportantMetrics;
  reports?: CriterionReportItem[];
  performanceChecklistEvaluation?: PerformanceChecklistEvaluation;
}

export interface TickerReport {
  ticker: string;
  selectedIndustryGroup: IndustryGroup;
  selectedSector: Sector;
  evaluationsOfLatest10Q?: CriterionEvaluation[];
  criteriaMatchesOfLatest10Q?: CriterionMatchesOfLatest10Q;
}

export interface TickerReportPrisma {
  id: string;
  tickerKey: string;
  selectedIndustryGroupId: number;
  selectedSectorId: number;
  evaluations?: CriterionEvaluation[];
  criteriaMatchesOfLatest10Q?: CriterionMatchesOfLatest10Q;
}
