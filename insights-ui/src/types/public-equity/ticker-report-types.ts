import {
  CriterionEvaluation as CriterionEvaluationPrisma,
  CriterionReportItem as CriterionReportItemPrisma,
  ImportantMetricsEvaluation as ImportantMetricsEvaluationPrisma,
  MetricValueItem as MetricValueItemPrisma,
  PerformanceChecklistEvaluation as PerformanceChecklistEvaluationPrisma,
  PerformanceChecklistItem as PerformanceChecklistItemPrisma,
  Ticker,
} from '@prisma/client';
import { CriteriaMatchesOfLatest10Q, CriterionMatch, CriterionMatchAttachment } from '.prisma/client';

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

export type ImportantMetrics = ImportantMetricsEvaluationPrisma;

export type CriterionReportItem = CriterionReportItemPrisma;

export type PerformanceChecklistItem = PerformanceChecklistItemPrisma;

export type PerformanceChecklistEvaluation = PerformanceChecklistEvaluationPrisma;

export type CriterionEvaluation = CriterionEvaluationPrisma;

export type TickerReport = Ticker;

export type FullPerformanceChecklistEvaluation = PerformanceChecklistEvaluation & { performanceChecklist: PerformanceChecklistItem[] };
export type FullImportantMetricsEvaluation = ImportantMetricsEvaluationPrisma & { metrics: MetricValueItem[] };

export interface FullCriterionMatch extends CriterionMatch {
  matchedAttachments: CriterionMatchAttachment[];
}
export interface FullCriteriaMatchesOfLatest10Q extends CriteriaMatchesOfLatest10Q {
  criterionMatches: FullCriterionMatch[];
}

export interface FullCriterionEvaluation extends CriterionEvaluationPrisma {
  reports: CriterionReportItem[];
  performanceChecklistEvaluation: FullPerformanceChecklistEvaluation;
  importantMetricsEvaluation: FullImportantMetricsEvaluation;
}
export interface FullNestedTickerReport extends Ticker {
  criteriaMatchesOfLatest10Q: FullCriteriaMatchesOfLatest10Q;
  evaluationsOfLatest10Q: Array<FullCriterionEvaluation>;
}
