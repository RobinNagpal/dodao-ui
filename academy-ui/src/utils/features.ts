import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import { compoundFeatures } from '@dodao/web-core/types/features/compoundFeatures';
import { creditUnionAcademyFeatures } from '@dodao/web-core/types/features/creditUnionAcademyFeatures';
import { dodaoAcademyFeatures } from '@dodao/web-core/types/features/dodaoAcademyFeatures';
import { dodaoIoFeatures } from '@dodao/web-core/types/features/dodaoIoFeatures';
import { fuseFeatures } from '@dodao/web-core/types/features/fuseFeatures';
import { lifeInsuranceFeatures } from '@dodao/web-core/types/features/lifeInsuranceFeatures';
import { optimismFeatures } from '@dodao/web-core/types/features/optimismFeatures';
import { arbitrumFeatures } from '@dodao/web-core/types/features/arbitrumFeatures';
import { FeatureItem, FeatureName } from '@dodao/web-core/types/features/spaceFeatures';
import { testAcademyFeatures } from '@dodao/web-core/types/features/testAcademyFeatures';
import { uniswapFeatures } from '@dodao/web-core/types/features/uniswapFeatures';
import sortBy from 'lodash/sortBy';

export function getFeaturesArray(spaceId: string): FeatureItem[] {
  if (spaceId === 'dodao-academy-eth-1') {
    return dodaoAcademyFeatures;
  } else if (spaceId === 'dodao-academy') {
    return dodaoIoFeatures;
  } else if (spaceId === 'compound-eth-1') {
    return compoundFeatures;
  } else if (spaceId === process.env.DODAO_DEFAULT_SPACE_ID) {
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

export function getSortedFeaturesArray(space: SpaceWithIntegrationsDto): FeatureItem[] {
  if (space?.type === SpaceTypes.TidbitsSite) {
    return [];
  }

  if (space?.id === PredefinedSpaces.TIDBITS_HUB) {
    return [];
  }

  const features = getFeaturesArray(space.id);
  return sortBy(features, [(f1) => -f1.details.priority]);
}
