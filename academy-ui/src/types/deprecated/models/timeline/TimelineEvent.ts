export interface TimelineEvent {
  name: string;
  uuid: string;
  date: string;
  excerpt: string;
  content: string;
  moreLink?: string | null;
}
