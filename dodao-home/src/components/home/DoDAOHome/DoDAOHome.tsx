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
      {/* Hero — robotics-first */}
      <DoDAOHomeHero />

      {/* Robotics — primary offering, the two services we run today */}
      <RoboticsServicesTwo />

      {/* Featured robotics project — ketchup HPLC workflow simulation */}
      <KetchupHplcWorkflowFeature />

      {/* AI Agents + DeFi — secondary offerings, kept for continuity */}
      <CoreOfferings />

      {/* Trusted By — moved to the bottom alongside Products */}
      <div className="bg-bg">
        <TrustedBy />
      </div>

      {/* Products section */}
      <div className="bg-surface">
        <DoDAOProducts />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
