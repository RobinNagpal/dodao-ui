import { Footer } from '../DoDAOHome/components/Footer';
import { Faqs } from './components/Faqs';
import { Hero } from './components/Hero';
import { PrimaryFeatures } from './components/PrimaryFeatures';
import { SecondaryFeatures } from './components/SecondaryFeatures';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export default function TidbitsHubHome({ space }: { space: SpaceWithIntegrationsFragment }) {
  return (
    <>
      <Hero space={space!} />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <Faqs />
      <Footer />
    </>
  );
}
