import { CriterionDefinition } from '@/types/public-equity/criteria-types';
import { MetricValueItem, PerformanceChecklistItem, ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { CriterionMatch, CriterionMatchAttachment } from '.prisma/client';

export interface TickerCreateRequest {
  tickerKey: string;
  sectorId: number;
  industryGroupId: number;
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
  ticker: string;
  criterionKey: string;
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

export interface SaveCriteriaMatchesOfLatest10QRequest {
  criterionMatchesOfLatest10Q: {
    criterionMatches: {
      criterionKey: string;
      matchedContent: string;
      matchedAttachments: Omit<CriterionMatchAttachment, 'id' | 'spaceId' | 'criterionMatchId' | 'tickerKey' | 'criterionKey'>[];
    }[];
    status: ProcessingStatus;
    failureReason?: string;
  };
}

export interface SaveLatest10QFinancialStatementsRequest {
  latest10QFinancialStatements: string;
}
