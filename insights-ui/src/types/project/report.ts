import { ProjectInfoInput, ReportInterface } from '@/types/project/project';

export interface ProjectInfoAndReport {
  projectId: string;
  projectInfo: ProjectInfoInput;
  report?: ReportInterface;
}
