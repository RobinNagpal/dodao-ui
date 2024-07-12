import { TimelineEvent } from './TimelineEvent';

export interface TimelineModel {
  id: string;
  name: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  created: string;
  publishStatus: string;
  events: TimelineEvent[];
  admins: string[];
  tags: string[];
  priority: number;
}
