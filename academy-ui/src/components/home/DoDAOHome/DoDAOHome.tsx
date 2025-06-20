import NewServicesGrid from '@/components/home/DoDAOHome/components/NewServicesGrid';
import CoreOfferings from './components/CoreOfferings';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import DoDAOHomeHero from './components/DoDAOHomeHero';
import DoDAOProducts from './components/DoDAOProducts';
import { Footer } from './components/Footer';
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

      {/* Core Offerings - already has gradient */}
      <CoreOfferings />

      {/* Help Button */}
      <div className="bg-white">
        <DoDAOHelpButton />
      </div>

      {/* Products section */}
      <div className="from-blue-50 via-indigo-50 to-blue-100">
        <DoDAOProducts />
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800">
        <NewServicesGrid />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
