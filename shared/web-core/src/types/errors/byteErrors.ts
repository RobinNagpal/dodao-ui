import { StepError } from '@dodao/web-core/types/errors/error';

export interface CompletionScreenItemErrors {
  label?: boolean;
  link?: boolean;
}

export interface CompletionScreenErrors {
  name?: boolean;
  content?: boolean;
  imageUrl?: boolean;
  items?: Record<string, CompletionScreenItemErrors>;
}

export interface ByteErrors {
  name?: boolean;
  content?: boolean;
  steps?: Record<string, StepError>;
  completionScreen?: CompletionScreenErrors;
}
