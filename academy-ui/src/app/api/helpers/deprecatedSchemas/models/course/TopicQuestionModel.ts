export interface QuestionChoice {
  content: string;
  key: string;
}

export interface TopicQuestionModel {
  uuid: string;
  type: string;
  content: string;
  hint: string;
  explanation: string;
  answerKeys: string[];
  subTopics: string[];
  difficultyLevel: string;
  choices: QuestionChoice[];
}
