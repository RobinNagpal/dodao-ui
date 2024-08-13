import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';

export const compoundFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.ByteCollections,
    enabled: true,
    details: {
      priority: 90,
    },
  },
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 80,
    },
  },

  {
    featureName: FeatureName.ClickableDemos,
    enabled: true,
    details: {
      priority: 70,
    },
  },
  {
    featureName: FeatureName.Timelines,
    enabled: true,
    details: {
      priority: 60,
    },
  },
];
