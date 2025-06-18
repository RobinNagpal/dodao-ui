import CoreOfferings from './components/CoreOfferings';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import DoDAOHomeHero from './components/DoDAOHomeHero';
import DoDAOProducts from './components/DoDAOProducts';
import { Education } from './components/Education';
import { Footer } from './components/Footer';
import Research from './components/Research';
import Services from './components/Services';
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

      {/* Services section */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900">
        <Services />
      </div>

      {/* Education section */}
      <div className="bg-gradient-to-br from-indigo-100 via-blue-50 to-sky-100">
        <Education />
      </div>

      {/* Research section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800">
        <Research />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
