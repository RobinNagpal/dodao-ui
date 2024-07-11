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
  courseKey: string;
  topicKey: string;
  explanations: ExplanationSubmission[];
  questions: CourseQuestionSubmission[];
  readings: ReadingSubmission[];
  summaries: SummarySubmission[];
  status: TopicStatus;
}
