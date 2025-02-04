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

// Enum for Report Types
export enum ReportType {
  GENERAL_INFO = 'general_info',
  TEAM_INFO = 'team_info',
  FINANCIAL_REVIEW = 'financial_review',
  RED_FLAGS = 'red_flags',
  GREEN_FLAGS = 'green_flags',
  RELEVANT_LINKS = 'relevant_links',
}

// Example usage
export const ALL_REPORT_TYPES: ReportType[] = [
  ReportType.GENERAL_INFO,
  ReportType.TEAM_INFO,
  ReportType.FINANCIAL_REVIEW,
  ReportType.RED_FLAGS,
  ReportType.GREEN_FLAGS,
  ReportType.RELEVANT_LINKS,
];
export interface ProjectSubmissionData {
  projectId: string;
  projectName: string;
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

export interface ProcessedProjectInfoInterface {
  /**
   * Stores combined text results after scraping the various
   * URLs for this project, plus a timestamp for when it was last updated.
   */
  additionalUrlsUsed: string[];
  contentOfAdditionalUrls: string;
  contentOfCrowdfundingUrl: string;
  contentOfWebsiteUrl: string;
  secRawContent: string;
  secJsonContent: string;
  secMarkdownContent: string;
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
