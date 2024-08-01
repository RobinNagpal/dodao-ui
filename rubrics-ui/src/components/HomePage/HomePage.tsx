import React from 'react';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Hero } from '@/components/HomePage/components/Hero';
import Features from '@/components/HomePage/components/Features';
import HowItWorks from '@/components/HomePage/components/HowItWorks';
import GetStarted from '@/components/HomePage/components/GetStarted';
import HowItWorksVideo from '@/components/HomePage/components/HowItWorksVideo';
export function Home() {
  return (
    <PageWrapper>
      <Hero />
      <Features />
      <HowItWorks />
      <HowItWorksVideo />
      <GetStarted />
    </PageWrapper>
  );
}

export default Home;
