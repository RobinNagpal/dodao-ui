export interface TimelineEventsError {
  name?: string;
  content?: string;
  excerpt?: string;
  moreLink?: string;
}

export interface TimelineErrors {
  name?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  events?: Record<string, TimelineEventsError>;
}
