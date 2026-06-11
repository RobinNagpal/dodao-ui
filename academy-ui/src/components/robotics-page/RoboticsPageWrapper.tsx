<<<<<<< HEAD
'use client';

import { useEffect } from 'react';
=======
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
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
<<<<<<< HEAD
  useEffect(() => {
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = previous;
    };
  }, []);

  return (
    <main className="bg-gray-900">
=======
  return (
    <main className="bg-bg">
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
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
