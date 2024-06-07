import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';

export const arbitrumFeatures: FeatureItem[] = [
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
    featureName: FeatureName.Simulations,
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
