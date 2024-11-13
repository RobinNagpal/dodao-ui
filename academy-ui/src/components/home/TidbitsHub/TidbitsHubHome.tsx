import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import React from 'react';
import { Footer } from '../DoDAOHome/components/Footer';
import Demos from './components/Demos';
import { Faqs } from './components/Faqs';
import { Hero } from './components/Hero';
import { PrimaryFeatures } from './components/PrimaryFeatures';
import { SecondaryFeatures } from './components/SecondaryFeatures';

export default function TidbitsHubHome({ space }: { space: SpaceWithIntegrationsDto }) {
  return (
    <>
      <Hero space={space!} />
      <PrimaryFeatures />
      <Demos />
      <SecondaryFeatures />
      <Faqs />
      <Footer />
    </>
  );
}
