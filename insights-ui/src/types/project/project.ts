export interface Projects {
  projectIds: string[];
}

export enum Status {
  not_started = 'not_started',
  in_progress = 'in_progress',
  completed = 'completed',
  failed = 'failed',
}

export interface ReportInterface {
  status: Status;
  errorMessage?: string;
  markdownLink: string | null;
  pdfLink: string | null;
  startTime?: string;
  estimatedTimeInSec?: number;
  endTime?: string;
}

export interface ReportWithName extends ReportInterface {
  name: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  projectInfoInput: {
    SecFillingUrl: string;
    crowdFundingUrl: string;
    additionalUrl: string[];
    websiteUrl: string;
  };
  status: Status;
  reports: {
    [report_name: string]: ReportInterface;
  };
  finalReport: ReportInterface;
}
