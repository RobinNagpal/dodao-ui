import { PublishStatus } from './../enums';

export interface SimulationStep {
  content?: string;
  created: number;
  uuid: string;
  name: string;
  order: number;
  iframeUrl?: string;
}

export interface SimulationModel {
  id: string;
  content: string;
  created: number;
  name: string;
  publishStatus: PublishStatus;
  steps: SimulationStep[];
  admins: string[];
  tags: string[];
  priority: number;
}
