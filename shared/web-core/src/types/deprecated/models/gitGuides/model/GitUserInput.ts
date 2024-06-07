import { GitGuideStepItem } from './GitGuideStepItem';

export interface GitUserInput extends GitGuideStepItem {
  label: string;
  required: boolean;
}
