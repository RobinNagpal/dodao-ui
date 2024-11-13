'use client';

import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Lottie from 'lottie-react';
import React from 'react';
import DeveloperLottie from './developer-lottie.json';
import EmpowerherLottie from './empower-her-lottie.json';

export function LottieAnimation({ space }: { space: SpaceWithIntegrationsDto }) {
  return space.id === 'empowerher-academy' ? (
    <Lottie animationData={EmpowerherLottie} loop={true} className="max-h-96 -mt-24" />
  ) : (
    <Lottie animationData={DeveloperLottie} loop={true} className="max-h-96" />
  );
}
