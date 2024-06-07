import { TopicConfig } from './TopicConfig';
import { GitCourseTopicModel } from './CourseTopics';

export interface GitCourseModel {
  uuid: string;
  key: string;
  title: string;
  summary: string;
  details: string;
  courseFailContent?: string;
  coursePassContent?: string;
  coursePassCount?: number;
  duration: string;
  highlights: string[];
  priority?: number;
  publishStatus: string;
  thumbnail: string;
  courseAdmins?: string[];
  topicConfig?: TopicConfig;
  topics: GitCourseTopicModel[];
}
