import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';

export const fuseFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 90,
    },
  },
  {
    featureName: FeatureName.Bytes,
    enabled: true,
    details: {
      priority: 80,
    },
  },
  {
    featureName: FeatureName.Simulations,
    enabled: true,
    details: {
      priority: 70,
    },
  },
];
