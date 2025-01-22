export interface Projects {
    projectIds: string[]
}

export enum Status {
    in_progress = 'in_progress',
    completed = 'completed',
    pending = 'pending'
}

export interface ReportInterface {
    status: Status
    markdownLink: string | null
    pdfLink: string | null
}

export interface ProjectDetail {
    id: string
    name: string
    projectInfoInput: {
        SecFillingUrl: string
        crowdFundingUrl: string
        additionalUrl: string[]
        websiteUrl: string
    }
    status: Status
    reports: {
        [report_name: string]: ReportInterface
    }
    finalReport: ReportInterface
}