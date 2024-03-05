'use client';

import { AppScreen } from './AppScreen';
import Lottie from 'lottie-react';
import DeveloperLottie from '../../../home/DefaultHome/developer-lottie.json';
import Image from 'next/image';
import Home from '@/images/lifeInsure/images/home.png';

export function AppDemo() {
  return (
    <AppScreen>
      <Lottie animationData={DeveloperLottie} loop={true} className="max-h-52" />
      <AppScreen.Body>
        <Image src={Home} alt="Home" />
      </AppScreen.Body>
    </AppScreen>
  );
}
