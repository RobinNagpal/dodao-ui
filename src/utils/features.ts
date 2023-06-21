import {
  compoundFeatures,
  creditUnionAcademyFeatures,
  dodaoFeatures,
  FeatureItem,
  FeatureName,
  testAcademyFeatures,
  uniswapFeatures,
} from '@/types/spaceFeatures';
import sortBy from 'lodash/sortBy';

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

  if (spaceId === 'credit-union-academy') {
    return creditUnionAcademyFeatures;
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

export function getSortedFeaturesArray(spaceId: string): FeatureItem[] {
  const features = getFeaturesArray(spaceId);
  return sortBy(features, [(f1) => -f1.details.priority]);
}
