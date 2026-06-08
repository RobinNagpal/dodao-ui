import CoreOfferings from './components/CoreOfferings';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import DoDAOHomeHero from './components/DoDAOHomeHero';
import { Footer } from './components/Footer';
import HplcAutosamplerFeature from './components/HplcAutosamplerFeature';
import RoboticsOfferings from './components/RoboticsOfferings';
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

      {/* Robotics — primary offering, four-pillar services overview */}
      <RoboticsOfferings />

      {/* Featured robotics project — HPLC autosampler case study teaser */}
      <HplcAutosamplerFeature />

      {/* AI Agents + DeFi — secondary offerings, kept for continuity */}
      <CoreOfferings />

      {/* Help Button */}
      <div className="bg-white">
        <DoDAOHelpButton />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
