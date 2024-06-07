import { TopicQuestionModel } from './TopicQuestionModel';
import { TopicReadingModel } from './TopicReadingModel';
import { TopicSummaryModel } from './TopicSummaryModel';
import { TopicExplanationModel } from './TopicExplanationModel';

export interface GitCourseTopicModel {
  title: string;
  key: string;
  details: string;
  explanations?: TopicExplanationModel[];
  questions?: TopicQuestionModel[];
  readings?: TopicReadingModel[];
  summaries?: TopicSummaryModel[];
}
