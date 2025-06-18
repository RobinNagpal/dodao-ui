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
      <DoDAOHomeHero />
      <CoreOfferings />
      <DoDAOHelpButton />
      <TrustedBy />
      <DoDAOProducts />
      <Services />
      <Education />
      <Research />
      <Footer />
    </div>
  );
}
