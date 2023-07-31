'use client';

import withSpace from '@/app/withSpace';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import PageWithSpace from '@/components/core/loaders/PageWithSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import HomeIcon from '@/components/main/HomeIcon';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { FeatureItem } from '@/types/features/spaceFeatures';
import { getSortedFeaturesArray } from '@/utils/features';
import Lottie from 'lottie-react';
import React from 'react';
import DeveloperLottie from './developer-lottie.json';

function Home({ space }: { space: SpaceWithIntegrationsFragment }) {
  const { $t } = useI18();
  const sortedSpaceFeatures: FeatureItem[] = getSortedFeaturesArray(space.id);

  return (
    <PageWrapper>
      <PageWithSpace>
        {(space) => (
          <div className="flex justify-center flex-col items-center">
            <div className="pt-[150px]">
              <Grid2Cols>
                <div className="flex flex-col justify-center pr-[38px] pl-[20px] max-w-md sm:px-[24px]">
                  <h1 dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyHeading`) }} className="text-3xl sm:text-4xl" />
                  <div className="pt-2 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyText`) }} />
                </div>
                <Lottie animationData={DeveloperLottie} loop={true} className="max-h-96" />
              </Grid2Cols>
            </div>
            <div className="px-[36px] sm:px-[24px]">
              <Grid2Cols>
                {sortedSpaceFeatures.map((feature) => (
                  <HomeIcon space={space} feature={feature} key={feature.featureName} />
                ))}
              </Grid2Cols>
            </div>
          </div>
        )}
      </PageWithSpace>
    </PageWrapper>
  );
}

export default withSpace(Home);
