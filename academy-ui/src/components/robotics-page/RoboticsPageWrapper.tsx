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
  return (
    <main className="bg-gray-900">
      <HeroSection />
      <ServicesOverviewSection />
      <HowItWorksSection />
      <SimulationSetupSection />
      <SyntheticDataSection />
      <IndustryMethodsSection />
      <CTASection />
    </main>
  );
}
