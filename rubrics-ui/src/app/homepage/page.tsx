import { getServerSession } from 'next-auth';
import React from 'react';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@dodao/web-core/types/auth/Session';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Hero } from '@/components/Hero/Hero';
import Features from '@/components/Features/Features';
import HowItWorks from '@/components/HowItWorks/HowItWorks';
import GetStarted from '@/components/GetStarted/GetStarted';
import HowItWorksVideo from '@/components/HowItWorksVideo/HowItWorksVideo';
async function Home() {
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
