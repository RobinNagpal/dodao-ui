import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';

export const uniswapFeatures: FeatureItem[] = [
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
  {
    featureName: FeatureName.Courses,
    enabled: true,
    details: {
      priority: 50,
    },
  },
];
