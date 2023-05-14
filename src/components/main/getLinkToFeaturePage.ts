import { FeatureName } from '@/types/spaceFeatures';

export const getLinkToFeaturePage = (featureName: FeatureName): string => {
  if (featureName === FeatureName.Guides) {
    return '/guides';
  }

  if (featureName === FeatureName.Courses) {
    return '/courses';
  }

  if (featureName === FeatureName.Bytes) {
    return '/tidbits';
  }

  if (featureName === FeatureName.Timelines) {
    return '/timelines';
  }

  if (featureName === FeatureName.Simulations) {
    return '/simulations';
  } else throw Error('Invalid feature name', featureName);
};
