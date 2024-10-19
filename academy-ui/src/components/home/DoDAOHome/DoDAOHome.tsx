import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { AcademySites } from './components/AcademySites';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import { Education } from './components/Education';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { NavBar } from './components/NavBar';
import Research from './components/Research';
import Services from './components/Services';
import TidbitsHub from './components/TidbitsHub';

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
