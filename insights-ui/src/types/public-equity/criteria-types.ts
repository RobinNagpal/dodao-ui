export interface IndustryGroup {
  id: number;
  name: string;
}

export interface Sector {
  id: number;
  name: string;
}

export interface MetricItemDefinition {
  key: string;
  name: string;
  description: string;
  formula: string;
}

export enum OutputType {
  Text = 'Text',
  BarGraph = 'BarGraph',
  PieChart = 'PieChart',
  WaterfallChart = 'WaterfallChart',
}
export interface CriterionReportDefinition {
  key: string;
  name: string;
  description: string;
  outputType: OutputType;
}

export interface CriterionDefinition {
  key: string;
  name: string;
  shortDescription: string;
  importantMetrics: MetricItemDefinition[];
  reports: CriterionReportDefinition[];
}

export interface IndustryGroupCriteriaDefinition {
  tickers: string[];
  selectedSector: Sector;
  selectedIndustryGroup: IndustryGroup;
  criteria: CriterionDefinition[];
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
