import { GuideFragment } from '@/graphql/generated/generated-types';

export type EditGuideType = GuideFragment & { id?: string } & {
  isPristine: boolean;
  guideExists: boolean;
};
