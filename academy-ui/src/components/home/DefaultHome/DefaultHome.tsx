import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { GetStartedButton } from '@dodao/web-core/components/home/common/GetStartedButton';
import { LottieAnimation } from './LottieAnimation';
import HomeIcon from '@/components/main/HomeIcon';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { FeatureItem } from '@dodao/web-core/types/features/spaceFeatures';
import { getSortedFeaturesArray } from '@/utils/features';
import React from 'react';

function DefaultHome({ space }: { space: SpaceWithIntegrationsFragment }) {
  const { $t } = useI18();
  const sortedSpaceFeatures: FeatureItem[] = getSortedFeaturesArray(space);

  return (
    <PageWrapper>
      <div className="flex justify-center flex-col items-center">
        <div className="pt-[150px]">
          <Grid2Cols>
            <div className="flex flex-col justify-center pr-[38px] pl-[20px] max-w-md sm:px-[24px]">
              <div className="mx-auto max-w-7xl px-6 py-24 sm:py-24 lg:px-8">
                <h2 dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyHeading`) }} className="text-3xl font-bold tracking-tight sm:text-4xl" />
                <div className="pt-2 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyText`) }} />
                <div className="mt-10 flex items-center gap-x-6"></div>
              </div>
            </div>
            <LottieAnimation space={space} />
          </Grid2Cols>
        </div>
        <div className="flex align-center justify-center mb-24">
          <GetStartedButton href={space.id === 'uniswap-eth-1' ? '/courses' : '/guides'}>
            Get started <span aria-hidden="true">→</span>
          </GetStartedButton>
        </div>
        <div className="px-[36px] sm:px-[24px]">
          <Grid2Cols>
            {sortedSpaceFeatures.map((feature) => (
              <HomeIcon space={space} feature={feature} key={feature.featureName} />
            ))}
          </Grid2Cols>
        </div>
      </div>
    </PageWrapper>
  );
}

export default DefaultHome;
