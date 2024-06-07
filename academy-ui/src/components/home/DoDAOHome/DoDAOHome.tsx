import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { AcademySites } from './components/AcademySites';
import { AIChatbot } from './components/AIChatbot';
import { BlockchainCourses } from './components/BlockchainCourses';
import { BlockchainDevelopmentTooling } from './components/BlockchainDevelopmentTooling';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import { Footer } from './components/Footer';
import { Introduction } from './components/Introduction';
import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
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
      <AIChatbot />
      <BlockchainCourses />
      <BlockchainDevelopmentTooling />
      <Footer />
    </PageWrapper>
  );
}
