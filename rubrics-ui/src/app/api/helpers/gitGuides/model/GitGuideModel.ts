import { PublishStatus } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { GuideType } from '@/app/api/helpers/deprecatedSchemas/models/GuideModel';
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
  socialShareImage?: string;
  steps: GitGuideStep[];
  thumbnail: string;
  uuid: string;
  version?: number;
  priority?: number;
}
