import { IndustryGroupCriterion, MetricValueItem, PerformanceChecklistItem } from '@/types/public-equity/ticker-report';

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
  criteria: IndustryGroupCriterion[];
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
  criteria: IndustryGroupCriterion[];
}

export interface CreateCustomCriteriaRequest {
  sectorId: number;
  industryGroupId: number;
}
