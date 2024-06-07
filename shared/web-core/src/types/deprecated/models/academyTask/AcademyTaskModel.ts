import { GuideStepItem } from './../GuideModel';

export enum AcademyTaskStatus {
  New = 'New',
  InProgress = 'InProgress',
  Done = 'Done',
}

export interface AcademyTaskModel {
  uuid: string;
  createdAt: number;
  createdBy: string;
  excerpt: string;
  prerequisiteCourseUuids: string[];
  prerequisiteGuideUuids: string[];
  spaceId: string;
  status: AcademyTaskStatus;
  details: string;
  title: string;
  items: GuideStepItem[];
  updatedAt: number;
  updatedBy: string;
}
