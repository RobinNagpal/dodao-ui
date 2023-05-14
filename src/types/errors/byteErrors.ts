import { StepError } from '@/types/errors/error';

export interface ByteErrors {
  name?: boolean;
  content?: boolean;
  steps?: Record<string, StepError>;
}
