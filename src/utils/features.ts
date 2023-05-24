import { compoundFeatures, dodaoFeatures, FeatureItem, FeatureName, testAcademyFeatures, uniswapFeatures } from '@/types/spaceFeatures';

export function getFeaturesArray(spaceId: string): FeatureItem[] {
  if (spaceId === 'dodao-academy-eth-1') {
    return dodaoFeatures;
  }

  if (spaceId === 'compound-eth-1') {
    return compoundFeatures;
  }

  if (spaceId === 'test-academy-eth') {
    return testAcademyFeatures;
  }

  if (spaceId === 'uniswap-eth-1') {
    return uniswapFeatures;
  }

  return [
    {
      featureName: FeatureName.Guides,
      enabled: true,
      details: {
        priority: 90,
      },
    },
    {
      featureName: FeatureName.Courses,
      enabled: true,
      details: {
        priority: 80,
      },
    },
  ];
}
