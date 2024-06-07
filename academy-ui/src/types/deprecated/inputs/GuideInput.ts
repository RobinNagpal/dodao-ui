import { PublishStatus } from './../models/enums';
import { GuideIntegrations, GuideQuestion, GuideSource, GuideType, UserInput } from './../models/GuideModel';

export interface GuideStepInput {
  content: string;
  name: string;
  order: number;
  stepItems: (GuideQuestion | UserInput)[];
  uuid: string;
}

export interface GuideInput {
  categories: string[];
  content: string;
  from: string;
  guideIntegrations: GuideIntegrations;
  guideSource: GuideSource;
  guideType: GuideType;
  name: string;
  postSubmissionStepContent?: string | null;
  showIncorrectOnCompletion: boolean;
  socialShareImage?: string | null;
  space: string;
  steps: GuideStepInput[];
  publishStatus: PublishStatus;
  timestamp?: number | null;
  thumbnail?: string | null;
  uuid: string;
}
