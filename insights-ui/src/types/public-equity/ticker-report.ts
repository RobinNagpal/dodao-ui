export type ProcessingStatus = 'Completed' | 'Failed' | 'InProgress';

export interface IndustryGroup {
  id: number;
  name: string;
}

export interface Sector {
  id: number;
  name: string;
}

export interface Metric {
  metricKey: string;
  value: number;
  calculationExplanation: string;
}

export interface ImportantMetrics {
  status: string;
  metrics: Metric[];
}

export interface Report {
  reportKey: string;
  name?: string;
  outputType?: string;
  status?: string;
  outputFile?: string | null;
  outputFileUrl?: string | null;
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
  importantMetrics?: ImportantMetrics;
  reports?: Report[];
  performanceChecklist?: PerformanceChecklistItem[];
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
  criterionMatches: CriterionMatch[];
  status: ProcessingStatus;
  failureReason?: string;
}

export interface TickerReport {
  ticker: string;
  selectedIndustryGroup: IndustryGroup;
  selectedSector: Sector;
  evaluationsOfLatest10Q?: CriteriaEvaluation[];
  criteriaMatchesOfLatest10Q?: CriterionMatchesOfLatest10Q;
}

export interface CreateAllReportsRequest {
  ticker: string;
  industryGroupId: number;
  sectorId: number;
}

export interface CreateSingleReportsRequest {
  ticker: string;
  criterionKey: string;
  industryGroupId: number;
  sectorId: number;
}

export interface RegenerateSingleCriterionReportsRequest {
  ticker: string;
  criterionKey: string;
}
export interface RegenerateAllCriteriaReportsRequest {
  ticker: string;
}