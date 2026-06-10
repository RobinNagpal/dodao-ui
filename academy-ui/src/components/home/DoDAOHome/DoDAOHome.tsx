import CoreOfferings from './components/CoreOfferings';
import DoDAOHelpButton from './components/DoDAOHelpButton';
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
      <div className="bg-gradient-to-br bg-white">
        <TrustedBy />
      </div>

      {/* Robotics — primary offering, the two services we run today */}
      <RoboticsServicesTwo />

      {/* Featured robotics project — ketchup HPLC workflow simulation */}
      <KetchupHplcWorkflowFeature />

      {/* AI Agents + DeFi — secondary offerings, kept for continuity */}
      <CoreOfferings />

      {/* Help Button */}
      <div className="bg-white">
        <DoDAOHelpButton />
      </div>

      {/* Products section */}
      <div className="from-blue-50 via-indigo-50 to-blue-100">
        <DoDAOProducts />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
