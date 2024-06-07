import { PublishStatus } from '../enums';

export interface RawGitCourseModel {
  courseJsonUrl?: string;
  courseRepoUrl?: string;
  key: string;
  publishStatus: PublishStatus;
  spaceId: string;
  weight: number;
}
