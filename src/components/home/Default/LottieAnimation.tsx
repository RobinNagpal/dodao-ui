'use client';

import DeveloperLottie from '@/components/home/developer-lottie.json';
import EmpowerherLottie from '@/components/home/empower-her-lottie.json';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Lottie from 'lottie-react';
import React from 'react';

export function LottieAnimation({ space }: { space: SpaceWithIntegrationsFragment }) {
  return space.id === 'empowerher-academy' ? (
    <Lottie animationData={EmpowerherLottie} loop={true} className="max-h-96 -mt-24" />
  ) : (
    <Lottie animationData={DeveloperLottie} loop={true} className="max-h-96" />
  );
}
