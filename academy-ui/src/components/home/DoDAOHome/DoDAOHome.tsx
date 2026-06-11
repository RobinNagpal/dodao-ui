import CoreOfferings from './components/CoreOfferings';
import DoDAOHomeHero from './components/DoDAOHomeHero';
import DoDAOProducts from './components/DoDAOProducts';
import { Footer } from './components/Footer';
import KetchupHplcWorkflowFeature from './components/KetchupHplcWorkflowFeature';
import RoboticsServicesTwo from './components/RoboticsServicesTwo';
import { TrustedBy } from './components/TrustedBy';

export default function DoDAOHome() {
  return (
    <div>
      {/* Hero section - already has gradient */}
      <DoDAOHomeHero />

      {/* Trusted By section */}
      <div className="bg-bg">
        <TrustedBy />
      </div>

      {/* Robotics — primary offering, the two services we run today */}
      <RoboticsServicesTwo />

      {/* Featured robotics project — ketchup HPLC workflow simulation */}
      <KetchupHplcWorkflowFeature />

      {/* AI Agents + DeFi — secondary offerings, kept for continuity */}
      <CoreOfferings />

      {/* Products section */}
      <div className="bg-surface">
        <DoDAOProducts />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
