'use client';

import withSpace from '@/app/withSpace';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import PageWithSpace from '@/components/core/loaders/PageWithSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import HomeIcon from '@/components/main/HomeIcon';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { FeatureItem } from '@/types/spaceFeatures';
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
        {(space) => {
          return (
            <div>
              <div className="pt-[150px]">
                <Grid2Cols>
                  <div className="flex flex-col justify-center pr-[48px] max-w-md">
                    <h1 dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyHeading`) }} className="text-4xl" />
                    <div className="pt-2" dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyText`) }} />
                  </div>
                  <Lottie animationData={DeveloperLottie} loop={true} className="max-h-96" />
                </Grid2Cols>
              </div>
              <Grid2Cols>
                {sortedSpaceFeatures.map((feature) => (
                  <HomeIcon space={space} feature={feature} key={feature.featureName} />
                ))}
              </Grid2Cols>
            </div>
          );
        }}
      </PageWithSpace>
    </PageWrapper>
  );
}

export default withSpace(Home);
