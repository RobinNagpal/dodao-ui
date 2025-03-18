import {
  CriterionEvaluation as CriterionEvaluationPrisma,
  CriterionReportItem as CriterionReportItemPrisma,
  ImportantMetrics as ImportantMetricsPrisma,
  MetricValueItem as MetricValueItemPrisma,
  PerformanceChecklistEvaluation as PerformanceChecklistEvaluationPrisma,
  PerformanceChecklistItem as PerformanceChecklistItemPrisma,
  Ticker,
} from '@prisma/client';

export enum ProcessingStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  InProgress = 'InProgress',
  NotStarted = 'NotStarted',
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

export enum PredefinedReports {
  performanceChecklist = 'performanceChecklist',
  importantMetrics = 'importantMetrics',
}
export type SpiderGraphForTicker = Record<string, SpiderGraphPie>;

export type MetricValueItem = MetricValueItemPrisma;

export type ImportantMetrics = ImportantMetricsPrisma;

export type CriterionReportItem = CriterionReportItemPrisma;

export type PerformanceChecklistItem = PerformanceChecklistItemPrisma;

export type PerformanceChecklistEvaluation = PerformanceChecklistEvaluationPrisma;

export type CriterionEvaluation = CriterionEvaluationPrisma;

export type TickerReport = Ticker;
