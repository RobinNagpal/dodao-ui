import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CoreValues from './components/CoreValues';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import DoDAOHomeHero from './components/DoDAOHomeHero';
import DoDAOProducts from './components/DoDAOProducts';
import { Education } from './components/Education';
import { Footer } from './components/Footer';
import { NavBar } from './components/NavBar';
import Research from './components/Research';
import Services from './components/Services';
import { TrustedBy } from './components/TrustedBy';

export default function DoDAOHome() {
  return (
    <div>
      <DoDAOHomeHero />
      <CoreValues />

      {/* <PageWrapper> */}
      <DoDAOHelpButton />
      <TrustedBy />
      <NavBar />
      <DoDAOProducts />
      <Services />
      <Education />
      <Research />
      <Footer />
      {/* </PageWrapper> */}
    </div>
  );
}
