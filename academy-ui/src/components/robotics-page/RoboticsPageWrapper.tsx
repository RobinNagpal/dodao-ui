'use client';

import { useEffect } from 'react';
import {
  CTASection,
  HeroSection,
  HowItWorksSection,
  IndustryMethodsSection,
  ServicesOverviewSection,
  SimulationSetupSection,
  SyntheticDataSection,
} from '@/components/robotics-page';

export default function RoboticsPageWrapper() {
  useEffect(() => {
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = previous;
    };
  }, []);

  return (
    <main className="bg-gray-900">
      <HeroSection />
      <ServicesOverviewSection />
      <HowItWorksSection />
      <SimulationSetupSection />
      <SyntheticDataSection />
      {/* <IndustryMethodsSection /> */}
      <CTASection />
    </main>
  );
}
