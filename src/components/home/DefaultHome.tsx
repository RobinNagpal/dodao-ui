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
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';
import EmpowerherLottie from './empower-her-lottie.json';
import DeveloperLottie from './developer-lottie.json';

const GetStartedButton = styled(Link)`
  background-color: var(--primary-color);
`;
function DefaultHome({ space }: { space: SpaceWithIntegrationsFragment }) {
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
                  <div className="mx-auto max-w-7xl px-6 py-24 sm:py-24 lg:px-8">
                    <h2
                      dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyHeading`) }}
                      className="text-3xl font-bold tracking-tight sm:text-4xl"
                    />
                    <div className="pt-2 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyText`) }} />
                    <div className="mt-10 flex items-center gap-x-6"></div>
                  </div>
                </div>
                {space.id === 'empowerher-academy' ? (
                  <Lottie animationData={EmpowerherLottie} loop={true} className="max-h-96 -mt-24" />
                ) : (
                  <Lottie animationData={DeveloperLottie} loop={true} className="max-h-96" />
                )}
              </Grid2Cols>
            </div>
            <div className="flex align-center justify-center mb-24">
              <GetStartedButton
                href={space.id === 'uniswap-eth-1' ? '/courses' : '/guides'}
                className="rounded-md px-6 py-3 md:px-24 md:py-4 lg:px-36 lg:py-4 text-2xl font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
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
        )}
      </PageWithSpace>
    </PageWrapper>
  );
}

export default withSpace(DefaultHome);
