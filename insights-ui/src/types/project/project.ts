export interface Projects {
  projectIds: string[];
}

export interface ReportWithName extends ReportInterface {
  name: string;
}

export enum ProcessingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum InformationStatus {
  MISSING = 'missing', // No clue at all, and it can't be derived
  DERIVED = 'derived', // Not mentioned explicitly but can be inferred or extrapolated
  EXTRACTED = 'extracted', // Explicitly mentioned in the content
  NOT_APPLICABLE = 'not_applicable', // Not applicable for the given context
}

// Enum for Report Types
export enum ReportType {
  GENERAL_INFO = 'general_info',
  FOUNDER_AND_TEAM = 'founder_and_team',
  TRACTION = 'traction',
  MARKET_OPPORTUNITY = 'market_opportunity',
  VALUATION = 'valuation',
  EXECUTION_AND_SPEED = 'execution_and_speed',
  FINANCIAL_HEALTH = 'financial_health',
  RELEVANT_LINKS = 'relevant_links',
}

export const ALL_REPORT_TYPES: ReportType[] = [
  ReportType.GENERAL_INFO,
  ReportType.FOUNDER_AND_TEAM,
  ReportType.TRACTION,
  ReportType.MARKET_OPPORTUNITY,
  ReportType.VALUATION,
  ReportType.EXECUTION_AND_SPEED,
  ReportType.FINANCIAL_HEALTH,
  ReportType.RELEVANT_LINKS,
];
export interface ProjectSubmissionData {
  projectId: string;
  projectName: string;
  projectImgUrl?: string;
  crowdFundingUrl: string;
  websiteUrl: string;
  secFilingUrl: string;
  additionalUrls: string[];
}
export interface ProjectInfoInput {
  /**
   * Represents the user-provided project input
   * (URLs, etc.) that we need to track in the agent status.
   */
  crowdFundingUrl: string;
  secFilingUrl: string;
  additionalUrls: string[];
  websiteUrl: string;
}

export interface ReportInterface {
  /**
   * Represents the status and metadata of a single report
   * (e.g., "team_info", "financial_review", etc.).
   * Fields marked as optional may only appear under certain conditions.
   */
  status: ProcessingStatus;
  markdownLink?: string;
  startTime: string;
  estimatedTimeInSec: number;
  endTime?: string;
  errorMessage?: string;
}

export interface FinalReportInterface extends ReportInterface {
  spiderGraphJsonFileUrl?: string;
}

export interface ProcessedSecInfoInterface {
  /**
   * Stores the processed SEC filing content in various formats.
   */
  secJsonContent: string;
  secMarkdownContent: string;
  secRawContent: string;
}

export interface MetricInterface {
  explanation: string;
  opinion: string;
  informationStatus: InformationStatus;
}

export interface StartupMetricsInterface {
  growthRate?: MetricInterface;
  organicVsPaidGrowth?: MetricInterface;
  virality?: MetricInterface;
  networkEffect?: MetricInterface;
  customerAcquisitionCost?: MetricInterface;
  unitEconomics?: MetricInterface;
  retentionRate?: MetricInterface;
  magicMoment?: MetricInterface;
  netPromoterScore?: MetricInterface;
  customerLifetimeValue?: MetricInterface;
  paybackPeriod?: MetricInterface;
  revenueGrowth?: MetricInterface;
  churnRate?: MetricInterface;
}

export interface IndustryDetailsAndForecastInterface {
  /**
   * Stores the processed industry details and forecast content.
   */
  industryDetailsAndForecast: string;
  totalAddressableMarket: string;
  serviceableAddressableMarket: string;
  serviceableObtainableMarket: string;
}

export interface ProcessedProjectInfoInterface {
  /**
   * Stores combined text results after scraping the various
   * URLs for this project, plus a timestamp for when it was last updated.
   */
  additionalUrlsUsed: string[];
  contentOfAdditionalUrls: string;
  contentOfCrowdfundingUrl: string;
  contentOfWebsiteUrl: string;
  secInfo: ProcessedSecInfoInterface;
  industryDetails: IndustryDetailsAndForecastInterface;
  startupMetrics: StartupMetricsInterface;
  lastUpdated: string;
  status: ProcessingStatus;
}

export interface ProjectDetails {
  /**
   * The top-level structure that gets stored in
   * `crowd-fund-analysis/<project_id>/agent-status.json`.
   */
  id: string;
  name: string;
  imgUrl?: string;
  projectInfoInput: ProjectInfoInput;
  status: ProcessingStatus;
  reports: Record<string, ReportInterface>;
  finalReport?: FinalReportInterface;
  processedProjectInfo?: ProcessedProjectInfoInterface;
}

export interface SpiderScore {
  comment: string;
  score: number;
}

export interface SpiderGraph {
  [category: string]: SpiderScore[];
}
