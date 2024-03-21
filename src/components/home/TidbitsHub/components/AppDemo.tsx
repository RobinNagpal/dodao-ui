'use client';

import { AppScreen } from './AppScreen';
import Image from 'next/image';
import tidbits from '@/images/TidbitsHub/GIFs/tidbits_demo.gif';

export function AppDemo() {
  return (
    <AppScreen>
      <Image src={tidbits} alt="TidbitsGif" />
    </AppScreen>
  );
}
