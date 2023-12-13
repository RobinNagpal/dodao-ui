import { FeatureName } from '@/types/features/spaceFeatures';

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
  }

  if (featureName === FeatureName.ByteCollections) {
    return '/tidbit-collections';
  }

  if (featureName === FeatureName.Chatbot) {
    return '/nema';
  }

  if (featureName === FeatureName.Shorts) {
    return '/shorts';
  }

  throw Error('Invalid feature name' + featureName);
};
