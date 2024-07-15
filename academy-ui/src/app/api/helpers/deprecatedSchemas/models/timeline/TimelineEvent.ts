export interface TimelineEvent {
  title: string;
  uuid: string;
  date: string;
  summary: string;
  fullDetails?: string | null;
  moreLink?: string | null;
}
