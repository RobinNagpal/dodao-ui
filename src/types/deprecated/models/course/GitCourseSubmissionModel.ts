export interface GitCourseSubmissionModel {
  uuid: string;
  courseKey: string;
  createdAt: number;
  createdBy: string;
  galaxyCredentialsUpdated?: boolean;
  isLatestSubmission?: boolean;
  questionsAttempted?: number;
  questionsCorrect?: number;
  questionsIncorrect?: number;
  questionsSkipped?: number;
  spaceId: string;
  status: string;
  updatedAt: number;
}
