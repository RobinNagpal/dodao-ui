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
    <main className="bg-bg">
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
