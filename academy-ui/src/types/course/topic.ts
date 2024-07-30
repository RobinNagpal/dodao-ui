export interface CourseTopic {
  title: string;
  key: string;
  details: string;
  order?: number;
  explanations: CourseExplanations[];
  questions: CourseQuestions[];
  readings: Readings[];
  summaries: Summaries[];
}

export interface CourseExplanations {
  key: string;
  title: string;
  shortTitle: string;
  details: string;
}

export interface CourseQuestions {
  uuid: string;
  type: string;
  content: string;
  hint: string;
  explanation: string;
  answerKeys: string[];
  subTopics: string[];
  difficultyLevel: string;
  choices: QuestionChoices[];
}

export interface QuestionChoices {
  content: string;
  key: string;
}

export interface Summaries {
  title: string;
  key: string;
  shortTitle: string;
  details: string;
}

export interface Readings {
  uuid: string;
  shortTitle: string;
  details: string;
  title: string;
  type: string;
  url: string;
  subTopics: string[];
}
