import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';

export const optimismFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 90,
    },
  },
  {
    featureName: FeatureName.ByteCollections,
    enabled: true,
    details: {
      priority: 70,
    },
  },
  {
    featureName: FeatureName.ClickableDemos,
    enabled: true,
    details: {
      priority: 60,
    },
  },
  {
    featureName: FeatureName.Timelines,
    enabled: true,
    details: {
      priority: 55,
    },
  },

  {
    featureName: FeatureName.Courses,
    enabled: true,
    details: {
      priority: 50,
    },
  },
];
