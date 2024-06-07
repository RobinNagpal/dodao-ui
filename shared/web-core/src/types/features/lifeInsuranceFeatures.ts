import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';

export const lifeInsuranceFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.ByteCollections,
    enabled: true,
    details: {
      priority: 90,
    },
  },
  {
    featureName: FeatureName.Shorts,
    enabled: true,
    details: {
      priority: 85,
    },
  },
];
