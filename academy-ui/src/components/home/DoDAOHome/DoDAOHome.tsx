import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { AcademySites } from './components/AcademySites';
import Services from './components/Services';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import { Footer } from './components/Footer';
import { Introduction } from './components/Introduction';
import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
import TidbitsHub from './components/TidbitsHub';
import Research from './components/Research';
import { Education } from './components/Education';

export default function DoDAOHome() {
  return (
    <PageWrapper>
      <DoDAOHelpButton />
      <Hero />
      <Introduction />
      <NavBar />
      <TidbitsHub />
      <AcademySites />
      <Research />
      <Education />
      <Services />
      <Footer />
    </PageWrapper>
  );
}
