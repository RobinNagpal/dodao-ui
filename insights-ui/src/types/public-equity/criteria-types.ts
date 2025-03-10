export interface IndustryGroup {
  id: number;
  name: string;
}

export interface Sector {
  id: number;
  name: string;
}

export interface MetricDefinitionItem {
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
export interface CriterionReportDefinitionItem {
  key: string;
  name: string;
  description: string;
  outputType: OutputType;
}

export interface IndustryGroupCriterion {
  key: string;
  name: string;
  shortDescription: string;
  importantMetrics: MetricDefinitionItem[];
  reports: CriterionReportDefinitionItem[];
}

export interface IndustryGroupCriteria {
  tickers: string[];
  selectedSector: Sector;
  selectedIndustryGroup: IndustryGroup;
  criteria: IndustryGroupCriterion[];
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
