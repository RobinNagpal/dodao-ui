import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';

export const creditUnionAcademyFeatures: FeatureItem[] = [
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
    featureName: FeatureName.Courses,
    enabled: true,
    details: {
      priority: 70,
    },
  },
];
