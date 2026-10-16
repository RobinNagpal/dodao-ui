import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import React from 'react';
import { Footer } from '@/components/home/common/Footer';
import Demos from './components/Demos';
import { Faqs } from './components/Faqs';
import { Hero } from './components/Hero';
import { PrimaryFeatures } from './components/PrimaryFeatures';
import { SecondaryFeatures } from './components/SecondaryFeatures';
import { TrustedBy } from '@/components/home/common/TrustedBy';

export default function TidbitsHubHome({ space }: { space: SpaceWithIntegrationsDto }) {
  return (
    <>
      <Hero space={space!} />
      <PrimaryFeatures />
      <Demos />
      <SecondaryFeatures />
      <TrustedBy />
      <Faqs />
      <Footer />
    </>
  );
}
