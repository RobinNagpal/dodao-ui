import { TopicConfig } from './TopicConfig';

export interface GitRepoCourseTopic {
  title: string;
  key: string;
  details: string;
  readings?: string;
  summaries?: string;
  questions?: string;
  explanations?: string;
}

export interface GitRepoCourse {
  key: string;
  title: string;
  summary: string;
  details: string;
  courseFailContent?: string;
  coursePassContent?: string;
  duration: string;
  highlights: string[];
  publishStatus: string;
  thumbnail: string;
  topicConfig?: TopicConfig;
  topics: GitRepoCourseTopic[];
}
