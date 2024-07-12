import { QuestionType } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { GitGuideStepItem } from './GitGuideStepItem';

export interface GitQuestionChoice {
  content: string;
  key: string;
}

export interface GitGuideQuestion extends GitGuideStepItem {
  answerKeys: string[];
  choices: GitQuestionChoice[];
  content: string;
  questionType: QuestionType;
}
