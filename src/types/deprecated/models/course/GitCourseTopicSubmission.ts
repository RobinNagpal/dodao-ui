export enum QuestionStatus {
  Skipped = 'Skipped',
  Completed = 'Completed',
  Uncompleted = 'Uncompleted',
}

export enum TopicItemStatus {
  Completed = 'Completed',
  Uncompleted = 'Uncompleted',
}

export enum TopicStatus {
  UnAttempted = 'UnAttempted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Submitted = 'Submitted',
}

export enum CourseStatus {
  InProgress = 'InProgress',
  Submitted = 'Submitted',
}

export type CourseQuestionSubmission = {
  uuid: string;
  status: QuestionStatus;
  answers: string[];
};

export type ReadingSubmission = {
  uuid: string;
  status: TopicItemStatus;
  questions?: Record<string, CourseQuestionSubmission>;
};

export type SummarySubmission = {
  key: string;
  status: TopicItemStatus;
};

export type ExplanationSubmission = {
  key: string;
  status: TopicItemStatus;
};

export interface TempTopicSubmissionModel {
  uuid: string;
  explanations: ExplanationSubmission[];
  questions: CourseQuestionSubmission[];
  readings: ReadingSubmission[];
  summaries: SummarySubmission[];
}

export interface GitCourseTopicSubmissionModel {
  uuid: string;
  courseKey: string;
  courseSubmissionUuid: string;
  createdAt: number;
  createdBy: string;
  correctAnswers?: { uuid: string; answerKeys: string[] }[];
  isLatestSubmission: boolean;
  questionsAttempted?: number;
  questionsCorrect?: number;
  questionsIncorrect?: number;
  questionsSkipped?: number;
  submission: TempTopicSubmissionModel;
  spaceId: string;
  status: string;
  topicKey: string;
  updatedAt: number;
}
