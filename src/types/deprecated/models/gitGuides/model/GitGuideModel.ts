import { PublishStatus } from '@/types/deprecated/models/enums';
import { GuideType } from '@/types/deprecated/models/GuideModel';
import { GitGuideIntegrations } from './GitGuideIntegrations';
import { GitGuideStep } from './GitGuideStep';

export interface GitGuideModel {
  categories: string[];
  content: string;
  created: string;
  guideIntegrations?: GitGuideIntegrations;
  guideType: GuideType;
  key: string;
  name: string;
  postSubmissionStepContent?: string;
  publishStatus: PublishStatus;
  showIncorrectOnCompletion: boolean;
  socialShareImage?: string;
  steps: GitGuideStep[];
  thumbnail: string;
  uuid: string;
}
