import { CriterionDefinition } from '@/types/public-equity/criteria-types';
import { MetricValueItem, PerformanceChecklistItem } from '@/types/public-equity/ticker-report-types';

export interface TickerUpsertRequest {
  tickerKey: string;
  sectorId: number;
  industryGroupId: number;
  reportUrl?: string;
}

export interface TickerCreateRequest {
  tickerKey: string;
  sectorId: number;
  industryGroupId: number;
  reportUrl?: string;
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

export interface NextCriterionReportRequest {
  ticker: string;
  shouldTriggerNext: boolean;
  criterionKey: string;
  overflow?: string;
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
  reportKey: string;
  data: string;
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
