import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import DoDAOHomeHero from './components/DoDAOHomeHero';
import DoDAOProducts from './components/DoDAOProducts';
import { Education } from './components/Education';
import { Footer } from './components/Footer';
import { Introduction } from './components/Introduction';
import { NavBar } from './components/NavBar';
import Research from './components/Research';
import Services from './components/Services';

export default function DoDAOHome() {
  return (
    <div>
      <DoDAOHomeHero />

      <PageWrapper>
        <DoDAOHelpButton />
        <Introduction />
        <NavBar />
        <DoDAOProducts />
        <Services />
        <Education />
        <Research />
        <Footer />
      </PageWrapper>
    </div>
  );
}
