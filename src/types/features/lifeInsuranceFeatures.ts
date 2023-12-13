import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';

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
