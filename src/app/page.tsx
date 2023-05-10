'use client';

import HomeIcon from '@/components/main/HomeIcon';
import { useSpace } from '@/context/SpaceContext';
import { useI18 } from '@/hooks/useI18';
import { SpaceModel } from '@/types/deprecated/models/SpaceModel';
import { FeatureItem } from '@/types/spaceFeatures';
import { getFeaturesArray } from '@/utils/features';
import Lottie from 'lottie-react';
import React from 'react';
import sortBy from 'lodash/sortBy';
import DeveloperLottie from './developer-lottie.json';

const UniswapSpace: SpaceModel = {
  blockchain: 'ETH',
  id: 'uniswap-eth-1',
  about: 'Developers, traders, and liquidity providers participate together in a financial marketplace that is open and accessible to all.',
  creator: '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9',
  features: [],
  mission: 'Swap, earn and build on a decentralized crypto trading protocol',
  name: 'Uniswap',
  network: '1',
  skin: 'uniswap',
  avatar: 'https://d31h13bdjwgzxs.cloudfront.net/academy/uniswap/uniswap_icon.svg',
  twitter: 'Uniswap',
  members: [],
  admins: [],
  categories: ['protocol'],
  spaceIntegrations: {
    id: 'uniswap-eth-1',
    spaceId: 'uniswap-eth-1',
    academyRepository: 'https://github.com/DoDAO-io/uniswap-lp-academy',
    gitGuideRepositories: [],
  },
};
export default function Home() {
  const space: SpaceModel = UniswapSpace;
  const { $t } = useI18();
  const spaceFeatures: FeatureItem[] = (space.id && getFeaturesArray(space.id)) || [];
  const sortedSpaceFeatures: FeatureItem[] = sortBy(spaceFeatures, [(f1) => -f1.details.priority]);
  const { space: ssss } = useSpace();
  console.log('ssss', ssss);

  return (
    <div>
      <div className="pt-[150px]">
        <div className="flex justify-center mt-8">
          <div className="flex flex-col justify-center pr-[48px] max-w-md">
            <h1 dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyHeading`) }} />
            <div className="pt-2" dangerouslySetInnerHTML={{ __html: $t(`academy.${space.id}.academyText`) }} />
          </div>
          <div className="flex center-content align-center">
            <Lottie animationData={DeveloperLottie} loop={true} />
          </div>
        </div>
      </div>
      <div className="pt-[150px] grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {sortedSpaceFeatures.map((feature) => (
          <HomeIcon space={space} feature={feature} key={feature.featureName} />
        ))}
      </div>
    </div>
  );
}
