import { PredefinedSpaces } from '@/chatbot/utils/app/constants';
import { SpaceTypes, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { compoundFeatures } from '@/types/features/compoundFeatures';
import { creditUnionAcademyFeatures } from '@/types/features/creditUnionAcademyFeatures';
import { dodaoAcademyFeatures } from '@/types/features/dodaoAcademyFeatures';
import { dodaoIoFeatures } from '@/types/features/dodaoIoFeatures';
import { fuseFeatures } from '@/types/features/fuseFeatures';
import { lifeInsuranceFeatures } from '@/types/features/lifeInsuranceFeatures';
import { optimismFeatures } from '@/types/features/optimismFeatures';
import { arbitrumFeatures } from '@/types/features/arbitrumFeatures';
import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';
import { testAcademyFeatures } from '@/types/features/testAcademyFeatures';
import { uniswapFeatures } from '@/types/features/uniswapFeatures';
import sortBy from 'lodash/sortBy';

export function getFeaturesArray(spaceId: string): FeatureItem[] {
  if (spaceId === 'dodao-academy-eth-1') {
    return dodaoAcademyFeatures;
  } else if (spaceId === 'dodao-academy') {
    return dodaoIoFeatures;
  } else if (spaceId === 'compound-eth-1') {
    return compoundFeatures;
  } else if (spaceId === 'test-academy-eth') {
    return testAcademyFeatures;
  } else if (spaceId === 'uniswap-eth-1') {
    return uniswapFeatures;
  } else if (spaceId === 'credit-union-academy') {
    return creditUnionAcademyFeatures;
  } else if (spaceId === 'fuse') {
    return fuseFeatures;
  } else if (spaceId === 'optimism-university') {
    return optimismFeatures;
  } else if (spaceId === 'arbitrum-university') {
    return arbitrumFeatures;
  } else if (spaceId === 'life-insurance-tips') {
    return lifeInsuranceFeatures;
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

export function getSortedFeaturesArray(space: SpaceWithIntegrationsFragment): FeatureItem[] {
  if (space?.type === SpaceTypes.TidbitsSite) {
    return [];
  }

  if (space?.id === PredefinedSpaces.TIDBITS_HUB) {
    return [];
  }

  const features = getFeaturesArray(space.id);
  return sortBy(features, [(f1) => -f1.details.priority]);
}
