export interface Sector {
  id: number; // ID of the sector.
  name: string; // Name of the sector.
}

export interface IndustryGroup {
  id: number; // ID of the industry group.
  name: string; // Name of the industry group.
}

export interface ImportantMetric {
  key: string; // Unique identifier for the metric.
  name: string; // Descriptive name of the metric.
  description: string; // Detailed explanation of what the metric measures.
  formula: string; // Mathematical formula used to calculate the metric.
}

export type OutputType = 'Text' | 'BarGraph' | 'PieChart';

export interface Report {
  key: string; // Unique identifier for the report.
  name: string; // Name of the report.
  description: string; // Comprehensive description of the report.
  outputType: OutputType; // Output type.
}

export interface Criterion {
  key: string; // Unique identifier for the criteria.
  name: string; // Descriptive name of the criteria.
  shortDescription: string; // Brief overview of the criteria.
  importantMetrics: ImportantMetric[]; // Array of ImportantMetric.
  reports: Report[]; // Array of Report.
}

export interface IndustryGroupCriteria {
  tickers: string[]; // List of ticker symbols.
  selectedIndustryGroup: IndustryGroup; // Selected industry group information.
  criteria: Criterion[]; // Collection of evaluation criteria.
}

export interface CriteriaLookupItem {
  sectorId: number;
  sectorName: string;
  industryGroupId: number;
  industryGroupName: string;
  aiCriteriaFileUrl?: string | null;
  customCriteriaFileUrl?: string | null;
}

export interface CriteriaLookupList {
  criteria: CriteriaLookupItem[];
}

export interface CreateAiCriteriaRequest {
  sectorId: number;
  industryGroupId: number;
}
