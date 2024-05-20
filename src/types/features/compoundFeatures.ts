import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';

export const compoundFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.ByteCollections,
    enabled: true,
    details: {
      priority: 80,
    },
  },
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 90,
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
    featureName: FeatureName.Timelines,
    enabled: true,
    details: {
      priority: 60,
    },
  },
  {
    featureName: FeatureName.Chatbot,
    enabled: true,
    details: {
      priority: 85,
    },
  },
];
