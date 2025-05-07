import { CriterionDefinition } from '@/types/public-equity/criteria-types';
import {
  FullImportantMetricsEvaluation,
  FullPerformanceChecklistEvaluation,
  MetricValueItem,
  PerformanceChecklistItem,
  ProcessingStatus,
} from '@/types/public-equity/ticker-report-types';

export interface TickerCreateRequest {
  tickerKey: string;
  sectorId: number;
  industryGroupId: number;
  companyName: string;
  shortDescription: string;
}

// Request types for endpoints
export interface CreateCriteriaRequest {
  sectorId: number;
  industryGroupId: number;
}

export interface UpsertCustomCriteriaRequest {
  sectorId: number;
  industryGroupId: number;
  criteria: CriterionDefinition[];
}

export interface SavePerformanceChecklistRequest {
  ticker: string;
  criterionKey: string;
  performanceChecklist: PerformanceChecklistItem[] | string;
}

export interface SaveCriterionMetricsRequest {
  ticker: string;
  criterionKey: string;
  metrics: MetricValueItem[] | string;
}

export interface SaveCriterionReportRequest {
  ticker: string;
  criterionKey: string;
  reportKey: string;
  message: string;
}

export interface CreateAiCriteriaRequest {
  sectorId: number;
  industryGroupId: number;
}

export interface CreateCustomCriteriaRequestWithCriteria {
  sectorId: number;
  industryGroupId: number;
  criteria: CriterionDefinition[];
}

export interface CreateCustomCriteriaRequest {
  sectorId: number;
  industryGroupId: number;
}

export interface CreateSingleCriterionReportRequest {
  reportKey: string;
  langflowWebhookUrl: string;
}

export interface CreateAllCriterionReportsRequest {
  langflowWebhookUrl: string;
}

export interface GetSingleCriteriaMatchingRequest {
  sequenceNumber: string;
}

export interface SaveCriteriaMatchesOfLatest10QRequest {
  criterionMatchesOfLatest10Q: {
    criterionMatches: {
      criterionKey: string;
      matchedContent: string;
    }[];
    status: ProcessingStatus;
    failureReason?: string;
  };
}

export interface SaveLatest10QFinancialStatementsRequest {
  latest10QFinancialStatements: string;
}

export interface SaveTickerInfoRequest {
  tickerInfo: string;
}

export interface SaveTickerNewsRequest {
  tickerNews: string;
}

export interface SaveMgtTeamAssessmentRequest {
  managementTeamAssessment: string;
}

export interface CriterionMatchTextItem {
  criterion_key: string;
  relevant_text: string;
  relevance_amount: number;
}
export interface CriterionMatchResponse {
  criterion_matches: CriterionMatchTextItem[];
  status: 'success' | 'failure';
  failureReason?: string;
}

export interface MarkdownContentRequest {
  htmlContent: string;
}

export interface MarkdownContentResponse {
  markdown: string;
}

export interface Latest10QMetricsEvaluation {
  importantMetricsEvaluation: FullImportantMetricsEvaluation | null;
  performanceChecklistEvaluation: FullPerformanceChecklistEvaluation | null;
}

export interface TickerCompareMetricsAndChecklist {
  tickerKey: string;
  sectorId: number;
  industryGroupId: number;
  evaluationsOfLatest10Q: Latest10QMetricsEvaluation[];
}
