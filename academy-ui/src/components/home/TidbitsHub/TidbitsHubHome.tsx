import { Footer } from '../DoDAOHome/components/Footer';
import { Faqs } from './components/Faqs';
import { Hero } from './components/Hero';
import { PrimaryFeatures } from './components/PrimaryFeatures';
import { SecondaryFeatures } from './components/SecondaryFeatures';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Demos from './components/Demos';

export default function TidbitsHubHome({ space }: { space: SpaceWithIntegrationsFragment }) {
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
