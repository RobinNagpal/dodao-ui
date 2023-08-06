import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';

export const dodaoIoFeatures: FeatureItem[] = [
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
      priority: 70,
    },
  },
];
